import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/admin/pharmacies/pending
 * Fetches all pending pharmacy applications that need review
 * Only accessible to admin users
 */
export async function GET(request: NextRequest) {
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
          error: "Access denied. Only admins can access pending pharmacies.",
        },
        { status: 403 }
      );
    }

    // 3. Parse query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "createdAt"; // "createdAt" | "name" | "city"
    const sortOrder = searchParams.get("sortOrder") || "asc"; // "asc" | "desc" (oldest first by default)

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

    // 5. Build query for pending pharmacies
    const where = {
      userTypeId: pharmacyType.id,
      status: "PENDING" as const,
    };

    // 6. Build orderBy clause
    const orderBy: any = {};
    const validSortFields = ["createdAt", "name", "city"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const order = sortOrder === "desc" ? "desc" : "asc";
    orderBy[sortField] = order;

    // 7. Fetch pending pharmacies with pagination
    const [pendingPharmacies, totalCount] = await Promise.all([
      db.user.findMany({
        where,
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
          _count: {
            select: {
              pharmacyMedicines: true,
            },
          },
        },
        orderBy,
        take: Math.min(limit, 100), // Maximum 100 per request
        skip: offset,
      }),
      db.user.count({ where }),
    ]);

    // 8. Calculate waiting time for each pharmacy
    const now = new Date();
    const pharmaciesWithWaitTime = pendingPharmacies.map((pharmacy) => {
      const waitingDays = Math.floor(
        (now.getTime() - pharmacy.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...pharmacy,
        medicineCount: pharmacy._count.pharmacyMedicines,
        waitingDays,
        waitingHours: Math.floor(
          (now.getTime() - pharmacy.createdAt.getTime()) / (1000 * 60 * 60)
        ),
      };
    });

    // 9. Sort by urgency if requested
    if (sortBy === "urgency") {
      pharmaciesWithWaitTime.sort((a, b) => {
        // Prioritize older applications
        return sortOrder === "desc"
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime();
      });
    }

    // 10. Calculate statistics
    const stats = {
      totalPending: totalCount,
      oldestApplicationDays: totalCount > 0
        ? Math.floor(
            (now.getTime() - new Date(Math.min(...pendingPharmacies.map(p => p.createdAt.getTime()))).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0,
      averageWaitingDays: totalCount > 0
        ? Math.floor(
            pharmaciesWithWaitTime.reduce((sum, p) => sum + p.waitingDays, 0) /
              pharmaciesWithWaitTime.length
          )
        : 0,
    };

    // 11. Return response
    return NextResponse.json(
      {
        success: true,
        data: pharmaciesWithWaitTime,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + pendingPharmacies.length < totalCount,
        },
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_PENDING_PHARMACIES_GET]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to fetch pending pharmacies.",
      },
      { status: 500 }
    );
  }
}

