import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";

/**
 * POST /api/auth/email-verification/send
 * Sends a verification code to the specified email address
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user already exists (optional - you may want to verify before signup)
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Check for recent verification attempts (rate limiting)
    const recentVerification = await db.emailVerification.findFirst({
      where: {
        email: email.toLowerCase(),
        createdAt: {
          gt: new Date(Date.now() - 60 * 1000), // Within last minute
        },
      },
    });

    if (recentVerification) {
      return NextResponse.json(
        {
          error: "Verification code was recently sent. Please wait before requesting a new one.",
        },
        { status: 429 }
      );
    }

    // Invalidate any previous unverified codes for this email
    await db.emailVerification.updateMany({
      where: {
        email: email.toLowerCase(),
        verified: false,
      },
      data: {
        verified: true, // Mark as used/invalid
      },
    });

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save to database
    const verification = await db.emailVerification.create({
      data: {
        email: email.toLowerCase(),
        code,
        expiresAt,
      },
    });

    // Send email
    const emailSent = await sendVerificationEmail(email, code);

    if (!emailSent) {
      // If email fails, delete the verification record
      await db.emailVerification.delete({
        where: { id: verification.id },
      });

      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Verification code sent successfully",
        email: email.toLowerCase(),
        expiresAt: expiresAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending verification code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

