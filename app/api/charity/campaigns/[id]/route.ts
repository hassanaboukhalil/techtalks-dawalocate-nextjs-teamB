import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/charity/campaigns/[id]
 * Fetches a single campaign by ID for the authenticated charity
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
    const { id } = await params;
    const campaignId = parseInt(id);

    if (isNaN(campaignId)) {
      return NextResponse.json(
        { success: false, error: "Invalid campaign ID." },
        { status: 400 }
      );
    }

    // 2. Verify user is a charity
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { userType: true },
    });

    if (!user || user.userType.name !== "charity") {
      return NextResponse.json(
        { success: false, error: "Access denied. Only charities can access campaigns." },
        { status: 403 }
      );
    }

    // 3. Fetch campaign
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
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

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found." },
        { status: 404 }
      );
    }

    // 4. Verify ownership
    if (campaign.charityUserId !== userId) {
      return NextResponse.json(
        { success: false, error: "Access denied. You can only view your own campaigns." },
        { status: 403 }
      );
    }

    // 5. Return campaign
    return NextResponse.json(
      {
        success: true,
        data: campaign,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CAMPAIGN_GET_BY_ID]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to fetch campaign.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/charity/campaigns/[id]
 * Updates a campaign for the authenticated charity
 */
export async function PUT(
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
    const { id } = await params;
    const campaignId = parseInt(id);

    if (isNaN(campaignId)) {
      return NextResponse.json(
        { success: false, error: "Invalid campaign ID." },
        { status: 400 }
      );
    }

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
          error: "Access denied. Only charities can update campaigns.",
        },
        { status: 403 }
      );
    }

    // 3. Check charity approval status
    if (user.status !== "APPROVED") {
      return NextResponse.json(
        {
          success: false,
          error: `Your charity account is ${user.status?.toLowerCase() || "pending"}. Only approved charities can update campaigns.`,
        },
        { status: 403 }
      );
    }

    // 4. Check if campaign exists and verify ownership
    const existingCampaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: {
        campaignMedicines: {
          select: { medicineId: true },
        },
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found." },
        { status: 404 }
      );
    }

    if (existingCampaign.charityUserId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. You can only update your own campaigns.",
        },
        { status: 403 }
      );
    }

    // 5. Parse and validate request body
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

    // 6. Validate fields (only validate if provided)
    const validationErrors: string[] = [];

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        validationErrors.push("Campaign title cannot be empty.");
      } else if (title.trim().length < 5) {
        validationErrors.push("Campaign title must be at least 5 characters.");
      } else if (title.trim().length > 200) {
        validationErrors.push("Campaign title must not exceed 200 characters.");
      }
    }

    if (description !== undefined) {
      if (typeof description !== "string" || description.trim().length === 0) {
        validationErrors.push("Campaign description cannot be empty.");
      } else if (description.trim().length < 20) {
        validationErrors.push("Campaign description must be at least 20 characters.");
      } else if (description.trim().length > 2000) {
        validationErrors.push("Campaign description must not exceed 2000 characters.");
      }
    }

    if (targetAreas !== undefined) {
      if (typeof targetAreas !== "string" || targetAreas.trim().length === 0) {
        validationErrors.push("Target areas cannot be empty.");
      }
    }

    if (startDate !== undefined) {
      const parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        validationErrors.push("Invalid start date format.");
      } else if (parsedStartDate < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        validationErrors.push("Start date cannot be in the past.");
      }

      // Validate end date if provided in relation to new start date
      if (endDate !== undefined) {
        const parsedEndDate = new Date(endDate);
        if (!isNaN(parsedEndDate.getTime()) && parsedEndDate <= parsedStartDate) {
          validationErrors.push("End date must be after start date.");
        }
      }
    }

    if (endDate !== undefined && endDate !== null) {
      const parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        validationErrors.push("Invalid end date format.");
      } else {
        const campaignStartDate = startDate ? new Date(startDate) : new Date(existingCampaign.startDate);
        if (parsedEndDate <= campaignStartDate) {
          validationErrors.push("End date must be after start date.");
        }
      }
    }

    if (contactInfo !== undefined) {
      if (typeof contactInfo !== "string" || contactInfo.trim().length === 0) {
        validationErrors.push("Contact information cannot be empty.");
      } else if (contactInfo.trim().length < 5) {
        validationErrors.push("Contact information must be at least 5 characters.");
      }
    }

    // Validate medicine IDs if provided
    if (medicineIds !== undefined && medicineIds !== null) {
      if (!Array.isArray(medicineIds)) {
        validationErrors.push("Medicine IDs must be an array.");
      } else if (medicineIds.some((id) => typeof id !== "number" || id <= 0)) {
        validationErrors.push("All medicine IDs must be valid positive numbers.");
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

    // 7. Verify medicines exist if provided
    if (medicineIds && Array.isArray(medicineIds) && medicineIds.length > 0) {
      const medicines = await db.medicine.findMany({
        where: { id: { in: medicineIds } },
        select: { id: true },
      });

      if (medicines.length !== medicineIds.length) {
        const foundIds = medicines.map((m) => m.id);
        const missingIds = medicineIds.filter((id) => !foundIds.includes(id));
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

    // 8. Update campaign with medicines in a transaction
    const updatedCampaign = await db.$transaction(async (tx) => {
      // Prepare update data
      const updateData: {
        title?: string;
        description?: string;
        targetAreas?: string;
        startDate?: Date;
        endDate?: Date | null;
        contactInfo?: string;
        updatedAt: Date;
      } = {
        updatedAt: new Date(),
      };

      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (targetAreas !== undefined) updateData.targetAreas = targetAreas.trim();
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) {
        updateData.endDate = endDate ? new Date(endDate) : null;
      }
      if (contactInfo !== undefined) updateData.contactInfo = contactInfo.trim();

      // Update the campaign
      const campaign = await tx.campaign.update({
        where: { id: campaignId },
        data: updateData,
      });

      // Update medicines if provided
      if (medicineIds !== undefined) {
        // Delete existing medicine associations
        await tx.campaignMedicine.deleteMany({
          where: { campaignId: campaignId },
        });

        // Add new medicine associations
        if (Array.isArray(medicineIds) && medicineIds.length > 0) {
          await tx.campaignMedicine.createMany({
            data: medicineIds.map((medicineId: number) => ({
              campaignId: campaignId,
              medicineId: medicineId,
            })),
          });
        }
      }

      // Fetch the complete updated campaign with relations
      return await tx.campaign.findUnique({
        where: { id: campaignId },
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

    // 9. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Campaign updated successfully.",
        data: updatedCampaign,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CAMPAIGN_PUT]", error);

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
        error: "Internal server error. Failed to update campaign.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/charity/campaigns/[id]
 * Deletes a campaign for the authenticated charity
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
    const { id } = await params;
    const campaignId = parseInt(id);

    if (isNaN(campaignId)) {
      return NextResponse.json(
        { success: false, error: "Invalid campaign ID." },
        { status: 400 }
      );
    }

    // 2. Verify user is a charity
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { userType: true },
    });

    if (!user || user.userType.name !== "charity") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Only charities can delete campaigns.",
        },
        { status: 403 }
      );
    }

    // 3. Check if campaign exists and verify ownership
    const existingCampaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found." },
        { status: 404 }
      );
    }

    if (existingCampaign.charityUserId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. You can only delete your own campaigns.",
        },
        { status: 403 }
      );
    }

    // 4. Delete campaign (cascades to campaignMedicines)
    await db.campaign.delete({
      where: { id: campaignId },
    });

    // 5. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Campaign deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CAMPAIGN_DELETE]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to delete campaign.",
      },
      { status: 500 }
    );
  }
}

