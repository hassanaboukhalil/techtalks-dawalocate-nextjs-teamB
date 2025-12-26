import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [
      patientsCount,
      pharmaciesCount,
      charitiesCount,
      campaignsCount,
      donationOffersCount,
      donationRequestsCount,
      medicinesCount,
      // 1. NEW: Fetch Recent Activity
      recentActivity
    ] = await db.$transaction([
      db.user.count({ where: { userType: { name: "patient" } } }),
      db.user.count({ where: { userType: { name: "pharmacy" } } }),
      db.user.count({ where: { userType: { name: "charity" } } }),
      db.campaign.count(),
      db.donationOffer.count({ where: { status: "OPEN" } }),
      db.donationRequest.count({ where: { status: "OPEN" } }),
      db.medicine.count(),

      // 2. NEW: Get the last 5 requests
      db.donationRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          medicine: { select: { name: true } }
        }
      })
    ]);

    return NextResponse.json({
      users: {
        patients: patientsCount,
        pharmacies: pharmaciesCount,
        charities: charitiesCount,
        total: patientsCount + pharmaciesCount + charitiesCount
      },
      campaigns: campaignsCount,
      donations: {
        offers: donationOffersCount,
        requests: donationRequestsCount,
        completed: 0, // Placeholder for success count
      },
      medicines: medicinesCount,
      // 3. NEW: Send the list to frontend
      recentActivity: recentActivity 
    }, { status: 200 });

  } catch (error) {
    console.error("[ADMIN_DASHBOARD_GET]", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}