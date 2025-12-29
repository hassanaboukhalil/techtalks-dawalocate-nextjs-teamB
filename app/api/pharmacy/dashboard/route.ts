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

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { userType: true }
    });
    if (!user || user.userType.name !== "pharmacy") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const LOW_STOCK_THRESHOLD = 10;
    
    // 🗓️ DEFINE EXPIRY WINDOW (e.g., Next 90 Days)
    //const today = new Date();
    //const futureDate = new Date();
    //futureDate.setDate(today.getDate() + 90); // Look 3 months ahead

    // 🗓️ DEFINE EXPIRY WINDOW
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 👈 RESET time to 00:00:00 (Midnight)
    
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 180);

    // ... inside the query ...
    // expiresAt: {
    //   not: null,
    //   lte: futureDate,
    //   gte: today      // 👈 CHANGE 'gt' TO 'gte' (Greater Than or Equal)
    // }
    const [total, outOfStock, lowStock, inStock, recentRequests, activeCampaigns, expiringSoon] = await db.$transaction([
      // Inventory Counts
      db.pharmacyMedicine.count({ where: { pharmacyId: userId } }),
      db.pharmacyMedicine.count({ where: { pharmacyId: userId, quantity: 0 } }),
      db.pharmacyMedicine.count({ where: { pharmacyId: userId, quantity: { gt: 0, lte: LOW_STOCK_THRESHOLD } } }),
      db.pharmacyMedicine.count({ where: { pharmacyId: userId, quantity: { gt: LOW_STOCK_THRESHOLD } } }),

      // Recent Requests
      db.donationRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        where: { status: 'OPEN' },
        include: {
          user: { select: { name: true, city: true } },
          medicine: { select: { name: true } }
        }
      }),

      // Active Campaigns
      db.campaign.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          charity: { select: { name: true } }
        }
      }),

      // 🆕 REAL EXPIRING SOON FETCH
      db.pharmacyMedicine.findMany({
        where: {
          pharmacyId: userId,
          expiresAt: {
            not: null,       // Must have an expiry date
            lte: futureDate, // Expiring before our limit (90 days)
            gt: today        // Not already expired (future only)
          }
        },
        take: 5, // Show top 5 urgent ones
        orderBy: { expiresAt: 'asc' }, // Soonest first
        include: {
          medicine: { select: { name: true } }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        inStock,
        lowStock,
        outOfStock,
        recentRequests,
        activeCampaigns,
        expiringSoon // 👈 Sending real data!
      }
    }, { status: 200 });

  } catch (error) {
    console.error("[PHARMACY_DASHBOARD]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}