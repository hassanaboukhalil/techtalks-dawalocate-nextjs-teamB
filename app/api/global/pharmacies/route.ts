import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/global/pharmacies
 * Public endpoint to search for pharmacies for autocomplete
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query")?.trim();
        const limit = parseInt(searchParams.get("limit") || "10");

        import type { UserWhereInput } from "@/lib/generated/prisma/client";

        const where: UserWhereInput = {
            userType: { name: "pharmacy" },
            status: "APPROVED",
        };

        if (query) {
            where.name = {
                contains: query,
                mode: "insensitive",
            };
        }

        const pharmacies = await db.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                city: true,
            },
            take: limit,
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json({
            success: true,
            data: pharmacies,
        });
    } catch (error) {
        console.error("Error searching pharmacies:", error);
        return NextResponse.json(
            { success: false, error: "Failed to search pharmacies" },
            { status: 500 }
        );
    }
}
