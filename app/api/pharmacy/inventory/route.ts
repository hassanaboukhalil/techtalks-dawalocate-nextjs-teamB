import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { InventoryStatus } from "@/lib/generated/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


/**
 * POST /api/pharmacy/inventory
 * Add new medicine to pharmacy inventory
 */
export async function POST(request: NextRequest) {
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

    // Get pharmacy ID from authenticated user
    const pharmacyId = parseInt(session.user.id);

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const { medicineId, quantity, status, expiresAt } = body;

    if (!medicineId || typeof medicineId !== "number") {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid or missing medicineId. Must be a number." 
        },
        { status: 400 }
      );
    }

    if (quantity === undefined || typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid or missing quantity. Must be a non-negative number." 
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    const validStatuses: InventoryStatus[] = ["IN_STOCK", "LOW", "OUT"];
    const inventoryStatus: InventoryStatus = status || (quantity > 0 ? "IN_STOCK" : "OUT");
    
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
        },
        { status: 400 }
      );
    }

    // Validate expiresAt if provided
    let expiryDate: Date | undefined;
    if (expiresAt) {
      expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime())) {
        return NextResponse.json(
          { 
            success: false,
            error: "Invalid expiresAt date format. Use ISO 8601 format." 
          },
          { status: 400 }
        );
      }
    }

    // Verify pharmacy exists and is a pharmacy user
    const pharmacy = await db.user.findUnique({
      where: { id: pharmacyId },
      include: { userType: true }
    });

    if (!pharmacy) {
      return NextResponse.json(
        { 
          success: false,
          error: "Pharmacy not found." 
        },
        { status: 404 }
      );
    }

    if (pharmacy.userType.name !== "pharmacy") {
      return NextResponse.json(
        { 
          success: false,
          error: "User is not a pharmacy." 
        },
        { status: 403 }
      );
    }

    // Verify medicine exists
    const medicine = await db.medicine.findUnique({
      where: { id: medicineId }
    });

    if (!medicine) {
      return NextResponse.json(
        { 
          success: false,
          error: "Medicine not found." 
        },
        { status: 404 }
      );
    }

    // Check if this pharmacy-medicine combination already exists
    const existingInventory = await db.pharmacyMedicine.findFirst({
      where: {
        pharmacyId,
        medicineId
      }
    });

    if (existingInventory) {
      return NextResponse.json(
        { 
          success: false,
          error: "This medicine already exists in the pharmacy inventory" 
        },
        { status: 409 }
      );
    }

    // Create new pharmacy medicine inventory entry
    const pharmacyMedicine = await db.pharmacyMedicine.create({
      data: {
        pharmacyId,
        medicineId,
        quantity,
        status: inventoryStatus,
        expiresAt: expiryDate
      },
      include: {
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
        },
        pharmacy: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
            address: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Medicine added to inventory successfully.",
        data: pharmacyMedicine
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding medicine to inventory:", error);

    // Handle Prisma-specific errors
    if (error instanceof Error) {
      // Foreign key constraint errors
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { 
            success: false,
            error: "Invalid pharmacy or medicine reference." 
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error. Failed to add medicine to inventory." 
      },
      { status: 500 }
    );
  }
}
