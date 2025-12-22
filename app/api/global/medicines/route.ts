import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("q") || "";

    const medicines = await db.medicine.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { genericName: { contains: search, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        genericName: true,
        strength: true,
        form: true,
      },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: medicines,
    });
  } catch (error) {
    console.error("[MEDICINES_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch medicines" },
      { status: 500 }
    );
  }
}
