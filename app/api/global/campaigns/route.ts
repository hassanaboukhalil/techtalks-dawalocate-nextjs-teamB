import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/global/campaigns
 * Fetches all active and upcoming campaigns from approved charities (PUBLIC)
 * This endpoint does NOT require authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "active" | "upcoming" | "all"
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const city = searchParams.get("city") || "";
    const medicine = searchParams.get("medicine") || "";
    const charity = searchParams.get("charity") || "";

    // Build query filters
    const where: any = {};

    const now = new Date();

    // Filter by campaign status
    if (status === "active") {
      where.startDate = { lte: now };
      where.OR = [{ endDate: null }, { endDate: { gte: now } }];
    } else if (status === "upcoming") {
      where.startDate = { gt: now };
    } else {
      // Default: show active and upcoming campaigns only (not past)
      where.OR = [
        // Active campaigns
        {
          startDate: { lte: now },
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
        // Upcoming campaigns
        {
          startDate: { gt: now },
        },
      ];
    }

    // Build charity filter object properly - merge all conditions
    const charityFilter: any = {
      status: "APPROVED",
      userType: {
        name: "charity",
      },
    };

    // Add city filter to charity filter (merge, don't overwrite)
    if (city) {
      charityFilter.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    // Add charity name filter to charity filter (merge, don't overwrite)
    if (charity) {
      charityFilter.name = {
        contains: charity,
        mode: "insensitive",
      };
    }

    // Apply the complete charity filter
    where.charity = charityFilter;

    // Fetch campaigns with pagination
    const [campaigns, totalCount] = await Promise.all([
      db.campaign.findMany({
        where,
        include: {
          charity: {
            select: {
              id: true,
              name: true,
              city: true,
              phone: true,
              email: true,
            },
          },
          campaignMedicines: {
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true,
                  genericName: true,
                  strength: true,
                  form: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        orderBy: [
          { startDate: "asc" }, // Soonest campaigns first
        ],
        take: limit,
        skip: offset,
      }),
      db.campaign.count({ where }),
    ]);

    // Filter by medicine name on the result set (since it's a nested relation)
    let filteredCampaigns = campaigns;
    let filteredTotalCount = totalCount;
    
    if (medicine) {
      filteredCampaigns = campaigns.filter((campaign) =>
        campaign.campaignMedicines.some(
          (cm) =>
            cm.medicine.name.toLowerCase().includes(medicine.toLowerCase()) ||
            (cm.medicine.genericName &&
              cm.medicine.genericName.toLowerCase().includes(medicine.toLowerCase()))
        )
      );
      // For medicine filter, we need to count all matching campaigns (not just the current page)
      // Since we can't easily do this in Prisma for nested relations, we'll use the filtered count
      filteredTotalCount = filteredCampaigns.length;
    }

    // Return response
    return NextResponse.json(
      {
        success: true,
        data: filteredCampaigns,
        pagination: {
          total: filteredTotalCount,
          limit,
          offset,
          hasMore: offset + filteredCampaigns.length < filteredTotalCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GLOBAL_CAMPAIGNS_GET]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to fetch campaigns.",
      },
      { status: 500 }
    );
  }
}

