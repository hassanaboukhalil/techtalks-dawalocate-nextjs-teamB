import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db"; 
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const charityId = parseInt(session.user.id);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const today = new Date();

    // --- FETCH DATA ---
    const [
      campaignCount,
      requestCount,
      donationCount,
      charity,
      allRequests,
      allOffers,
      requestStats,
      activeCampaignsList,
      topMedicinesRaw,
      // 1. Fetch My Recent Campaigns (Title + Date + EndDate)
      myRecentCampaigns 
    ] = await Promise.all([
      db.campaign.count({ where: { charityUserId: charityId } }),
      db.donationRequest.count({ where: { status: "OPEN" } }), // Global Requests
      db.donationOffer.count({ where: { status: "OPEN" } }),   // Global Offers
      db.user.findUnique({ where: { id: charityId }, select: { name: true } }),
      
      // Timeline (Global)
      db.donationRequest.findMany({ where: { createdAt: { gte: sixMonthsAgo } }, select: { createdAt: true } }),
      db.donationOffer.findMany({ where: { createdAt: { gte: sixMonthsAgo } }, select: { createdAt: true } }),
      
      // Pie (Global)
      db.donationRequest.groupBy({ by: ['status'], _count: { status: true } }),

      // Active Campaigns (for Goals Chart)
      db.campaign.findMany({
        where: { charityUserId: charityId, endDate: { gte: today } },
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true }
      }),

      // Top Medicines (Global)
      db.donationRequest.findMany({
        where: { status: "OPEN" },
        take: 50,
        include: { medicine: { select: { name: true } } }
      }),

      // Fetch my 5 recent campaigns
      db.campaign.findMany({
        where: { charityUserId: charityId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, startDate: true, endDate: true, createdAt: true }
      })
    ]);

    // --- PROCESS AREA CHART ---
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthIndex = d.getMonth();
      const monthName = months[monthIndex];
      monthlyData.push({
        name: monthName,
        requests: allRequests.filter(r => new Date(r.createdAt).getMonth() === monthIndex).length,
        donations: allOffers.filter(o => new Date(o.createdAt).getMonth() === monthIndex).length
      });
    }

    // --- PROCESS PIE CHART ---
    const statusConfig: any = {
      OPEN: { label: 'Pending', color: '#f97316' },
      FULFILLED: { label: 'Fulfilled', color: '#10b981' },
      IN_PROGRESS: { label: 'In Progress', color: '#3b82f6' }
    };
    const pieData = requestStats.map(stat => ({
      name: statusConfig[stat.status]?.label || stat.status,
      value: stat._count.status,
      color: statusConfig[stat.status]?.color || '#94a3b8'
    }));

    // --- PROCESS CAMPAIGN GOALS ---
    const campaignGoals = activeCampaignsList.map(c => ({
      name: c.title.length > 12 ? c.title.substring(0, 10) + "..." : c.title,
      goal: 100, 
      collected: 0 
    }));

    // --- PROCESS TOP MEDICINES ---
    const medCounts: Record<string, number> = {};
    topMedicinesRaw.forEach(r => {
      const name = r.medicine.name;
      medCounts[name] = (medCounts[name] || 0) + 1;
    });
    const topMedicines = Object.entries(medCounts)
      .map(([name, count]) => ({ name: name.substring(0, 12), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 🔥 FIXED LOGIC: Handle nullable endDate safely
    const campaignsWithStatus = myRecentCampaigns.map(campaign => ({
      ...campaign,
      status: (campaign.endDate && new Date(campaign.endDate) >= today) ? "Active" : "Closed"
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: { campaigns: campaignCount, requests: requestCount, donations: donationCount },
        charityName: charity?.name || "Charity",
        charts: {
          area: monthlyData,
          pie: pieData,
          campaignGoals: campaignGoals,
          topMedicines: topMedicines
        },
        myCampaigns: campaignsWithStatus 
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}