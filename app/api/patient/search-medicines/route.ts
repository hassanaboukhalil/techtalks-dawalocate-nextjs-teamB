import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/patient/search-medicines
 * Search pharmacies in a given city that have a specific medicine
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    const { name, city, medicine } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing patient name. Must be a string."
        },
        { status: 400 }
      );
    }

    if (!city || typeof city !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing city. Must be a string."
        },
        { status: 400 }
      );
    }

    if (!medicine || typeof medicine !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing medicine. Must be a string."
        },
        { status: 400 }
      );
    }

    // Query pharmacies in the given city that have the medicine
    const pharmacies = await db.user.findMany({
      where: {
        userType: { name: "pharmacy" },
        city,
        status: "APPROVED",
        pharmacyMedicines: {
          some: {
            medicine: {
              name: { contains: medicine, mode: "insensitive" }
            },
            status: { in: ["IN_STOCK", "LOW"] }
          }
        }
      },
      select: {
        id: true,
        name: true,
        city: true,
        phone: true,
        address: true,
        openingHours: true,
        hasDelivery: true,
        pharmacyMedicines: {
          where: {
            medicine: {
              name: { contains: medicine, mode: "insensitive" }
            }
          },
          select: {
            status: true,
            quantity: true,
            expiresAt: true,
            medicine: {
              select: {
                id: true,
                name: true,
                genericName: true,
                strength: true,
                form: true,
                imageUrl: true,
                description: true
              }
            }
          }
        }
      }
    });

    if (!pharmacies || pharmacies.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No pharmacies found with the requested medicine in this city."
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pharmacies retrieved successfully.",
        patient: name,
        search: { city, medicine },
        data: pharmacies
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error searching medicines:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to search medicines."
      },
      { status: 500 }
    );
  }
}
