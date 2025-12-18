import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/auth/email-verification/verify
 * Verifies the provided code against the email address
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    // Validate inputs
    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    if (typeof code !== "string" || code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Invalid verification code format" },
        { status: 400 }
      );
    }

    // Find the verification record
    const verification = await db.emailVerification.findFirst({
      where: {
        email: email.toLowerCase(),
        code: code,
        verified: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Check if verification exists
    if (!verification) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark the code as verified
    await db.emailVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    // Clean up old/expired verification codes for this email (optional background cleanup)
    await db.emailVerification.deleteMany({
      where: {
        email: email.toLowerCase(),
        OR: [
          { expiresAt: { lt: new Date() } },
          {
            id: { not: verification.id },
            verified: true,
          },
        ],
      },
    });

    return NextResponse.json(
      {
        message: "Email verified successfully",
        email: email.toLowerCase(),
        verified: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

