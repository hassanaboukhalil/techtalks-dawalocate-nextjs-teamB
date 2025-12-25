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
 * Close a donation offer (change status from OPEN to CLOSED)
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
    const { status } = body;

    // Validate status - only allow closing offers
    if (status !== "CLOSED") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status. Only closing offers is allowed."
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

    // Check if offer can be closed (must be OPEN)
    if (existingOffer.status !== "OPEN") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot close an offer that is already ${existingOffer.status.toLowerCase()}.`
        },
        { status: 400 }
      );
    }

    // Update the donation offer status to CLOSED
    const updatedOffer = await db.donationOffer.update({
      where: { id: donationOfferId },
      data: {
        status: "CLOSED"
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

    return NextResponse.json(
      {
        success: true,
        message: `${existingOffer.medicine.name} donation offer has been closed successfully.`,
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
