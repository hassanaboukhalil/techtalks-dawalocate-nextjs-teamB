import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // ⚡ FIX: Use Promise.all instead of $transaction to prevent P2028 Errors
    // We also removed the queries for the deleted features (Banner & Recent Medicines)
    const [
      activeRequestsCount,
      completedRequestsCount,
      recentRequests,
      healthProfile
    ] = await Promise.all([
      
      // A. Count Active
      db.donationRequest.count({
        where: { userId: userId, status: { in: ['OPEN', 'IN_PROGRESS'] } }
      }),

      // B. Count Completed
      db.donationRequest.count({
        where: { userId: userId, status: 'FULFILLED' }
      }),

      // C. Get Recent Requests
      db.donationRequest.findMany({
        where: { userId: userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          medicine: { select: { name: true, strength: true } }
        }
      }),

      // D. Get Health Profile
      db.healthProfile.findUnique({
        where: { userId: userId }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          active: activeRequestsCount,
          completed: completedRequestsCount,
        },
        recentRequests,
        healthProfile 
      }
    });

  } catch (error) {
    console.error("[PATIENT_DASHBOARD_API]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}