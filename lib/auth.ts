import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { db } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  userTypeId: number;
  userTypeName: string;
  city: string | null;
  phone: string | null;
  address: string | null;
  openingHours: string | null;
  hasDelivery: boolean | null;
  status: string | null;
}

/**
 * Get the currently authenticated user from the JWT token in cookies.
 * Returns null if not authenticated or token is invalid.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    // Verify and decode the JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const userId = payload.userId as number;

    if (!userId) {
      return null;
    }

    // Fetch user from database with userType
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userType: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      userTypeId: user.userTypeId,
      userTypeName: user.userType.name,
      city: user.city,
      phone: user.phone,
      address: user.address,
      openingHours: user.openingHours,
      hasDelivery: user.hasDelivery,
      status: user.status,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Check if the current user is a pharmacy
 */
export function isPharmacy(user: CurrentUser | null): boolean {
  return user?.userTypeName === "pharmacy";
}

/**
 * Check if the current user is a charity
 */
export function isCharity(user: CurrentUser | null): boolean {
  return user?.userTypeName === "charity";
}

/**
 * Check if the current user is a patient
 */
export function isPatient(user: CurrentUser | null): boolean {
  return user?.userTypeName === "patient";
}

/**
 * Check if the current user is an admin
 */
export function isAdmin(user: CurrentUser | null): boolean {
  return user?.userTypeName === "admin";
}

