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

    // Fetch open donation requests from OTHER patients for expert assistance
    // Only show OPEN status requests that need expert help
    const expertRequests = await db.donationRequest.findMany({
      where: {
        AND: [
          { userId: { not: userId } }, // Exclude current user's requests
          { status: "OPEN" }, // Only open requests need expert help
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
    const transformedRequests = expertRequests.map((request) => ({
      id: request.id,
      city: request.city,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt?.toISOString(),
      medicine: request.medicine,
      patient: {
        name: request.user.name,
        phone: request.user.phone,
      },
    }));

    return NextResponse.json({
      success: true,
      data: transformedRequests,
    });
  } catch (error) {
    console.error("[PATIENT_REQUESTS_EXPERT_GET]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch expert requests",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}