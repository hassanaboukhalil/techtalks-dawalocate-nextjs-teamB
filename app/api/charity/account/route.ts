import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

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
 * GET /api/charity/account
 * Returns the logged-in charity account info (safe fields only)
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const charityId = parseInt(session.user.id);

    // Load the user with its userType
    const charity = await db.user.findUnique({
      where: { id: charityId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        address: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!charity) {
      return NextResponse.json(
        { success: false, error: "Charity not found." },
        { status: 404 }
      );
    }

    if (charity.userType.name !== "charity") {
      return NextResponse.json(
        { success: false, error: "User is not a charity." },
        { status: 403 }
      );
    }

    // Return only safe fields
    const accountData = {
      id: charity.id,
      name: charity.name,
      email: charity.email,
      phone: charity.phone,
      city: charity.city,
      address: charity.address,
      createdAt: charity.createdAt,
      updatedAt: charity.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: accountData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching charity account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to fetch charity account.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/charity/account
 * Updates the logged-in charity account (partial updates allowed)
 */
export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const charityId = parseInt(session.user.id);

    // Load the user with its userType
    const charity = await db.user.findUnique({
      where: { id: charityId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        passwordHash: true,
        address: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!charity) {
      return NextResponse.json(
        { success: false, error: "Charity not found." },
        { status: 404 }
      );
    }

    if (charity.userType.name !== "charity") {
      return NextResponse.json(
        { success: false, error: "User is not a charity." },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const {
      email,
      phone,
      city,
      address,
      currentPassword,
      newPassword,
      confirmPassword,
    } = body;

    // Validate email if provided
    if (email !== undefined) {
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

      if (existingUser && existingUser.id !== charityId) {
        return NextResponse.json(
          { success: false, error: "Email address is already in use." },
          { status: 409 }
        );
      }
    }

    // Validate phone if provided
    if (phone !== undefined) {
      if (typeof phone !== "string" || sanitizePhone(phone).length < 8) {
        return NextResponse.json(
          {
            success: false,
            error: "Phone number must be at least 8 characters.",
          },
          { status: 400 }
        );
      }
    }

    // Validate city if provided
    if (city !== undefined) {
      if (typeof city !== "string") {
        return NextResponse.json(
          { success: false, error: "City must be a string." },
          { status: 400 }
        );
      }
    }

    // Validate address if provided
    if (address !== undefined) {
      if (typeof address !== "string") {
        return NextResponse.json(
          { success: false, error: "Address must be a string." },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      updatedAt: Date;
      email?: string;
      phone?: string;
      city?: string | null;
      address?: string | null;
      passwordHash?: string;
    } = {
      updatedAt: new Date(),
    };

    // Handle password update if newPassword is provided
    if (newPassword !== undefined) {
      // All password fields are required for password update
      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Current password, new password, and confirm password are required for password update.",
          },
          { status: 400 }
        );
      }

      // Validate new password length
      if (newPassword.length < 8) {
        return NextResponse.json(
          {
            success: false,
            error: "New password must be at least 8 characters long.",
          },
          { status: 400 }
        );
      }

      // Check if new password matches confirm password
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          {
            success: false,
            error: "New password and confirm password do not match.",
          },
          { status: 400 }
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        charity.passwordHash
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect." },
          { status: 400 }
        );
      }

      // Hash new password
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // Add email, phone, city, and address to update data if provided
    if (email !== undefined) {
      updateData.email = email.trim().toLowerCase();
    }

    if (phone !== undefined) {
      updateData.phone = sanitizePhone(phone);
    }

    if (city !== undefined) {
      updateData.city = city.trim() || null;
    }

    if (address !== undefined) {
      updateData.address = address.trim() || null;
    }

    // Update the charity account
    const updatedCharity = await db.user.update({
      where: { id: charityId },
      data: updateData,
      include: {
        userType: true,
      },
    });

    // Return updated safe fields
    const accountData = {
      id: updatedCharity.id,
      name: updatedCharity.name,
      email: updatedCharity.email,
      phone: updatedCharity.phone,
      city: updatedCharity.city,
      address: updatedCharity.address,
      createdAt: updatedCharity.createdAt,
      updatedAt: updatedCharity.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: accountData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating charity account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to update charity account.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/charity/account
 * Updates the logged-in charity account (partial updates allowed)
 */
export async function PATCH(request: NextRequest) {
  try {
    console.log("PATCH method called");
    // Get authenticated user
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const charityId = parseInt(session.user.id);

    // Load the user with its userType
    const charity = await db.user.findUnique({
      where: { id: charityId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        passwordHash: true,
        address: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!charity) {
      return NextResponse.json(
        { success: false, error: "Charity not found." },
        { status: 404 }
      );
    }

    if (charity.userType.name !== "charity") {
      return NextResponse.json(
        { success: false, error: "User is not a charity." },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const {
      email,
      phone,
      city,
      address,
      currentPassword,
      newPassword,
      confirmPassword,
      name,
    } = body;

    // Prepare update data
    const updateData: {
      updatedAt: Date;
      email?: string;
      phone?: string;
      city?: string;
      address?: string;
      name?: string;
      passwordHash?: string;
    } = {
      updatedAt: new Date(),
    };

    // Handle email if provided
    if (email !== undefined) {
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

      if (existingUser && existingUser.id !== charityId) {
        return NextResponse.json(
          { success: false, error: "Email address is already in use." },
          { status: 409 }
        );
      }

      updateData.email = email.trim().toLowerCase();
    }

    // Handle phone if provided
    if (phone !== undefined) {
      if (typeof phone !== "string" || sanitizePhone(phone).length < 8) {
        return NextResponse.json(
          {
            success: false,
            error: "Phone number must be at least 8 characters.",
          },
          { status: 400 }
        );
      }
      updateData.phone = sanitizePhone(phone);
    }

    // Handle name if provided
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: "Name is required." },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    // Handle city if provided
    if (city !== undefined) {
      if (typeof city !== "string") {
        return NextResponse.json(
          { success: false, error: "City must be a string." },
          { status: 400 }
        );
      }
      updateData.city = city.trim() || null;
    }

    // Handle address if provided
    if (address !== undefined) {
      if (typeof address !== "string") {
        return NextResponse.json(
          { success: false, error: "Address must be a string." },
          { status: 400 }
        );
      }
      updateData.address = address.trim() || null;
    }

    // Handle password update if newPassword is provided
    if (newPassword !== undefined) {
      // All password fields are required for password update
      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Current password, new password, and confirm password are required for password update.",
          },
          { status: 400 }
        );
      }

      // Validate new password length
      if (newPassword.length < 8) {
        return NextResponse.json(
          {
            success: false,
            error: "New password must be at least 8 characters long.",
          },
          { status: 400 }
        );
      }

      // Check if new password matches confirm password
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          {
            success: false,
            error: "New password and confirm password do not match.",
          },
          { status: 400 }
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        charity.passwordHash
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect." },
          { status: 400 }
        );
      }

      // Hash new password
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // Update the charity account
    const updatedCharity = await db.user.update({
      where: { id: charityId },
      data: updateData,
      include: {
        userType: true,
      },
    });

    // Return updated safe fields
    const accountData = {
      id: updatedCharity.id,
      name: updatedCharity.name,
      email: updatedCharity.email,
      phone: updatedCharity.phone,
      city: updatedCharity.city,
      address: updatedCharity.address,
      createdAt: updatedCharity.createdAt,
      updatedAt: updatedCharity.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: accountData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating charity account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to update charity account.",
      },
      { status: 500 }
    );
  }
}
