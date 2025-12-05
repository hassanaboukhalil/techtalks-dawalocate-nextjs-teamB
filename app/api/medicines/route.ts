import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/medicines
 * Fetch all medicines
 */
export async function GET() {
  try {
    const medicines = await db.medicine.findMany({
      select: {
        id: true,
        name: true,
        genericName: true,
        strength: true,
        form: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: medicines
    });
  } catch (error) {
    console.error("Error fetching medicines:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch medicines" 
      },
      { status: 500 }
    );
  }
}

