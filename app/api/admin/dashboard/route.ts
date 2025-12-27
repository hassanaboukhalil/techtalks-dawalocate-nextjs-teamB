import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Split queries into smaller batches to avoid transaction timeout

    // Batch 1: Simple counts (fast queries)
    const [
      patientsCount,
      pharmaciesCount,
      pharmaciesPending,
      pharmaciesApproved,
      charitiesCount,
      charitiesPending,
      charitiesApproved,
      campaignsCount,
      activeOffersCount,
      activeRequestsCount,
      fulfilledRequestsCount,
      medicinesCount,
    ] = await Promise.all([
      db.user.count({ where: { userType: { name: "patient" } } }),
      db.user.count({ where: { userType: { name: "pharmacy" } } }),
      db.user.count({
        where: { userType: { name: "pharmacy" }, status: "PENDING" },
      }),
      db.user.count({
        where: { userType: { name: "pharmacy" }, status: "APPROVED" },
      }),
      db.user.count({ where: { userType: { name: "charity" } } }),
      db.user.count({
        where: { userType: { name: "charity" }, status: "PENDING" },
      }),
      db.user.count({
        where: { userType: { name: "charity" }, status: "APPROVED" },
      }),
      db.campaign.count(),
      db.donationOffer.count({ where: { status: "OPEN" } }),
      db.donationRequest.count({ where: { status: "OPEN" } }),
      db.donationRequest.count({ where: { status: "FULFILLED" } }),
      db.medicine.count(),
    ]);

    // Batch 2: Recent activity (with includes - heavier queries)
    const [recentRequests, recentOffers] = await Promise.all([
      db.donationRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          medicine: { select: { id: true, name: true } },
        },
      }),
      db.donationOffer.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          medicine: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Batch 3: Analytics data
    const [topRequestedMedsRaw, pendingQueueRaw] = await Promise.all([
      // Use findMany with include instead of groupBy + separate queries
      db.donationRequest.findMany({
        take: 50, // Get more to ensure we have 7 unique medicines after grouping
        orderBy: { createdAt: "desc" },
        select: {
          medicineId: true,
          medicine: { select: { id: true, name: true } },
        },
      }),
      db.user.findMany({
        where: { status: "PENDING" },
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          userType: { select: { name: true } },
          createdAt: true,
        },
      }),
    ]);

    // Process top medicines (client-side grouping to avoid N+1 queries)
    const medicineCountMap = new Map<
      number,
      { id: number; name: string; count: number }
    >();
    topRequestedMedsRaw.forEach((req) => {
      const medId = req.medicineId;
      const existing = medicineCountMap.get(medId);
      if (existing) {
        existing.count++;
      } else {
        medicineCountMap.set(medId, {
          id: req.medicine.id,
          name: req.medicine.name,
          count: 1,
        });
      }
    });

    const topMedicines = Array.from(medicineCountMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    const pendingQueue = pendingQueueRaw.map((u) => ({
      id: u.id,
      name: u.name,
      type: u.userType.name,
      location: u.city || "Unknown",
      date: u.createdAt.toISOString().split("T")[0],
    }));

    // Return response
    return NextResponse.json(
      {
        users: {
          patients: patientsCount,
          pharmacies: {
            total: pharmaciesCount,
            pending: pharmaciesPending,
            approved: pharmaciesApproved,
            rejected:
              pharmaciesCount - (pharmaciesPending + pharmaciesApproved),
          },
          charities: {
            total: charitiesCount,
            pending: charitiesPending,
            approved: charitiesApproved,
            rejected: charitiesCount - (charitiesPending + charitiesApproved),
          },
        },
        campaigns: campaignsCount,
        donations: {
          offers: activeOffersCount,
          requests: activeRequestsCount,
          fulfilled: fulfilledRequestsCount,
        },
        medicines: medicinesCount,
        recentActivity: {
          requests: recentRequests,
          offers: recentOffers,
        },
        analytics: {
          topMedicines,
          pendingQueue,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[ADMIN_DASHBOARD_GET]", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
