import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("q") || "";

    const medicines = await db.medicine.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { genericName: { contains: search, mode: "insensitive" } },
              { synonyms: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined, // No filter when no search term - return all medicines
      select: {
        id: true,
        name: true,
        genericName: true,
        strength: true,
        form: true,
        synonyms: true,
      },
      orderBy: {
        name: "asc", // Order alphabetically for better UX
      },
      // Removed take: 20 to return all medicines
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
