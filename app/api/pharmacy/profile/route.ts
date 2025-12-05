import { NextResponse } from "next/server";
import { getCurrentUser, isPharmacy } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/pharmacy/profile
 * 
 * Fetches the profile data for the currently logged-in pharmacy.
 * Only accessible by users with userType "pharmacy".
 * 
 * Returns:
 * - 200: Pharmacy profile with inventory data
 * - 401: Unauthorized (not logged in or not a pharmacy)
 * - 404: Pharmacy not found
 * - 500: Internal server error
 */
export async function GET() {
  try {
    // Get the current authenticated user
    const currentUser = await getCurrentUser();

    // Check if user is authenticated
    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to access this resource" },
        { status: 401 }
      );
    }

    // Check if user is a pharmacy
    if (!isPharmacy(currentUser)) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Only pharmacies can access this resource" },
        { status: 401 }
      );
    }

    // Fetch pharmacy data with inventory
    const pharmacy = await db.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        phone: true,
        address: true,
        openingHours: true,
        hasDelivery: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userType: {
          select: {
            id: true,
            name: true,
          },
        },
        pharmacyMedicines: {
          select: {
            id: true,
            quantity: true,
            status: true,
            expiresAt: true,
            createdAt: true,
            updatedAt: true,
            medicine: {
              select: {
                id: true,
                name: true,
                genericName: true,
                strength: true,
                form: true,
                synonyms: true,
              },
            },
          },
          orderBy: {
            medicine: {
              name: "asc",
            },
          },
        },
      },
    });

    // Check if pharmacy exists (should always exist if getCurrentUser worked)
    if (!pharmacy) {
      return NextResponse.json(
        { error: "Not Found", message: "Pharmacy profile not found" },
        { status: 404 }
      );
    }

    // Return the pharmacy profile with inventory
    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: pharmacy.id,
          name: pharmacy.name,
          email: pharmacy.email,
          city: pharmacy.city,
          phone: pharmacy.phone,
          address: pharmacy.address,
          openingHours: pharmacy.openingHours,
          hasDelivery: pharmacy.hasDelivery,
          status: pharmacy.status,
          userType: pharmacy.userType,
          createdAt: pharmacy.createdAt,
          updatedAt: pharmacy.updatedAt,
        },
        inventory: pharmacy.pharmacyMedicines.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          status: item.status,
          expiresAt: item.expiresAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          medicine: item.medicine,
        })),
        inventoryCount: pharmacy.pharmacyMedicines.length,
      },
    });
  } catch (error) {
    console.error("Error fetching pharmacy profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

