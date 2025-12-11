import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      userType,
      city,
      phone,
      address,
      openingHours,
      hasDelivery,
    } = body;

    // Validate required fields
    if (!name || !email || !password || !userType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Get userType ID
    const userTypeRecord = await db.userType.findUnique({
      where: { name: userType },
    });

    if (!userTypeRecord) {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Set status based on userType
    const status =
      userType === "pharmacy" || userType === "charity" ? "PENDING" : null;

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        userTypeId: userTypeRecord.id,
        city,
        phone,
        address,
        openingHours,
        hasDelivery,
        status,
      },
      select: {
        id: true,
        name: true,
        email: true,
        userType: {
          select: {
            name: true,
          },
        },
        status: true,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType.name,
          status: user.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
