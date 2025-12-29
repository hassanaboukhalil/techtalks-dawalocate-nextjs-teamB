import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
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

    // Fetch user's requests
    const requests = await db.donationRequest.findMany({
      where: { userId },
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
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: requests,
    });

  } catch (error) {
    console.error("[PATIENT_REQUESTS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch medicine requests", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { notes, medicines } = body;

    // Validate required fields
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one medicine is required", details: "At least one medicine is required" },
        { status: 400 }
      );
    }

    // Validate medicines array
    for (const medicine of medicines) {
      if (!medicine.name || typeof medicine.name !== "string") {
        return NextResponse.json(
          { success: false, error: "Each medicine must have a valid name", details: "Each medicine must have a valid name" },
          { status: 400 }
        );
      }
    }

    const userId = Number(session.user.id);

    // Get user's city for fallback
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { city: true },
    });

    // Create medicine requests using transaction
    const createdRequests = await db.$transaction(async (tx) => {
      const requests = [];

      for (const medicine of medicines) {
        // Find medicine by name
        const medicineRecord = await tx.medicine.findFirst({
          where: {
            OR: [
              { name: { contains: medicine.name, mode: "insensitive" } },
              { genericName: { contains: medicine.name, mode: "insensitive" } },
              { synonyms: { contains: medicine.name, mode: "insensitive" } },
            ],
          },
        });

        if (!medicineRecord) {
          throw new Error(`Medicine "${medicine.name}" not found`);
        }

        // Check if user already has a pending request for this medicine
        const existingRequest = await tx.donationRequest.findFirst({
          where: {
            userId,
            medicineId: medicineRecord.id,
            status: { in: ["OPEN", "IN_PROGRESS"] },
          },
        });

        if (existingRequest) {
          throw new Error(`You already have a pending request for "${medicine.name}"`);
        }

        // Determine city: use medicine.city if provided, otherwise fall back to user.city
        const requestCity = (medicine.city && medicine.city.trim()) 
          ? medicine.city.trim() 
          : (user?.city || null);

        if (!requestCity) {
          throw new Error("City is required. Please provide a city or update your profile.");
        }

        // Create the request
        const newRequest = await tx.donationRequest.create({
          data: {
            userId,
            medicineId: medicineRecord.id,
            city: requestCity, // Use the determined city
            status: "OPEN",
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
                email: true,
                city: true,
              },
            },
          },
        });

        requests.push(newRequest);
      }

      return requests;
    });

    // If notes were provided, we could store them somewhere, but since the schema
    // doesn't support notes for DonationRequest, we'll include them in the response
    const response = {
      success: true,
      data: {
        requests: createdRequests,
        notes: notes || null,
        totalMedicines: medicines.length,
      },
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error("[PATIENT_REQUESTS_POST]", error);

    // Handle specific validation errors
    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("pending request")) {
        return NextResponse.json(
          { success: false, error: error.message, details: error.message },
          { status: 400 }
        );
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to create medicine requests", details: errorMessage },
      { status: 500 }
    );
  }
}
