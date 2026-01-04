import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Helper function to validate email format
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Helper function to sanitize phone number
 */
const sanitizePhone = (phone: string): string => {
  return phone.trim();
};

/**
 * GET /api/admin/account
 * Fetch logged-in admin's account info
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.userType !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_ACCOUNT_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch account data" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/account
 * Update logged-in admin's account data
 */
export async function PATCH(request: NextRequest) {
  console.log("[ADMIN_ACCOUNT_PATCH] Request received");
  type PatchBody = {
    name?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  let body: PatchBody | undefined = undefined;
  try {
    const session = await getServerSession(authOptions);
    console.log("[ADMIN_ACCOUNT_PATCH] Session:", !!session);

    if (!session?.user?.id || session.user.userType !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    body = (await request.json()) as PatchBody;

    const { name, email, phone, currentPassword, newPassword, confirmPassword } = body;

    // Fetch current user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Validate email if provided
    if (email != null) {
      if (typeof email !== "string" || !validateEmail(email)) {
        return NextResponse.json(
          { success: false, error: "Valid email address is required." },
          { status: 400 }
        );
      }

      // Check email uniqueness (excluding current user)
      const existingUser = await db.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { success: false, error: "Email address is already in use." },
          { status: 409 }
        );
      }
    }

    // Validate phone if provided
    if (phone != null) {
      if (typeof phone !== "string" || sanitizePhone(phone).length < 8) {
        return NextResponse.json(
          { success: false, error: "Valid phone number is required (minimum 8 digits)." },
          { status: 400 }
        );
      }
    }

    // Password change logic (SECURE)
    let passwordHash: string | undefined;

    if (newPassword != null) {
      // Validate individual password fields with specific error messages
      if (!currentPassword || currentPassword.trim() === "") {
        return NextResponse.json(
          {
            success: false,
            error: "Current password is required and cannot be empty.",
          },
          { status: 400 }
        );
      }

      if (!newPassword || newPassword.trim() === "") {
        return NextResponse.json(
          {
            success: false,
            error: "New password is required and cannot be empty.",
          },
          { status: 400 }
        );
      }

      if (!confirmPassword || confirmPassword.trim() === "") {
        return NextResponse.json(
          {
            success: false,
            error: "Password confirmation is required and cannot be empty.",
          },
          { status: 400 }
        );
      }

      // Trim passwords to handle whitespace
      const trimmedCurrentPassword = currentPassword.trim();
      const trimmedNewPassword = newPassword.trim();
      const trimmedConfirmPassword = confirmPassword.trim();

      // Validate new password length
      if (trimmedNewPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 8 characters long." },
          { status: 400 }
        );
      }

      // Check if new password matches confirm password
      if (trimmedNewPassword !== trimmedConfirmPassword) {
        return NextResponse.json(
          { success: false, error: "New password and confirm password do not match." },
          { status: 400 }
        );
      }

      // Verify current password
      const isValid = await bcrypt.compare(trimmedCurrentPassword, user.passwordHash);

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect." },
          { status: 400 }
        );
      }

      // Hash new password
      passwordHash = await bcrypt.hash(trimmedNewPassword, 10);
      console.log("Password successfully hashed and updated for user:", userId);
    }

    // Update user (PATCH semantics)
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(name != null && { name }),
        ...(email != null && { email: email.trim().toLowerCase() }),
        ...(phone != null && { phone: sanitizePhone(phone) }),
        ...(passwordHash && { passwordHash }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser }, { status: 200 });
  } catch (error: unknown) {
    let errorMessage = "";
    if (error && typeof error === "object" && "message" in error) {
      errorMessage = (error as { message: string }).message;
    } else {
      errorMessage = String(error);
    }
    const errorLog = `
      --- [${new Date().toISOString()}] ADMIN_ACCOUNT_PATCH Error ---
      Message: ${errorMessage}
      Body: ${JSON.stringify(body, null, 2)}
      --------------------------------------------------
      `;
    try {
      fs.appendFileSync(path.join(process.cwd(), "debug.log"), errorLog);
    } catch (fsErr) {
      console.error("Failed to write to debug.log:", fsErr);
    }

    console.error("[ADMIN_ACCOUNT_PATCH] Full Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update account data",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
