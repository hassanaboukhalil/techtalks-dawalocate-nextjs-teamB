import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", details: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user type is patient
    if (session.user.userType !== "patient") {
      return NextResponse.json(
        { success: false, error: "Forbidden", details: "Forbidden" },
        { status: 403 }
      );
    }

    const userId = Number(session.user.id);

    // Fetch open donation offers from OTHER patients for expert assistance
    // Only show OPEN status offers that need expert coordination
    const expertOffers = await db.donationOffer.findMany({
      where: {
        AND: [
          { userId: { not: userId } }, // Exclude current user's offers
          { status: "OPEN" }, // Only open offers need expert coordination
        ],
      },
      include: {
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
        user: {
          select: {
            id: true,
            name: true,
            phone: true, // Include phone for contact purposes
            email: true,
          },
        },
      },
      orderBy: [
        { createdAt: "desc" }, // Most recent first for expert assistance
      ],
    });

    // Transform the data to match the expected format for the frontend
    const transformedOffers = expertOffers.map((offer) => ({
      id: offer.id,
      userId: offer.userId,
      medicineId: offer.medicineId,
      city: offer.city,
      expiry: offer.expiry?.toISOString(),
      notes: offer.notes,
      status: offer.status,
      createdAt: offer.createdAt.toISOString(),
      updatedAt: offer.updatedAt.toISOString(),
      medicine: offer.medicine,
      patient: {
        name: offer.user.name,
        phone: offer.user.phone,
      },
    }));

    return NextResponse.json({
      success: true,
      data: transformedOffers,
    });
  } catch (error) {
    console.error("[PATIENT_DONATION_OFFERS_EXPERT_GET]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch expert donation offers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}