import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/admin/pharmacies
 * Fetches all pharmacies with filtering, searching, and pagination
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
          error: "Access denied. Only admins can access this resource.",
        },
        { status: 403 }
      );
    }

    // 3. Parse query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "PENDING" | "APPROVED" | "REJECTED" | null (all)
    const search = searchParams.get("search"); // Search by name, email, city, phone
    const city = searchParams.get("city"); // Filter by specific city
    const hasDelivery = searchParams.get("hasDelivery"); // "true" | "false"
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "createdAt"; // "createdAt" | "name" | "city" | "status"
    const sortOrder = searchParams.get("sortOrder") || "desc"; // "asc" | "desc"

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

    // 5. Build query filters
    const where: any = {
      userTypeId: pharmacyType.id,
    };

    // Filter by status
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      where.status = status;
    }

    // Filter by city
    if (city && city.trim().length > 0) {
      where.city = {
        contains: city.trim(),
        mode: "insensitive",
      };
    }

    // Filter by delivery availability
    if (hasDelivery !== null) {
      if (hasDelivery === "true") {
        where.hasDelivery = true;
      } else if (hasDelivery === "false") {
        where.hasDelivery = false;
      }
    }

    // Search filter (name, email, city, phone)
    if (search && search.trim().length > 0) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
        { city: { contains: search.trim(), mode: "insensitive" } },
        { phone: { contains: search.trim(), mode: "insensitive" } },
        { address: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    // 6. Build orderBy clause
    const orderBy: any = {};
    const validSortFields = ["createdAt", "name", "city", "status", "updatedAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const order = sortOrder === "asc" ? "asc" : "desc";
    orderBy[sortField] = order;

    // 7. Fetch pharmacies with pagination and inventory count
    const [pharmacies, totalCount] = await Promise.all([
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
          updatedAt: true,
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

    // 8. Get statistics for admin dashboard
    const stats = await db.user.groupBy({
      by: ["status"],
      where: {
        userTypeId: pharmacyType.id,
      },
      _count: {
        status: true,
      },
    });

    const statusCounts = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      total: totalCount,
    };

    stats.forEach((stat) => {
      if (stat.status) {
        statusCounts[stat.status] = stat._count.status;
      }
    });

    // 9. Return response
    return NextResponse.json(
      {
        success: true,
        data: pharmacies.map((pharmacy) => ({
          ...pharmacy,
          medicineCount: pharmacy._count.pharmacyMedicines,
        })),
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + pharmacies.length < totalCount,
        },
        stats: statusCounts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_PHARMACIES_GET]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to fetch pharmacies.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/pharmacies
 * Updates a pharmacy's status (approve/reject)
 * Only accessible to admin users
 */
export async function PATCH(request: NextRequest) {
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
          error: "Access denied. Only admins can update pharmacy status.",
        },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const { pharmacyId, status } = body;

    const validationErrors: string[] = [];

    if (!pharmacyId || typeof pharmacyId !== "number" || pharmacyId <= 0) {
      validationErrors.push("Valid pharmacy ID is required.");
    }

    if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      validationErrors.push(
        "Status must be one of: PENDING, APPROVED, REJECTED."
      );
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

    // 4. Verify pharmacy exists and is actually a pharmacy
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

    // 5. Update pharmacy status
    const updatedPharmacy = await db.user.update({
      where: { id: pharmacyId },
      data: { status },
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

    // 6. Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Pharmacy status updated to ${status}.`,
        data: updatedPharmacy,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_PHARMACIES_PATCH]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to update pharmacy status.",
      },
      { status: 500 }
    );
  }
}

