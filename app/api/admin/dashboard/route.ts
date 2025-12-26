import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [
      // 1. PATIENTS (Just count)
      patientsCount,
      
      // 2. PHARMACIES (Detailed Breakdown)
      pharmaciesTotal,
      pharmaciesPending,
      pharmaciesApproved,
      
      // 3. CHARITIES (Detailed Breakdown)
      charitiesTotal,
      charitiesPending,
      charitiesApproved,
      
      // 4. CAMPAIGNS
      campaignsCount,
      
      // 5. DONATIONS
      activeOffersCount,
      activeRequestsCount,
      fulfilledRequestsCount, 
      
      medicinesCount,
      recentActivity
    ] = await db.$transaction([
      // Patients
      db.user.count({ where: { userType: { name: "patient" } } }),

      // Pharmacies
      db.user.count({ where: { userType: { name: "pharmacy" } } }),
      db.user.count({ where: { userType: { name: "pharmacy" }, status: "PENDING" } }),
      db.user.count({ where: { userType: { name: "pharmacy" }, status: "APPROVED" } }),

      // Charities
      db.user.count({ where: { userType: { name: "charity" } } }),
      db.user.count({ where: { userType: { name: "charity" }, status: "PENDING" } }),
      db.user.count({ where: { userType: { name: "charity" }, status: "APPROVED" } }),

      // Campaigns
      db.campaign.count(),

      // Donations
      db.donationOffer.count({ where: { status: "OPEN" } }),
      db.donationRequest.count({ where: { status: "OPEN" } }),
      db.donationRequest.count({ where: { status: "FULFILLED" } }), // Matches your Schema!

      // Medicines
      db.medicine.count(),

      // Recent Activity
      db.donationRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          medicine: { select: { name: true } }
        }
      })
    ]);

    // --- CONSTRUCT THE ADVANCED JSON RESPONSE ---
    return NextResponse.json({
      users: {
        patients: patientsCount,
        pharmacies: {
            total: pharmaciesTotal,
            pending: pharmaciesPending,
            approved: pharmaciesApproved,
            rejected: pharmaciesTotal - (pharmaciesPending + pharmaciesApproved) 
        },
        charities: {
            total: charitiesTotal,
            pending: charitiesPending,
            approved: charitiesApproved,
            rejected: charitiesTotal - (charitiesPending + charitiesApproved)
        }
      },
      campaigns: campaignsCount,
      donations: {
        offers: activeOffersCount,
        requests: activeRequestsCount,
        fulfilled: fulfilledRequestsCount,
      },
      medicines: medicinesCount,
      recentActivity
    }, { status: 200 });

  } catch (error) {
    console.error("[ADMIN_DASHBOARD_GET]", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}