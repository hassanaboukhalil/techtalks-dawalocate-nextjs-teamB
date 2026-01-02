import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/admin/pharmacies/[id]
 * Fetches a single pharmacy by ID with detailed information
 * Only accessible to admin users
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
          error: "Access denied. Only admins can access this resource.",
        },
        { status: 403 }
      );
    }

    // 3. Validate pharmacy ID
    const { id } = await params;
    const pharmacyId = parseInt(id);

    if (isNaN(pharmacyId) || pharmacyId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid pharmacy ID.",
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

    // 5. Fetch pharmacy with detailed information
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
        updatedAt: true,
        pharmacyMedicines: {
          select: {
            id: true,
            status: true,
            quantity: true,
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
                imageUrl: true,
                description: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
        _count: {
          select: {
            pharmacyMedicines: true,
          },
        },
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

    // 6. Calculate inventory statistics
    const inventoryStats = {
      total: pharmacy.pharmacyMedicines.length,
      inStock: pharmacy.pharmacyMedicines.filter(
        (pm) => pm.status === "IN_STOCK"
      ).length,
      low: pharmacy.pharmacyMedicines.filter((pm) => pm.status === "LOW")
        .length,
      out: pharmacy.pharmacyMedicines.filter((pm) => pm.status === "OUT")
        .length,
      totalQuantity: pharmacy.pharmacyMedicines.reduce(
        (sum, pm) => sum + pm.quantity,
        0
      ),
    };

    // 7. Return response
    return NextResponse.json(
      {
        success: true,
        data: {
          ...pharmacy,
          inventoryStats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_PHARMACY_GET]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to fetch pharmacy details.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/pharmacies/[id]
 * Deletes a pharmacy account
 * Only accessible to admin users
 * Note: This will cascade delete all related pharmacy medicines
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
          error: "Access denied. Only admins can delete pharmacies.",
        },
        { status: 403 }
      );
    }

    // 3. Validate pharmacy ID
    const { id } = await params;
    const pharmacyId = parseInt(id);

    if (isNaN(pharmacyId) || pharmacyId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid pharmacy ID.",
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

    // 5. Verify pharmacy exists
    const pharmacy = await db.user.findFirst({
      where: {
        id: pharmacyId,
        userTypeId: pharmacyType.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            pharmacyMedicines: true,
          },
        },
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

    // 6. Delete pharmacy (cascades to related records)
    await db.user.delete({
      where: { id: pharmacyId },
    });

    // 7. Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Pharmacy "${pharmacy.name}" has been successfully deleted.`,
        data: {
          id: pharmacy.id,
          name: pharmacy.name,
          email: pharmacy.email,
          deletedMedicinesCount: pharmacy._count.pharmacyMedicines,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_PHARMACY_DELETE]", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Cannot delete pharmacy. Please remove related records first.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to delete pharmacy.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/pharmacies/[id]
 * Updates pharmacy details (admin can edit any field)
 * Only accessible to admin users
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
          error: "Access denied. Only admins can update pharmacy details.",
        },
        { status: 403 }
      );
    }

    // 3. Validate pharmacy ID
    const { id } = await params;
    const pharmacyId = parseInt(id);

    if (isNaN(pharmacyId) || pharmacyId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid pharmacy ID.",
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

    // 5. Verify pharmacy exists
    const pharmacy = await db.user.findFirst({
      where: {
        id: pharmacyId,
        userTypeId: pharmacyType.id,
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

    // 6. Parse and validate request body
    const body = await request.json();
    const {
      name,
      email,
      city,
      phone,
      address,
      openingHours,
      hasDelivery,
      status,
    } = body;

    const validationErrors: string[] = [];
    const updateData: {
      name?: string;
      email?: string;
      city?: string | null;
      phone?: string | null;
      address?: string | null;
      openingHours?: string | null;
      hasDelivery?: boolean;
      status?: "PENDING" | "APPROVED" | "REJECTED";
    } = {};

    // Validate and prepare update data
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        validationErrors.push("Name must be a non-empty string.");
      } else if (name.trim().length < 2) {
        validationErrors.push("Name must be at least 2 characters.");
      } else if (name.trim().length > 100) {
        validationErrors.push("Name must not exceed 100 characters.");
      } else {
        updateData.name = name.trim();
      }
    }

    if (email !== undefined) {
      if (typeof email !== "string" || email.trim().length === 0) {
        validationErrors.push("Email must be a non-empty string.");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        validationErrors.push("Invalid email format.");
      } else {
        // Check if email is already in use by another user
        const existingUser = await db.user.findFirst({
          where: {
            email: email.trim(),
            id: { not: pharmacyId },
          },
        });

        if (existingUser) {
          validationErrors.push("Email is already in use by another user.");
        } else {
          updateData.email = email.trim();
        }
      }
    }

    if (city !== undefined) {
      if (city !== null) {
        if (typeof city !== "string") {
          validationErrors.push("City must be a string.");
        } else if (city.trim().length > 100) {
          validationErrors.push("City must not exceed 100 characters.");
        } else {
          updateData.city = city.trim() || undefined;
        }
      } else {
        updateData.city = null;
      }
    }

    if (phone !== undefined) {
      if (phone !== null) {
        if (typeof phone !== "string") {
          validationErrors.push("Phone must be a string.");
        } else if (phone.trim().length > 20) {
          validationErrors.push("Phone must not exceed 20 characters.");
        } else {
          updateData.phone = phone.trim() || null;
        }
      } else {
        updateData.phone = null;
      }
    }

    if (address !== undefined) {
      if (address !== null) {
        if (typeof address !== "string") {
          validationErrors.push("Address must be a string.");
        } else if (address.trim().length > 255) {
          validationErrors.push("Address must not exceed 255 characters.");
        } else {
          updateData.address = address.trim() || undefined;
        }
      } else {
        updateData.address = null;
      }
    }

    if (openingHours !== undefined) {
      if (openingHours !== null) {
        if (typeof openingHours !== "string") {
          validationErrors.push("Opening hours must be a string.");
        } else if (openingHours.trim().length > 100) {
          validationErrors.push(
            "Opening hours must not exceed 100 characters."
          );
        } else {
          updateData.openingHours = openingHours.trim() || undefined;
        }
      } else {
        updateData.openingHours = null;
      }
    }

    if (hasDelivery !== undefined) {
      if (typeof hasDelivery !== "boolean") {
        validationErrors.push("Has delivery must be a boolean.");
      } else {
        updateData.hasDelivery = hasDelivery;
      }
    }

    if (status !== undefined) {
      if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        validationErrors.push(
          "Status must be one of: PENDING, APPROVED, REJECTED."
        );
      } else {
        updateData.status = status;
      }
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

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid fields to update.",
        },
        { status: 400 }
      );
    }

    // 7. Update pharmacy
    const updatedPharmacy = await db.user.update({
      where: { id: pharmacyId },
      data: updateData,
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
      },
    });

    // 8. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Pharmacy details updated successfully.",
        data: updatedPharmacy,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_PHARMACY_PATCH]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to update pharmacy details.",
      },
      { status: 500 }
    );
  }
}
