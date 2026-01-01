import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/global/requests
 * Fetches all patient donation requests (PUBLIC)
 * This endpoint does NOT require authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "OPEN" | "IN_PROGRESS" | "FULFILLED" | "all"
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const city = searchParams.get("city") || "";
    const medicine = searchParams.get("medicine") || "";
    const patient = searchParams.get("patient") || "";

    // Build query filters
    const where: import("@/lib/generated/prisma/client").Prisma.DonationRequestWhereInput = {};

    // Filter by status
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    // Filter by city
    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    // Filter by medicine name (through relation)
    if (medicine) {
      where.medicine = {
        OR: [
          { name: { contains: medicine, mode: "insensitive" } },
          { genericName: { contains: medicine, mode: "insensitive" } },
        ],
      };
    }

    // Filter by patient name (through relation)
    if (patient) {
      where.user = {
        name: {
          contains: patient,
          mode: "insensitive",
        },
      };
    }

    // Fetch requests with pagination
    const [requests, totalCount] = await Promise.all([
      db.donationRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              city: true,
              phone: true,
            },
          },
          medicine: {
            select: {
              id: true,
              name: true,
              genericName: true,
              strength: true,
              form: true,
              imageUrl: true,
            },
          },
        },
        orderBy: [
          { createdAt: "desc" }, // Most recent requests first
        ],
        take: limit,
        skip: offset,
      }),
      db.donationRequest.count({ where }),
    ]);

    // Return response
    return NextResponse.json(
      {
        success: true,
        data: requests,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + requests.length < totalCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GLOBAL_REQUESTS_GET]", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Failed to fetch patient requests.",
      },
      { status: 500 }
    );
  }
}

