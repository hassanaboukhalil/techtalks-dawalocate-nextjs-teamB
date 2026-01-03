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
 * GET /api/pharmacy/account
 * Returns the logged-in pharmacy account info (safe fields only)
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

    const pharmacyId = parseInt(session.user.id);

    // Load the user with its userType
    const pharmacy = await db.user.findUnique({
      where: { id: pharmacyId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        address: true,
        openingHours: true,
        hasDelivery: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { success: false, error: "Pharmacy not found." },
        { status: 404 }
      );
    }

    if (pharmacy.userType.name !== "pharmacy") {
      return NextResponse.json(
        { success: false, error: "User is not a pharmacy." },
        { status: 403 }
      );
    }

    // Return only safe fields
    const accountData = {
      id: pharmacy.id,
      name: pharmacy.name,
      email: pharmacy.email,
      phone: pharmacy.phone,
      city: pharmacy.city,
      address: pharmacy.address,
      openingHours: pharmacy.openingHours,
      hasDelivery: pharmacy.hasDelivery,
      createdAt: pharmacy.createdAt,
      updatedAt: pharmacy.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: accountData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching pharmacy account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to fetch pharmacy account.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pharmacy/account
 * Updates the logged-in pharmacy account (partial updates allowed)
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

    const pharmacyId = parseInt(session.user.id);

    // Load the user with its userType
    const pharmacy = await db.user.findUnique({
      where: { id: pharmacyId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        passwordHash: true,
        address: true,
        openingHours: true,
        hasDelivery: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { success: false, error: "Pharmacy not found." },
        { status: 404 }
      );
    }

    if (pharmacy.userType.name !== "pharmacy") {
      return NextResponse.json(
        { success: false, error: "User is not a pharmacy." },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { email, phone, city, address, openingHours, hasDelivery, currentPassword, newPassword, confirmPassword } = body;

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

      if (existingUser && existingUser.id !== pharmacyId) {
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
          { success: false, error: "Phone number must be at least 8 characters." },
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

    // Validate openingHours if provided
    if (openingHours !== undefined) {
      if (typeof openingHours !== "string") {
        return NextResponse.json(
          { success: false, error: "Opening hours must be a string." },
          { status: 400 }
        );
      }
    }

    // Validate hasDelivery if provided
    if (hasDelivery !== undefined) {
      if (typeof hasDelivery !== "boolean") {
        return NextResponse.json(
          { success: false, error: "Has delivery must be a boolean." },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Handle password update if newPassword is provided
    if (newPassword !== undefined) {
      // All password fields are required for password update
      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json(
          {
            success: false,
            error: "Current password, new password, and confirm password are required for password update.",
          },
          { status: 400 }
        );
      }

      // Validate new password length
      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 8 characters long." },
          { status: 400 }
        );
      }

      // Check if new password matches confirm password
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { success: false, error: "New password and confirm password do not match." },
          { status: 400 }
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        pharmacy.passwordHash
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

    // Add email, phone, city, address, openingHours, and hasDelivery to update data if provided
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

    if (openingHours !== undefined) {
      updateData.openingHours = openingHours.trim() || null;
    }

    if (hasDelivery !== undefined) {
      updateData.hasDelivery = hasDelivery;
    }

    // Update the pharmacy account
    const updatedPharmacy = await db.user.update({
      where: { id: pharmacyId },
      data: updateData,
      include: {
        userType: true,
      },
    });

    // Return updated safe fields
    const accountData = {
      id: updatedPharmacy.id,
      name: updatedPharmacy.name,
      email: updatedPharmacy.email,
      phone: updatedPharmacy.phone,
      city: updatedPharmacy.city,
      address: updatedPharmacy.address,
      openingHours: updatedPharmacy.openingHours,
      hasDelivery: updatedPharmacy.hasDelivery,
      createdAt: updatedPharmacy.createdAt,
      updatedAt: updatedPharmacy.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: accountData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating pharmacy account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to update pharmacy account.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pharmacy/account
 * Updates the logged-in pharmacy account (partial updates allowed)
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

    const pharmacyId = parseInt(session.user.id);

    // Load the user with its userType
    const pharmacy = await db.user.findUnique({
      where: { id: pharmacyId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        passwordHash: true,
        address: true,
        openingHours: true,
        hasDelivery: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { success: false, error: "Pharmacy not found." },
        { status: 404 }
      );
    }

    if (pharmacy.userType.name !== "pharmacy") {
      return NextResponse.json(
        { success: false, error: "User is not a pharmacy." },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { email, phone, city, address, openingHours, hasDelivery, currentPassword, newPassword, confirmPassword, name } = body;

    // Prepare update data
    const updateData: any = {
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

      if (existingUser && existingUser.id !== pharmacyId) {
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
          { success: false, error: "Phone number must be at least 8 characters." },
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

    // Handle openingHours if provided
    if (openingHours !== undefined) {
      if (typeof openingHours !== "string") {
        return NextResponse.json(
          { success: false, error: "Opening hours must be a string." },
          { status: 400 }
        );
      }
      updateData.openingHours = openingHours.trim() || null;
    }

    // Handle hasDelivery if provided
    if (hasDelivery !== undefined) {
      if (typeof hasDelivery !== "boolean") {
        return NextResponse.json(
          { success: false, error: "Has delivery must be a boolean." },
          { status: 400 }
        );
      }
      updateData.hasDelivery = hasDelivery;
    }

    // Handle password update if newPassword is provided
    if (newPassword !== undefined) {
      // All password fields are required for password update
      if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json(
          {
            success: false,
            error: "Current password, new password, and confirm password are required for password update.",
          },
          { status: 400 }
        );
      }

      // Validate new password length
      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 8 characters long." },
          { status: 400 }
        );
      }

      // Check if new password matches confirm password
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { success: false, error: "New password and confirm password do not match." },
          { status: 400 }
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        pharmacy.passwordHash
      );

      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect." },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.passwordHash = hashedPassword;
      console.log("Password successfully hashed and updated for user:", pharmacyId);
    }

    // Update the pharmacy account
    const updatedPharmacy = await db.user.update({
      where: { id: pharmacyId },
      data: updateData,
      include: {
        userType: true,
      },
    });

    // Return updated safe fields
    const accountData = {
      id: updatedPharmacy.id,
      name: updatedPharmacy.name,
      email: updatedPharmacy.email,
      phone: updatedPharmacy.phone,
      city: updatedPharmacy.city,
      address: updatedPharmacy.address,
      openingHours: updatedPharmacy.openingHours,
      hasDelivery: updatedPharmacy.hasDelivery,
      createdAt: updatedPharmacy.createdAt,
      updatedAt: updatedPharmacy.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: accountData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating pharmacy account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to update pharmacy account.",
      },
      { status: 500 }
    );
  }
}
