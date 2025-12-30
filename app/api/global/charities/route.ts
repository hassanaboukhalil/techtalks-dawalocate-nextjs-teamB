import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/global/charities
 * Fetches all approved charities (PUBLIC)
 * This endpoint does NOT require authentication
 */
export async function GET(request: NextRequest) {
  try {
    const charities = await db.user.findMany({
      where: {
        userType: {
          name: "charity",
        },
        status: "APPROVED",
      },
      select: {
        id: true,
        name: true,
        city: true,
        phone: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: charities,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GLOBAL_CHARITIES_GET]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to fetch charities.",
      },
      { status: 500 }
    );
  }
}
