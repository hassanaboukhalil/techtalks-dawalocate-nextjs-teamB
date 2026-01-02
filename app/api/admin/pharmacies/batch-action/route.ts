import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/admin/pharmacies/batch-action
 * Performs batch approval or rejection of multiple pharmacies
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
          error: "Access denied. Only admins can perform batch actions.",
        },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const { pharmacyIds, action, reason } = body;

    const validationErrors: string[] = [];

    // Validate pharmacyIds
    if (!pharmacyIds || !Array.isArray(pharmacyIds)) {
      validationErrors.push("Pharmacy IDs must be an array.");
    } else if (pharmacyIds.length === 0) {
      validationErrors.push("At least one pharmacy ID is required.");
    } else if (pharmacyIds.length > 50) {
      validationErrors.push("Maximum 50 pharmacies can be processed at once.");
    } else if (
      pharmacyIds.some((id) => typeof id !== "number" || id <= 0)
    ) {
      validationErrors.push("All pharmacy IDs must be valid positive numbers.");
    } else if (new Set(pharmacyIds).size !== pharmacyIds.length) {
      validationErrors.push("Duplicate pharmacy IDs are not allowed.");
    }

    // Validate action
    if (!action || !["APPROVE", "REJECT", "PENDING"].includes(action)) {
      validationErrors.push("Action must be one of: APPROVE, REJECT, PENDING.");
    }

    // Validate reason (optional for approve/pending, recommended for reject)
    if (reason !== undefined && reason !== null) {
      if (typeof reason !== "string") {
        validationErrors.push("Reason must be a string if provided.");
      } else if (reason.trim().length > 500) {
        validationErrors.push("Reason must not exceed 500 characters.");
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

    // 5. Map action to status
    const statusMap: Record<string, "PENDING" | "APPROVED" | "REJECTED"> = {
      APPROVE: "APPROVED",
      REJECT: "REJECTED",
      PENDING: "PENDING",
    };

    const newStatus = statusMap[action];

    // 6. Verify all pharmacies exist and are pharmacy type
    const pharmacies = await db.user.findMany({
      where: {
        id: { in: pharmacyIds },
        userTypeId: pharmacyType.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    // Check for missing pharmacies
    const foundIds = pharmacies.map((p) => p.id);
    const missingIds = pharmacyIds.filter((id: number) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Some pharmacies were not found.",
          details: [`Missing pharmacy IDs: ${missingIds.join(", ")}`],
        },
        { status: 404 }
      );
    }

    // 7. Filter pharmacies that need status change
    const pharmaciesToUpdate = pharmacies.filter((p) => p.status !== newStatus);
    const alreadyProcessed = pharmacies.filter((p) => p.status === newStatus);

    if (pharmaciesToUpdate.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: `All pharmacies are already ${newStatus.toLowerCase()}.`,
          data: {
            updated: [],
            alreadyProcessed: alreadyProcessed.map((p) => ({
              id: p.id,
              name: p.name,
              email: p.email,
              status: p.status,
            })),
            failed: [],
          },
        },
        { status: 200 }
      );
    }

    // 8. Perform batch update in a transaction
    const results = await db.$transaction(async (tx) => {
      const updated = [];
      const failed = [];

      for (const pharmacy of pharmaciesToUpdate) {
        try {
          const updatedPharmacy = await tx.user.update({
            where: { id: pharmacy.id },
            data: { status: newStatus },
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              updatedAt: true,
            },
          });

          updated.push({
            ...updatedPharmacy,
            previousStatus: pharmacy.status,
          });

          // Log the action
          console.log(
            `[BATCH_${action}] Admin ${user.email} ${action.toLowerCase()}d pharmacy ${updatedPharmacy.email} (ID: ${updatedPharmacy.id})`
          );
        } catch (error) {
          console.error(`Failed to update pharmacy ${pharmacy.id}:`, error);
          failed.push({
            id: pharmacy.id,
            name: pharmacy.name,
            email: pharmacy.email,
            error: "Failed to update status",
          });
        }
      }

      return { updated, failed };
    });

    // 9. Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Batch ${action.toLowerCase()} completed. Updated ${results.updated.length} pharmacies.`,
        data: {
          updated: results.updated,
          alreadyProcessed: alreadyProcessed.map((p) => ({
            id: p.id,
            name: p.name,
            email: p.email,
            status: p.status,
          })),
          failed: results.failed,
          summary: {
            total: pharmacyIds.length,
            updated: results.updated.length,
            alreadyProcessed: alreadyProcessed.length,
            failed: results.failed.length,
          },
          actionDetails: {
            action: newStatus,
            performedBy: {
              id: user.id,
              name: user.name,
              email: user.email,
            },
            reason: reason?.trim() || undefined,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_PHARMACY_BATCH_ACTION]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to perform batch action.",
      },
      { status: 500 }
    );
  }
}

