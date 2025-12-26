import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    // Get request ID from params
    const resolvedParams = await Promise.resolve(params);
    const requestId = resolvedParams.id;
    if (!requestId || isNaN(Number(requestId))) {
      return NextResponse.json(
        { success: false, error: "Invalid request ID" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { medicines } = body; // notes is optional but not stored (schema limitation)

    // Validate medicines array
    if (!medicines || !Array.isArray(medicines) || medicines.length !== 1) {
      return NextResponse.json(
        { success: false, error: "Exactly one medicine must be provided for updating a request", details: "Exactly one medicine must be provided for updating a request" },
        { status: 400 }
      );
    }

    const medicine = medicines[0];
    if (!medicine.name || typeof medicine.name !== "string") {
      return NextResponse.json(
        { success: false, error: "Medicine must have a valid name", details: "Medicine must have a valid name" },
        { status: 400 }
      );
    }

    // Validate city if provided
    if (medicine.city && typeof medicine.city !== "string") {
      return NextResponse.json(
        { success: false, error: "City must be a valid string", details: "City must be a valid string" },
        { status: 400 }
      );
    }

    const userId = Number(session.user.id);
    const requestIdNum = Number(requestId);

    // Find the existing request
    const existingRequest = await db.donationRequest.findUnique({
      where: { id: requestIdNum },
      include: {
        medicine: true,
        user: true,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingRequest.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own requests", details: "You can only edit your own requests" },
        { status: 403 }
      );
    }

    // Check if request can be edited (not fulfilled)
    if (existingRequest.status === "FULFILLED") {
      return NextResponse.json(
        { success: false, error: "Cannot edit a fulfilled request", details: "Cannot edit a fulfilled request" },
        { status: 400 }
      );
    }

    // Find the new medicine
    const newMedicine = await db.medicine.findFirst({
      where: {
        OR: [
          { name: { contains: medicine.name, mode: "insensitive" } },
          { genericName: { contains: medicine.name, mode: "insensitive" } },
          { synonyms: { contains: medicine.name, mode: "insensitive" } },
        ],
      },
    });

    if (!newMedicine) {
      return NextResponse.json(
        { success: false, error: `Medicine "${medicine.name}" not found`, details: `Medicine "${medicine.name}" not found` },
        { status: 400 }
      );
    }

    // Check if user already has a pending request for the new medicine (if different from current)
    if (newMedicine.id !== existingRequest.medicineId) {
      const duplicateRequest = await db.donationRequest.findFirst({
        where: {
          userId,
          medicineId: newMedicine.id,
          status: { in: ["OPEN", "IN_PROGRESS"] },
          id: { not: requestIdNum }, // Exclude current request
        },
      });

      if (duplicateRequest) {
        return NextResponse.json(
          { success: false, error: `You already have a pending request for "${medicine.name}"`, details: `You already have a pending request for "${medicine.name}"` },
          { status: 400 }
        );
      }
    }

    // Update the request
    const updateData: any = {
      medicine: {
        connect: { id: newMedicine.id }
      },
      quantity: medicine.quantity || 1,
    };

    // Allow updating city if provided
    if (medicine.city) {
      updateData.city = medicine.city;
    }

    const updatedRequest = await db.donationRequest.update({
      where: { id: requestIdNum },
      data: updateData,
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

    return NextResponse.json(
      { success: true, data: updatedRequest },
      { status: 200 }
    );

  } catch (error) {
    console.error("[PATIENT_REQUEST_PUT]", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[PATIENT_REQUEST_PUT] Error details:", errorMessage);
    return NextResponse.json(
      { success: false, error: "Failed to update medicine request", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", details: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user role is patient
    if (session.user.userType !== "patient") {
      return NextResponse.json(
        { success: false, error: "Forbidden", details: "Forbidden" },
        { status: 403 }
      );
    }

    // Get request ID from params
    const resolvedParams = await Promise.resolve(params);
    const requestId = resolvedParams.id;
    if (!requestId || isNaN(Number(requestId))) {
      return NextResponse.json(
        { success: false, error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const userId = Number(session.user.id);
    const requestIdNum = Number(requestId);

    // Find the existing request
    const existingRequest = await db.donationRequest.findUnique({
      where: { id: requestIdNum },
      select: {
        id: true,
        userId: true,
        status: true,
        medicine: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingRequest.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own requests", details: "You can only delete your own requests" },
        { status: 403 }
      );
    }

    // Check if request can be deleted (must be OPEN)
    if (existingRequest.status !== "OPEN") {
      return NextResponse.json(
        { success: false, error: `Cannot delete a ${existingRequest.status.toLowerCase()} request`, details: `Cannot delete a ${existingRequest.status.toLowerCase()} request` },
        { status: 400 }
      );
    }

    // Delete the request
    await db.donationRequest.delete({
      where: { id: requestIdNum },
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

  } catch (error) {
    console.error("[PATIENT_REQUEST_DELETE]", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: "Failed to delete medicine request", details: errorMessage },
      { status: 500 }
    );
  }
}
