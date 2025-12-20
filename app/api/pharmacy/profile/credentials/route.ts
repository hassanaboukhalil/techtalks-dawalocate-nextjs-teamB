import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Prisma } from "@/lib/generated/prisma";

/**
 * PATCH /api/pharmacy/profile/credentials
 * Update pharmacy email, phone, and password ONLY
 */
export async function PATCH(req: Request) {
  try {
    /* =======================
       1. AUTHENTICATION
    ======================= */
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const pharmacyId = Number(session.user.id);
    if (Number.isNaN(pharmacyId)) {
      return NextResponse.json(
        { success: false, error: "Invalid user id" },
        { status: 400 }
      );
    }

    /* =======================
       2. LOAD USER + ROLE
    ======================= */
    const pharmacy = await db.user.findUnique({
      where: { id: pharmacyId },
      include: { userType: true },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (
      !pharmacy.userType ||
      pharmacy.userType.name.toLowerCase() !== "pharmacy"
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    /* =======================
       3. PARSE BODY (TYPED)
    ======================= */
    const body: {
      email?: string;
      phone?: string;
      password?: string;
    } = await req.json();

    const { email, phone, password } = body;

    /* =======================
       4. BUILD UPDATE OBJECT
    ======================= */
    const updateData: Prisma.UserUpdateInput = {};

    // ---- EMAIL ----
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: "Invalid email format" },
          { status: 400 }
        );
      }

      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== pharmacyId) {
        return NextResponse.json(
          { success: false, error: "Email already in use" },
          { status: 400 }
        );
      }

      updateData.email = email.trim().toLowerCase();
    }

    // ---- PHONE ----
    if (phone) {
      if (typeof phone !== "string" || phone.trim().length < 8) {
        return NextResponse.json(
          { success: false, error: "Invalid phone number" },
          { status: 400 }
        );
      }

      updateData.phone = phone.trim();
    }

    // ---- PASSWORD ----
    if (password) {
      if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json(
          { success: false, error: "Password too short" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.passwordHash = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields provided" },
        { status: 400 }
      );
    }

    /* =======================
       5. UPDATE DATABASE
    ======================= */
    await db.user.update({
      where: { id: pharmacyId },
      data: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Credentials updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[PHARMACY_CREDENTIALS_UPDATE]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update credentials" },
      { status: 500 }
    );
  }
}
