import { NextResponse } from "next/server";
import { getCurrentUser, isPatient } from "@/lib/auth"; // Using your new helper
import { db } from "@/lib/db";

export async function GET() {
  try {
    // --- TEMPORARY TEST: MIMIC SARA (ID 8) ---
    // const user = await getCurrentUser() as ... (Comment this out)
    
    const user = { id: 8, role: "patient" }; // <--- We pretend to be Sara

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Authorization Check (Using your new helper!)
    if (!isPatient(user)) {
      return NextResponse.json(
        { error: "Forbidden: Only patients can view this profile" },
        { status: 403 }
      );
    }

    // 3. Fetch Data from Database
    const healthProfile = await db.healthProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

    // 4. Handle Case: Profile doesn't exist yet
    if (!healthProfile) {
      return NextResponse.json(
        { message: "Profile not set up", profile: null },
        { status: 200 }
      );
    }

    // 5. Return the Health Profile
    return NextResponse.json(healthProfile, { status: 200 });

  } catch (error) {
    console.error("[HEALTH_PROFILE_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}