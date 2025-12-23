import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/admin/pharmacies/approve
 * Approves a pharmacy account
 * Only accessible to admin users
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // 2. Verify user is an admin
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { userType: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    if (user.userType.name !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Only admins can approve pharmacies.",
        },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const { pharmacyId, reason } = body;

    const validationErrors: string[] = [];

    if (!pharmacyId || typeof pharmacyId !== "number" || pharmacyId <= 0) {
      validationErrors.push("Valid pharmacy ID is required.");
    }

    // Reason is optional but if provided should be a string
    if (reason !== undefined && reason !== null && typeof reason !== "string") {
      validationErrors.push("Reason must be a string if provided.");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed.",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    // 4. Get pharmacy userType
    const pharmacyType = await db.userType.findUnique({
      where: { name: "pharmacy" },
    });

    if (!pharmacyType) {
      return NextResponse.json(
        {
          success: false,
          error: "Pharmacy user type not found in system.",
        },
        { status: 500 }
      );
    }

    // 5. Verify pharmacy exists and get current status
    const pharmacy = await db.user.findFirst({
      where: {
        id: pharmacyId,
        userTypeId: pharmacyType.id,
      },
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
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        {
          success: false,
          error: "Pharmacy not found.",
        },
        { status: 404 }
      );
    }

    // 6. Check if pharmacy is already approved
    if (pharmacy.status === "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: "Pharmacy is already approved.",
          data: pharmacy,
        },
        { status: 400 }
      );
    }

    // 7. Update pharmacy status to APPROVED
    const approvedPharmacy = await db.user.update({
      where: { id: pharmacyId },
      data: { status: "APPROVED" },
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
        _count: {
          select: {
            pharmacyMedicines: true,
          },
        },
      },
    });

    // 8. Log the approval action
    console.log(`[PHARMACY_APPROVED] Admin ${user.email} approved pharmacy ${approvedPharmacy.email} (ID: ${pharmacyId})`);

    // 9. Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Pharmacy "${approvedPharmacy.name}" has been successfully approved.`,
        data: {
          pharmacy: approvedPharmacy,
          previousStatus: pharmacy.status,
          approvedBy: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          approvedAt: approvedPharmacy.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_PHARMACY_APPROVE]", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        return NextResponse.json(
          {
            success: false,
            error: "Pharmacy not found or has been deleted.",
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to approve pharmacy.",
      },
      { status: 500 }
    );
  }
}

