import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * POST /api/charity/campaigns
 * Creates a new campaign for the authenticated charity
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

    // 2. Verify user is a charity
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

    if (user.userType.name !== "charity") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Only charities can create campaigns.",
        },
        { status: 403 }
      );
    }

    // 3. Check charity approval status
    if (user.status !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: `Your charity account is ${
            user.status?.toLowerCase() || "pending"
          }. Only approved charities can create campaigns.`,
        },
        { status: 403 }
      );
    }

    // 4. Parse and validate request body
    const body = await request.json();
    const {
      title,
      description,
      targetAreas,
      startDate,
      endDate,
      contactInfo,
      medicineIds,
    } = body;

    // 5. Validate required fields
    const validationErrors: string[] = [];

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      validationErrors.push("Campaign title is required.");
    } else if (title.trim().length < 5) {
      validationErrors.push("Campaign title must be at least 5 characters.");
    } else if (title.trim().length > 200) {
      validationErrors.push("Campaign title must not exceed 200 characters.");
    }

    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length === 0
    ) {
      validationErrors.push("Campaign description is required.");
    } else if (description.trim().length < 20) {
      validationErrors.push(
        "Campaign description must be at least 20 characters."
      );
    } else if (description.trim().length > 2000) {
      validationErrors.push(
        "Campaign description must not exceed 2000 characters."
      );
    }

    if (
      !targetAreas ||
      typeof targetAreas !== "string" ||
      targetAreas.trim().length === 0
    ) {
      validationErrors.push("Target areas are required.");
    }

    if (!startDate) {
      validationErrors.push("Campaign start date is required.");
    } else {
      const parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        validationErrors.push("Invalid start date format.");
      } else if (parsedStartDate < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        validationErrors.push("Start date cannot be in the past.");
      }
    }

    if (endDate) {
      const parsedEndDate = new Date(endDate);
      const parsedStartDate = new Date(startDate);

      if (isNaN(parsedEndDate.getTime())) {
        validationErrors.push("Invalid end date format.");
      } else if (parsedEndDate <= parsedStartDate) {
        validationErrors.push("End date must be after start date.");
      }
    }

    if (
      !contactInfo ||
      typeof contactInfo !== "string" ||
      contactInfo.trim().length === 0
    ) {
      validationErrors.push("Contact information is required.");
    } else if (contactInfo.trim().length < 5) {
      validationErrors.push(
        "Contact information must be at least 5 characters."
      );
    }

    // Validate medicine IDs if provided
    if (medicineIds !== undefined && medicineIds !== null) {
      if (!Array.isArray(medicineIds)) {
        validationErrors.push("Medicine IDs must be an array.");
      } else if (medicineIds.some((id) => typeof id !== "number" || id <= 0)) {
        validationErrors.push(
          "All medicine IDs must be valid positive numbers."
        );
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

    // 6. Verify medicines exist if provided
    if (medicineIds && medicineIds.length > 0) {
      const medicines = await db.medicine.findMany({
        where: { id: { in: medicineIds } },
        select: { id: true },
      });

      if (medicines.length !== medicineIds.length) {
        const foundIds = medicines.map((m) => m.id);
        const missingIds = medicineIds.filter(
          (id: number) => !foundIds.includes(id)
        );
        return NextResponse.json(
          {
            success: false,
            error: "Some medicines were not found.",
            details: [`Missing medicine IDs: ${missingIds.join(", ")}`],
          },
          { status: 400 }
        );
      }
    }

    // 7. Create campaign with medicines in a transaction
    const campaign = await db.$transaction(async (tx) => {
      // Create the campaign
      const newCampaign = await tx.campaign.create({
        data: {
          charityUserId: userId,
          title: title.trim(),
          description: description.trim(),
          targetAreas: targetAreas.trim(),
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          contactInfo: contactInfo.trim(),
        },
      });

      // Add medicines to campaign if provided
      if (medicineIds && medicineIds.length > 0) {
        await tx.campaignMedicine.createMany({
          data: medicineIds.map((medicineId: number) => ({
            campaignId: newCampaign.id,
            medicineId: medicineId,
          })),
        });
      }

      // Fetch the complete campaign with relations
      return await tx.campaign.findUnique({
        where: { id: newCampaign.id },
        include: {
          charity: {
            select: {
              id: true,
              name: true,
              email: true,
              city: true,
              phone: true,
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
    });

    // 8. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Campaign created successfully.",
        data: campaign,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CAMPAIGN_POST]", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid data. Please check your input.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to create campaign.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/charity/campaigns
 * Fetches all campaigns for the authenticated charity
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

    // 2. Verify user is a charity
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

    if (user.userType.name !== "charity") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Only charities can access campaigns.",
        },
        { status: 403 }
      );
    }

    // 3. Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "active" | "upcoming" | "past" | "all"
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // 4. Build query filters
    const where: Prisma.CampaignWhereInput = {
      charityUserId: userId,
    };

    const now = new Date();

    if (status === "active") {
      where.startDate = { lte: now };
      where.OR = [{ endDate: null }, { endDate: { gte: now } }];
    } else if (status === "upcoming") {
      where.startDate = { gt: now };
    } else if (status === "past") {
      where.endDate = { lt: now };
    }

    // 5. Fetch campaigns with pagination
    const [campaigns, totalCount] = await Promise.all([
      db.campaign.findMany({
        where,
        include: {
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
        orderBy: { startDate: "desc" },
        take: Math.min(limit, 100), // Maximum 100 per request
        skip: offset,
      }),
      db.campaign.count({ where }),
    ]);

    // 6. Return response
    return NextResponse.json(
      {
        success: true,
        data: campaigns,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + campaigns.length < totalCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CAMPAIGN_GET]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to fetch campaigns.",
      },
      { status: 500 }
    );
  }
}
