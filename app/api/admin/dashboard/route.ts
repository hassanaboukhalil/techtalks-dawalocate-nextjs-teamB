import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [
      // ... (Keep your counts exactly as they are) ...
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
      
      // 🔴 CHANGE: Instead of one 'recentActivity', we fetch two lists
      recentRequests,
      recentOffers, // 👈 NEW
      
      topRequestedMedsGroup,
      pendingQueueRaw

    ] = await db.$transaction([
      // ... (Keep the count queries exactly the same) ...
      db.user.count({ where: { userType: { name: "patient" } } }),
      db.user.count({ where: { userType: { name: "pharmacy" } } }),
      db.user.count({ where: { userType: { name: "pharmacy" }, status: "PENDING" } }),
      db.user.count({ where: { userType: { name: "pharmacy" }, status: "APPROVED" } }),
      db.user.count({ where: { userType: { name: "charity" } } }),
      db.user.count({ where: { userType: { name: "charity" }, status: "PENDING" } }),
      db.user.count({ where: { userType: { name: "charity" }, status: "APPROVED" } }),
      db.campaign.count(),
      db.donationOffer.count({ where: { status: "OPEN" } }),
      db.donationRequest.count({ where: { status: "OPEN" } }),
      db.donationRequest.count({ where: { status: "FULFILLED" } }),
      db.medicine.count(),

      // 1. Recent Requests (Patients asking for help)
      db.donationRequest.findMany({
        take: 5, // Keep it short for the "Live" feel
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          medicine: { select: { id: true, name: true } }
        }
      }),

      // 2. Recent Offers (Patients/Donors offering help) 👈 NEW QUERY
      db.donationOffer.findMany({
        take: 5, 
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          medicine: { select: { id: true, name: true } }
        }
      }),

      // ... (Keep the rest: topRequestedMedsGroup, pendingQueueRaw) ...
      db.donationRequest.groupBy({
        by: ['medicineId'],
        _count: { medicineId: true },
        orderBy: { _count: { medicineId: 'desc' } },
        take: 7,
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
        }
      })
    ]);

    // --- PROCESSING (Keep existing logic) ---

    const topMedicines = await Promise.all(
      topRequestedMedsGroup.map(async (item) => {
        const safeItem = item as any;
        const med = await db.medicine.findUnique({ where: { id: safeItem.medicineId } });
        return { 
            id: med?.id,
            name: med?.name || "Unknown", 
            count: safeItem._count.medicineId 
        };
      })
    );

    const pendingQueue = pendingQueueRaw.map((u) => ({
        id: u.id,
        name: u.name,
        type: u.userType.name, 
        location: u.city || "Unknown",
        date: u.createdAt.toISOString().split('T')[0]
    }));

    // --- RETURN ---
    return NextResponse.json({
      // ... (Keep users, campaigns, donations, medicines structure) ...
      users: {
        patients: patientsCount,
        pharmacies: {
            total: pharmaciesCount,
            pending: pharmaciesPending,
            approved: pharmaciesApproved,
            rejected: pharmaciesCount - (pharmaciesPending + pharmaciesApproved) 
        },
        charities: {
            total: charitiesCount,
            pending: charitiesPending,
            approved: charitiesApproved,
            rejected: charitiesCount - (charitiesPending + charitiesApproved)
        }
      },
      campaigns: campaignsCount,
      donations: {
        offers: activeOffersCount,
        requests: activeRequestsCount,
        fulfilled: fulfilledRequestsCount,
      },
      medicines: medicinesCount,
      
      // 👇 SEND THE SPLIT LISTS
      recentActivity: {
        requests: recentRequests,
        offers: recentOffers
      },
      
      analytics: {
        topMedicines,
        pendingQueue
      }
    }, { status: 200 });

  } catch (error) {
    console.error("[ADMIN_DASHBOARD_GET]", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}