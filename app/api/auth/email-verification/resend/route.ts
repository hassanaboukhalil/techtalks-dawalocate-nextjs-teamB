import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";

/**
 * POST /api/auth/email-verification/resend
 * Resends a verification code to the specified email address
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

    // Check for recent resend attempts (rate limiting - 1 minute)
    const recentVerification = await db.emailVerification.findFirst({
      where: {
        email: email.toLowerCase(),
        createdAt: {
          gt: new Date(Date.now() - 60 * 1000),
        },
      },
    });

    if (recentVerification) {
      const waitTime = Math.ceil(
        (60 - (Date.now() - recentVerification.createdAt.getTime()) / 1000)
      );
      return NextResponse.json(
        {
          error: `Please wait ${waitTime} seconds before requesting a new code`,
        },
        { status: 429 }
      );
    }

    // Check if there are any pending verifications
    const pendingVerification = await db.emailVerification.findFirst({
      where: {
        email: email.toLowerCase(),
        verified: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!pendingVerification) {
      return NextResponse.json(
        {
          error: "No pending verification found. Please request a new verification code.",
        },
        { status: 404 }
      );
    }

    // Invalidate previous codes
    await db.emailVerification.updateMany({
      where: {
        email: email.toLowerCase(),
        verified: false,
      },
      data: {
        verified: true,
      },
    });

    // Generate new code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save new verification
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
        message: "Verification code resent successfully",
        email: email.toLowerCase(),
        expiresAt: expiresAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resending verification code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

