import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // FIX 1: Type as Promise
) {
  try {
    const resolvedParams = await params; // FIX 2: Await the params
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, email, password, phone, city, address } = body;

    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    if (email && email !== existingUser.email) {
      const emailCheck = await db.user.findUnique({ where: { email } });
      if (emailCheck) {
        return NextResponse.json(
          { message: "Email is already taken" },
          { status: 409 }
        );
      }
    }

    const updateData: {
      name: string;
      email: string;
      phone: string | null;
      city: string | null;
      address: string | null;
      passwordHash?: string;
    } = { name, email, phone, city, address };

    if (password && password.trim() !== "") {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[PATCH] Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params; // FIX 2: Await the params
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { message: "Patient not found" },
        { status: 404 }
      );
    }

    await db.user.delete({ where: { id } });

    return NextResponse.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("[DELETE] Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
