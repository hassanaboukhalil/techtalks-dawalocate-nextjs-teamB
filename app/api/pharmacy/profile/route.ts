import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
      openingHours: pharmacy.openingHours,
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
