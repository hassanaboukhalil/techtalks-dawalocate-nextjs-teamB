import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/patient/donation-offers
 * Fetch all donation offers made by the authenticated patient
 */
export async function GET(request: NextRequest) {
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

    // Fetch all donation offers for this patient
    const donationOffers = await db.donationOffer.findMany({
      where: {
        userId: patientId
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Donation offers fetched successfully.",
        data: donationOffers
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching donation offers:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to fetch donation offers."
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patient/donation-offers
 * Create a new donation offer
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const { medicineId, city } = body;

    if (!medicineId || typeof medicineId !== "number") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing medicineId. Must be a number."
        },
        { status: 400 }
      );
    }

    if (!city || typeof city !== "string" || city.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing city. Must be a non-empty string."
        },
        { status: 400 }
      );
    }

    // Validate optional fields
    const { expiry, notes } = body;

    // Validate expiry if provided
    let expiryDate: Date | undefined;
    if (expiry) {
      expiryDate = new Date(expiry);
      if (isNaN(expiryDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid expiry date format. Use ISO 8601 format."
          },
          { status: 400 }
        );
      }
    }

    // Validate notes if provided
    if (notes && typeof notes !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid notes. Must be a string."
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

    // Verify medicine exists
    const medicine = await db.medicine.findUnique({
      where: { id: medicineId }
    });

    if (!medicine) {
      return NextResponse.json(
        {
          success: false,
          error: "Medicine not found."
        },
        { status: 404 }
      );
    }

    // Create donation offer
    const donationOffer = await db.donationOffer.create({
      data: {
        userId: patientId,
        medicineId,
        city: city.trim(),
        expiry: expiryDate,
        notes: notes?.trim() || undefined,
        status: "OPEN"
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
        message: "Donation offer created successfully.",
        data: donationOffer
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating donation offer:", error);

    // Handle Prisma-specific errors
    if (error instanceof Error) {
      // Foreign key constraint errors
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid patient or medicine reference."
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to create donation offer."
      },
      { status: 500 }
    );
  }
}
