import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/patient/donation-offers/[id]/assist
 * Mark a donation offer as coordinated/assisted by an expert
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

    // Check that this is not the patient's own offer
    if (existingOffer.userId === patientId) {
      return NextResponse.json(
        {
          success: false,
          error: "You cannot assist with your own donation offers."
        },
        { status: 403 }
      );
    }

    // Check if offer is already closed
    if (existingOffer.status !== "OPEN") {
      return NextResponse.json(
        {
          success: false,
          error: "This donation offer has already been coordinated."
        },
        { status: 400 }
      );
    }

    // Mark the offer as closed (coordinated)
    const updatedOffer = await db.donationOffer.update({
      where: { id: donationOfferId },
      data: {
        status: "CLOSED",
        updatedAt: new Date()
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

    const medicineName = updatedOffer.medicine.name;

    return NextResponse.json(
      {
        success: true,
        message: `${medicineName} donation offer has been successfully coordinated.`,
        data: updatedOffer
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error coordinating donation offer:", error);

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
        error: "Internal server error. Failed to coordinate donation offer."
      },
      { status: 500 }
    );
  }
}