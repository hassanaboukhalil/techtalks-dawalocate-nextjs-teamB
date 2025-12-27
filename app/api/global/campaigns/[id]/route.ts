import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/global/campaigns/[id]
 * Fetches a single campaign by ID (PUBLIC)
 * This endpoint does NOT require authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignId = parseInt(id);

    if (isNaN(campaignId)) {
      return NextResponse.json(
        { success: false, error: "Invalid campaign ID." },
        { status: 400 }
      );
    }

    // Fetch campaign from approved charities only
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: {
        charity: {
          select: {
            id: true,
            name: true,
            city: true,
            phone: true,
            email: true,
            address: true,
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
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found." },
        { status: 404 }
      );
    }

    // Verify charity is approved
    const charity = await db.user.findUnique({
      where: { id: campaign.charityUserId },
      include: { userType: true },
    });

    if (
      !charity ||
      charity.userType.name !== "charity" ||
      charity.status !== "APPROVED"
    ) {
      return NextResponse.json(
        { success: false, error: "Campaign not available." },
        { status: 404 }
      );
    }

    // Return campaign
    return NextResponse.json(
      {
        success: true,
        data: campaign,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GLOBAL_CAMPAIGN_GET_BY_ID]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to fetch campaign.",
      },
      { status: 500 }
    );
  }
}

