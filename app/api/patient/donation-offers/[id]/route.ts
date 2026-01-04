import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DonationOfferStatus } from "@/lib/generated/prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/patient/donation-offers/[id]
 * Update donation offer details or toggle status
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please log in."
        },
        { status: 401 }
      );
    }

    // Get patient ID from authenticated user
    const patientId = parseInt(session.user.id);

    // Get donation offer ID from params
    const resolvedParams = await params;
    const donationOfferId = parseInt(resolvedParams.id);

    if (isNaN(donationOfferId) || donationOfferId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid donation offer ID."
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, medicineId, city, expiry, notes } = body;

    if (
      status === undefined &&
      medicineId === undefined &&
      city === undefined &&
      expiry === undefined &&
      notes === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "No updates provided."
        },
        { status: 400 }
      );
    }

    // Verify patient exists and is a patient user
    const patient = await db.user.findUnique({
      where: { id: patientId },
      include: { userType: true }
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: "Patient not found."
        },
        { status: 404 }
      );
    }

    if (patient.userType.name !== "patient") {
      return NextResponse.json(
        {
          success: false,
          error: "User is not a patient."
        },
        { status: 403 }
      );
    }

    // Find the existing donation offer
    const existingOffer = await db.donationOffer.findUnique({
      where: { id: donationOfferId },
      include: {
        medicine: {
          select: {
            name: true
          }
        }
      }
    });

    if (!existingOffer) {
      return NextResponse.json(
        {
          success: false,
          error: "Donation offer not found."
        },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingOffer.userId !== patientId) {
      return NextResponse.json(
        {
          success: false,
          error: "You can only modify your own donation offers."
        },
        { status: 403 }
      );
    }

    const updateData: Record<string, any> = {};

    if (status !== undefined) {
      if (status !== "OPEN" && status !== "CLOSED") {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid status value."
          },
          { status: 400 }
        );
      }

      if (status === existingOffer.status) {
        return NextResponse.json(
          {
            success: false,
            error: `Offer is already ${status.toLowerCase()}.`
          },
          { status: 400 }
        );
      }

      if (status === "CLOSED" && existingOffer.status !== "OPEN") {
        return NextResponse.json(
          {
            success: false,
            error: "Only open offers can be closed."
          },
          { status: 400 }
        );
      }

      if (status === "OPEN" && existingOffer.status !== "CLOSED") {
        return NextResponse.json(
          {
            success: false,
            error: "Only closed offers can be reopened."
          },
          { status: 400 }
        );
      }

      updateData.status = status as DonationOfferStatus;
    }

    if (medicineId !== undefined) {
      if (typeof medicineId !== "number" || medicineId <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid medicine ID."
          },
          { status: 400 }
        );
      }

      const medicine = await db.medicine.findUnique({ where: { id: medicineId } });
      if (!medicine) {
        return NextResponse.json(
          {
            success: false,
            error: "Medicine not found."
          },
          { status: 404 }
        );
      }

      updateData.medicineId = medicineId;
    }

    if (city !== undefined) {
      if (typeof city !== "string" || city.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "City must be a non-empty string."
          },
          { status: 400 }
        );
      }

      updateData.city = city.trim();
    }

    if (expiry !== undefined) {
      if (!expiry) {
        updateData.expiry = null;
      } else {
        const expiryDate = new Date(expiry);
        if (isNaN(expiryDate.getTime())) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid expiry date format."
            },
            { status: 400 }
          );
        }
        updateData.expiry = expiryDate;
      }
    }

    if (notes !== undefined) {
      if (notes !== null && typeof notes !== "string") {
        return NextResponse.json(
          {
            success: false,
            error: "Notes must be a string or null."
          },
          { status: 400 }
        );
      }

      updateData.notes = notes ? notes.trim() : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nothing to update."
        },
        { status: 400 }
      );
    }

    const updatedOffer = await db.donationOffer.update({
      where: { id: donationOfferId },
      data: updateData,
      include: {
        medicine: {
          select: {
            id: true,
            name: true,
            genericName: true,
            strength: true,
            form: true,
            imageUrl: true,
            description: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            city: true,
            address: true,
            phone: true
          }
        }
      }
    });

    const medicineName = updatedOffer.medicine.name;
    const message = status
      ? status === "CLOSED"
        ? `${medicineName} donation offer has been closed successfully.`
        : `${medicineName} donation offer has been reopened successfully.`
      : "Donation offer updated successfully.";

    return NextResponse.json(
      {
        success: true,
        message,
        data: updatedOffer
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error closing donation offer:", error);

    // Handle Prisma-specific errors
    if (error instanceof Error) {
      // Record not found error
      if (error.message.includes("Record to update not found")) {
        return NextResponse.json(
          {
            success: false,
            error: "Donation offer not found."
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to close donation offer."
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/patient/donation-offers/[id]
 * Delete a donation offer
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please log in."
        },
        { status: 401 }
      );
    }

    // Get patient ID from authenticated user
    const patientId = parseInt(session.user.id);

    // Get donation offer ID from params
    const resolvedParams = await params;
    const donationOfferId = parseInt(resolvedParams.id);

    if (isNaN(donationOfferId) || donationOfferId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid donation offer ID."
        },
        { status: 400 }
      );
    }

    // Verify patient exists and is a patient user
    const patient = await db.user.findUnique({
      where: { id: patientId },
      include: { userType: true }
    });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: "Patient not found."
        },
        { status: 404 }
      );
    }

    if (patient.userType.name !== "patient") {
      return NextResponse.json(
        {
          success: false,
          error: "User is not a patient."
        },
        { status: 403 }
      );
    }

    // Verify donation offer exists and belongs to this patient
    const existingOffer = await db.donationOffer.findUnique({
      where: { id: donationOfferId },
      include: {
        medicine: {
          select: {
            name: true
          }
        }
      }
    });

    if (!existingOffer) {
      return NextResponse.json(
        {
          success: false,
          error: "Donation offer not found."
        },
        { status: 404 }
      );
    }

    if (existingOffer.userId !== patientId) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to delete this donation offer."
        },
        { status: 403 }
      );
    }

    // Store medicine name for response message
    const medicineName = existingOffer.medicine.name;

    // Delete the donation offer
    await db.donationOffer.delete({
      where: { id: donationOfferId }
    });

    return NextResponse.json(
      {
        success: true,
        message: `${medicineName} donation offer has been deleted successfully.`,
        data: {
          deletedId: donationOfferId,
          medicineName: medicineName
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting donation offer:", error);

    // Handle Prisma-specific errors
    if (error instanceof Error) {
      // Record not found error
      if (error.message.includes("Record to delete does not exist")) {
        return NextResponse.json(
          {
            success: false,
            error: "Donation offer not found or already deleted."
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to delete donation offer."
      },
      { status: 500 }
    );
  }
}
