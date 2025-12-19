import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper function to safely parse opening hours
const parseOpeningHours = (openingHours: string | null) => {
  if (!openingHours) return null;

  // If it's already parsed (object/array), return as is
  if (typeof openingHours === "object") return openingHours;

  // Try to parse JSON string
  try {
    return JSON.parse(openingHours);
  } catch (error) {
    // If parsing fails, return null (treat as invalid)
    console.warn("Failed to parse openingHours JSON:", error);
    return null;
  }
};

/**
 * GET /api/pharmacy/profile
 * Returns the logged-in pharmacy profile
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const pharmacyId = parseInt(session.user.id);

    // Load the user with its userType
    const pharmacy = await db.user.findUnique({
      where: { id: pharmacyId },
      include: {
        userType: true,
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { success: false, error: "Pharmacy not found." },
        { status: 404 }
      );
    }

    if (pharmacy.userType.name !== "pharmacy") {
      return NextResponse.json(
        { success: false, error: "User is not a pharmacy." },
        { status: 403 }
      );
    }

    // Shape the data that the UI will use
    const profile = {
      id: pharmacy.id,
      name: pharmacy.name,
      email: pharmacy.email,
      city: pharmacy.city,
      phone: pharmacy.phone,
      address: pharmacy.address,
      openingHours: parseOpeningHours(pharmacy.openingHours),
      hasDelivery: pharmacy.hasDelivery,
      status: pharmacy.status,
      userType: pharmacy.userType.name,
      createdAt: pharmacy.createdAt,
      updatedAt: pharmacy.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching pharmacy profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to fetch pharmacy profile.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pharmacy/profile
 * Updates the logged-in pharmacy profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const pharmacyId = parseInt(session.user.id);

    // Load the user with its userType
    const pharmacy = await db.user.findUnique({
      where: { id: pharmacyId },
      include: {
        userType: true,
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { success: false, error: "Pharmacy not found." },
        { status: 404 }
      );
    }

    if (pharmacy.userType.name !== "pharmacy") {
      return NextResponse.json(
        { success: false, error: "User is not a pharmacy." },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, email, phone, city, address, openingHours, hasDelivery } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Pharmacy name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required." },
        { status: 400 }
      );
    }

    if (phone && (typeof phone !== "string" || phone.length < 8)) {
      return NextResponse.json(
        { success: false, error: "Phone number must be at least 8 characters." },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (email !== pharmacy.email) {
      const existingUser = await db.user.findUnique({
        where: { email: email },
      });

      if (existingUser && existingUser.id !== pharmacyId) {
        return NextResponse.json(
          { success: false, error: "Email address is already in use." },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || null,
      city: city || null,
      address: address || null,
      openingHours: openingHours || null,
      hasDelivery: hasDelivery || false,
      updatedAt: new Date(),
    };

    // Update the pharmacy profile
    const updatedPharmacy = await db.user.update({
      where: { id: pharmacyId },
      data: updateData,
      include: {
        userType: true,
      },
    });

    // Shape the response data
    const profile = {
      id: updatedPharmacy.id,
      name: updatedPharmacy.name,
      email: updatedPharmacy.email,
      city: updatedPharmacy.city,
      phone: updatedPharmacy.phone,
      address: updatedPharmacy.address,
      openingHours: parseOpeningHours(updatedPharmacy.openingHours),
      hasDelivery: updatedPharmacy.hasDelivery,
      status: updatedPharmacy.status,
      userType: updatedPharmacy.userType.name,
      createdAt: updatedPharmacy.createdAt,
      updatedAt: updatedPharmacy.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating pharmacy profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to update pharmacy profile.",
      },
      { status: 500 }
    );
  }
}