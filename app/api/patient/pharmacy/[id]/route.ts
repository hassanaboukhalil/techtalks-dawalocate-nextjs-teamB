import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Helper function to safely parse opening hours
const parseOpeningHours = (openingHours: unknown) => {
  if (!openingHours) return null;

  // If it's already parsed (object/array), return as is
  if (typeof openingHours === "object") return openingHours;

  // If it's a string, try to parse as JSON
  if (typeof openingHours === "string") {
    try {
      return JSON.parse(openingHours);
    } catch (error) {
      // If parsing fails, return the string as-is
      console.warn("Failed to parse openingHours JSON, returning as string:", error);
      return openingHours;
    }
  }

  // For any other type, return as string
  return String(openingHours);
};

/**
 * GET /api/patient/pharmacy/[id]
 * Get pharmacy information by ID for patients
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please log in."
        },
        { status: 401 }
      );
    }

    // Get patient ID from authenticated user
    const patientId = parseInt(session.user.id);

    // FIX: Await the params Promise
    const resolvedParams = await params;
    const pharmacyId = parseInt(resolvedParams.id);

    if (isNaN(pharmacyId) || pharmacyId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid pharmacy ID."
        },
        { status: 400 }
      );
    }

    // Verify patient exists and is a patient user
    const patient = await db.user.findUnique({
      where: { id: patientId },
      include: { userType: true }
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: "Patient not found."
        },
        { status: 404 }
      );
    }

    if (patient.userType.name !== "patient") {
      return NextResponse.json(
        {
          success: false,
          error: "User is not a patient."
        },
        { status: 403 }
      );
    }

    // Get pharmacy information
    const pharmacy = await db.user.findUnique({
      where: {
        id: pharmacyId,
        userType: { name: "pharmacy" },
        status: "APPROVED" // Only return approved pharmacies
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        address: true,
        openingHours: true,
        hasDelivery: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        {
          success: false,
          error: "Pharmacy not found or not approved."
        },
        { status: 404 }
      );
    }

    // Shape the response data
    const pharmacyData = {
      id: pharmacy.id,
      name: pharmacy.name,
      email: pharmacy.email,
      phone: pharmacy.phone,
      city: pharmacy.city,
      address: pharmacy.address,
      openingHours: parseOpeningHours(pharmacy.openingHours),
      hasDelivery: pharmacy.hasDelivery,
      status: pharmacy.status,
      createdAt: pharmacy.createdAt,
      updatedAt: pharmacy.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: pharmacyData
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching pharmacy:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to fetch pharmacy information."
      },
      { status: 500 }
    );
  }
}
