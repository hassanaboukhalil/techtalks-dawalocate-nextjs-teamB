import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { db } from "@/lib/db";

//This file handles the logic. It receives the request, translates the data, and talks to the database.


// Helper to get user session securely , GET the currently logged-in user
async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  //if no session exists , return null (user is not logged in)
  return session?.user || null;
}

// ========= GET ========== Fetches the profile to display on the page
export async function GET() {
  try {
    // 1. Check who is knocking at the door (Auth Check)
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role Check (Optional but recommended)
    // if (user.userType !== "PATIENT") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    //  Convert String ID to Int for Prisma
    // 2. CONVERSION STEP: 
    // NextAuth gives ID as "String", but Database wants "Int"
    const userIdInt = parseInt(user.id);

    // 3. Find the profile in the database
    const profile = await db.healthProfile.findUnique({
      where: { userId: userIdInt }
    });

    // 4. Return the profile. 
    // If null (no profile yet), return empty object {} so frontend doesn't crash.
    return NextResponse.json(profile || {}, { status: 200 });

  } catch (error) {
    console.error("[HEALTH_PROFILE_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ========= POST ========== Saves or Updates the profile
export async function POST(req: Request) {
  try {
    // 1. Auth Check
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get the data sent from the Frontend form
    const data = await req.json();
    

    // 3. CONVERSION STEP: String ID -> Int ID
    const userIdInt = parseInt(user.id);

    //  Upsert (Create or Update)
    // 4. UPSERT (Update if exists, Insert if new)
    // We explicitly map Frontend names (right) to Database columns (left)
    const saved = await db.healthProfile.upsert({
      where: { userId: userIdInt },
      create: {
        userId: userIdInt,
        fullName: data.fullName,
        dob: data.dob,
        gender: data.gender,
        bloodType: data.bloodType,
        // Safety check: ensure we save strings, not numbers
        height: data.height ? String(data.height) : null,
        weight: data.weight ? String(data.weight) : null,
        conditions: data.conditions,
        medications: data.medications, // Expecting a string (joined by \n) from frontend
        // 3. Map Frontend "contactName" -> DB "emergencyName"
        // MAPPING FIX: databaseField: data.frontendField
        emergencyName: data.contactName,
        emergencyRelation: data.relationship,
        emergencyPhone: data.contactNumber
      },
      update: {
        fullName: data.fullName,
        dob: data.dob,
        gender: data.gender,
        bloodType: data.bloodType,
        height: data.height ? String(data.height) : null,
        weight: data.weight ? String(data.weight) : null,
        conditions: data.conditions,
        medications: data.medications,
        // MAPPING FIX FOR UPDATE AS WELL
        emergencyName: data.contactName,
        emergencyRelation: data.relationship,
        emergencyPhone: data.contactNumber
      }
    });

    return NextResponse.json({ success: true, data: saved }, { status: 200 });

  } catch (error) {
    console.error("[HEALTH_PROFILE_POST]", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}