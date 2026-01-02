import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/admin/account
 * Fetch logged-in admin's account info
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("[ADMIN_ACCOUNT_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch account data" },
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
  };
  let body: PatchBody | undefined = undefined;
  try {
    const session = await getServerSession(authOptions);
    console.log("[ADMIN_ACCOUNT_PATCH] Session:", !!session);

    if (!session?.user?.id || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    body = (await request.json()) as PatchBody;

    const { name, email, phone, currentPassword, newPassword } = body;

    // Fetch current user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Email uniqueness check
    if (email && email !== user.email) {
      const emailExists = await db.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Password change logic (SECURE)
    let passwordHash: string | undefined;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required" },
          { status: 400 }
        );
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!isValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // Update user (PATCH semantics)
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(passwordHash && { passwordHash }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
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
        error: "Failed to update account data",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
