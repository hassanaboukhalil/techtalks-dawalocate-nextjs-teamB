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
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user type is patient
    if (session.user.userType !== "patient") {
      return NextResponse.json(
        { error: "Forbidden" },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: requests,
    });

  } catch (error) {
    console.error("[PATIENT_REQUESTS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch medicine requests" },
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
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user type is patient
    if (session.user.userType !== "patient") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { notes, medicines } = body;

    // Validate required fields
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return NextResponse.json(
        { error: "At least one medicine is required" },
        { status: 400 }
      );
    }

    // Validate medicines array
    for (const medicine of medicines) {
      if (!medicine.name || typeof medicine.name !== "string") {
        return NextResponse.json(
          { error: "Each medicine must have a valid name" },
          { status: 400 }
        );
      }
      if (typeof medicine.quantity !== "number" || medicine.quantity <= 0) {
        return NextResponse.json(
          { error: "Each medicine must have a valid quantity greater than 0" },
          { status: 400 }
        );
      }
    }

    const userId = Number(session.user.id);

    // Get user's city for the request
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { city: true },
    });

    if (!user?.city) {
      return NextResponse.json(
        { error: "User city is required to create requests" },
        { status: 400 }
      );
    }

    // Create medicine requests using transaction
    const createdRequests = await db.$transaction(async (tx) => {
      const requests = [];

      for (const medicine of medicines) {
        // Find medicine by name
        const medicineRecord = await tx.medicine.findFirst({
          where: {
            OR: [
              { name: { equals: medicine.name, mode: "insensitive" } },
              { genericName: { equals: medicine.name, mode: "insensitive" } },
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

        // Create the request
        const newRequest = await tx.donationRequest.create({
          data: {
            userId,
            medicineId: medicineRecord.id,
            city: user.city,
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

        requests.push({
          ...newRequest,
          requestedQuantity: medicine.quantity, // Add requested quantity to response
        });
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
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create medicine requests" },
      { status: 500 }
    );
  }
}
