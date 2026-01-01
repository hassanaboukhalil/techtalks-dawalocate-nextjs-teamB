import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/admin/charities
 * Fetches all charities with filtering, searching, and pagination
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
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "createdAt"; // "createdAt" | "name" | "city" | "status"
    const sortOrder = searchParams.get("sortOrder") || "desc"; // "asc" | "desc"

    // 4. Get charity userType
    const charityType = await db.userType.findUnique({
      where: { name: "charity" },
    });

    if (!charityType) {
      return NextResponse.json(
        {
          success: false,
          error: "Charity user type not found in system.",
        },
        { status: 500 }
      );
    }

    // 5. Build query filters
    const where: {
      userTypeId: number;
      status?: string;
      city?: { contains: string; mode: "insensitive" };
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
        city?: { contains: string; mode: "insensitive" };
        phone?: { contains: string; mode: "insensitive" };
        address?: { contains: string; mode: "insensitive" };
      }>;
    } = {
      userTypeId: charityType.id,
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
    const orderBy: Record<string, "asc" | "desc"> = {};
    const validSortFields = [
      "createdAt",
      "name",
      "city",
      "status",
      "updatedAt",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const order = sortOrder === "asc" ? "asc" : "desc";
    orderBy[sortField] = order;

    // 7. Fetch charities with pagination and campaign count
    const [charities, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          phone: true,
          address: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              campaigns: true,
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
        userTypeId: charityType.id,
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
        statusCounts[stat.status as keyof typeof statusCounts] =
          stat._count.status;
      }
    });

    // 9. Return response
    return NextResponse.json(
      {
        success: true,
        data: charities.map((charity) => ({
          ...charity,
          campaignCount: charity._count.campaigns,
        })),
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + charities.length < totalCount,
        },
        stats: statusCounts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_CHARITIES_GET]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to fetch charities.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/charities
 * Updates a charity's status (approve/reject)
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
          error: "Access denied. Only admins can update charity status.",
        },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const { charityId, status } = body;

    const validationErrors: string[] = [];

    if (!charityId || typeof charityId !== "number" || charityId <= 0) {
      validationErrors.push("Valid charity ID is required.");
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

    // 4. Verify charity exists and is actually a charity
    const charityType = await db.userType.findUnique({
      where: { name: "charity" },
    });

    if (!charityType) {
      return NextResponse.json(
        {
          success: false,
          error: "Charity user type not found in system.",
        },
        { status: 500 }
      );
    }

    const charity = await db.user.findFirst({
      where: {
        id: charityId,
        userTypeId: charityType.id,
      },
    });

    if (!charity) {
      return NextResponse.json(
        {
          success: false,
          error: "Charity not found.",
        },
        { status: 404 }
      );
    }

    // 5. Update charity status
    const updatedCharity = await db.user.update({
      where: { id: charityId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        phone: true,
        address: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 6. Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Charity status updated to ${status}.`,
        data: updatedCharity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_CHARITIES_PATCH]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to update charity status.",
      },
      { status: 500 }
    );
  }
}
