import { NextResponse } from "next/server"; // NextResponse → used to return JSON responses in Next.js API routes.
// import { getCurrentUser, isPatient } from "@/lib/auth"; // Using your new helper , a helper that returns the currently logged-in user from authentication , isPatient(user) → a helper that checks if the user’s role is "PATIENT".
import { db } from "@/lib/db"; // db → Prisma database instance (db.healthProfile refers to the table/model).

/*
export async function GET() {
  try {

    
    // 1. Authenticate the User (The Real Way)
    const user = await getCurrentUser() as { id: number; role: string } | null; // Calls getCurrentUser() to get the logged-in user from cookies/session/JWT , If the user is not logged in, it returns null.


    // If there is no logged-in user, stop and return: -> 401 Unauthorized : client must log in first 
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Authorization Check (Using your new helper!)
    // Even if the user is logged in, only patients are allowed to access health profiles ,If the user is NOT a patient (role = ADMIN, DOCTOR, CHARITY, etc): return 403 Forbidden
    if (!isPatient(user)) {
      return NextResponse.json(
        { error: "Forbidden: Only patients can view this profile" },
        { status: 403 }
      );
    }
      

    // 3. Fetch Data from Database
    // The database is checked for a health profile where: userId matches the logged-in user's ID (userId = logged in user's id) ->So it fetches that patient’s profile only.
    const healthProfile = await db.healthProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

    // 4. Handle Case: Profile doesn't exist yet
    // Some users will not have created a health profile yet , Instead of error, we return: message with status 200 (OK) , and profile: null (no profile found)
    if (!healthProfile) {
      return NextResponse.json(
        { message: "Profile not set up", profile: null },
        { status: 200 }
      );
    }

    // 5. Return the Health Profile : If the profile exists → return it. ex., {"id": 1,"userId": 33,"bloodType": "O+","allergies": "Peanuts","medications": "Ibuprofen","chronicDiseases": "Asthma"}
    return NextResponse.json(healthProfile, { status: 200 });

  } catch (error) { // error handling -> If anything goes wrong in this try block, we catch it and log it to the console with status 500 (Internal Server Error)
    console.error("[HEALTH_PROFILE_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
*/



const TEMP_USER_ID = 3; // until real login is added

// ========= GET ==========
export async function GET() {
  try {
    const profile = await db.healthProfile.findUnique({
      where: { userId: TEMP_USER_ID }
    });

    return NextResponse.json(profile || {}, { status: 200 });

  } catch (error) {
    console.error("[HEALTH_PROFILE_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ========= POST ===========
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const saved = await db.healthProfile.upsert({
      where: { userId: TEMP_USER_ID },
      create: {
        userId: TEMP_USER_ID,
        fullName: data.fullName,
        dob: data.dob,
        gender: data.gender,
        bloodType: data.bloodType,
        height: data.height,
        weight: data.weight,
        conditions: data.conditions,
        medications: data.medications,
        emergencyName: data.contactName,
        emergencyRelation: data.relationship,
        emergencyPhone: data.contactNumber
      },
      update: {
        fullName: data.fullName,
        dob: data.dob,
        gender: data.gender,
        bloodType: data.bloodType,
        height: data.height,
        weight: data.weight,
        conditions: data.conditions,
        medications: data.medications,
        emergencyName: data.contactName,
        emergencyRelation: data.relationship,
        emergencyPhone: data.contactNumber
      }
    });

    return NextResponse.json(
      { success: true, data: saved },
      { status: 200 }
    );

  } catch (error) {
    console.error("[HEALTH_PROFILE_POST]", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
