"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { 
  Users, Building2, Heart, Megaphone, Pill, Activity, ArrowUpRight, Loader2, Clock, CheckCircle2, TrendingUp, AlertTriangle, XCircle, ShieldCheck
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from "recharts";

// --- TYPES ---
interface DashboardStats {
  users: {
    patients: number;
    // The Advanced API returns objects now, so we map them here
    pharmacies: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    charities: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
  };
  campaigns: number;
  donations: {
    offers: number;
    requests: number;
    fulfilled: number;
  };
  medicines: number;
  recentActivity: Array<{
    id: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
    medicine: { name: string };
  }>;
}

const PIE_COLORS = ["#10b981", "#f59e0b", "#3b82f6"];

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/admin/dashboard");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#119abf]" />
      </div>
    );
  }

  if (!stats) return null;

  const userDistributionData = [
    { name: "Patients", count: stats.users.patients },
    { name: "Pharmacies", count: stats.users.pharmacies.total },
    { name: "Charities", count: stats.users.charities.total },
  ];

  const donationData = [
    { name: `Offers (${stats.donations.offers})`, value: stats.donations.offers },
    { name: `Requests (${stats.donations.requests})`, value: stats.donations.requests },
    { name: `Fulfilled (${stats.donations.fulfilled})`, value: stats.donations.fulfilled },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-slate-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Real-time platform statistics and verification center.</p>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
           📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* --- SECTION 1: THE LIVELY OVERVIEW (Original Style) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Patients */}
        <div className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.2)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Patients</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.users.patients}</h3>
              <div className="flex items-center mt-2 text-sm text-emerald-600 font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" /> +12% <span className="text-slate-400 ml-1 font-normal">this month</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 mt-6 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-1.5 rounded-full w-[70%]" />
          </div>
        </div>

        {/* Card 2: Pharmacies (Total) */}
        <div className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.2)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pharmacies</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.users.pharmacies.total}</h3>
              <div className="flex items-center mt-2 text-sm text-blue-600 font-medium bg-blue-50 w-fit px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Partners <span className="text-slate-400 ml-1 font-normal">Registered</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
           <div className="w-full bg-slate-100 h-1.5 mt-6 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full w-[85%]" />
          </div>
        </div>

        {/* Card 3: Campaigns */}
        <div className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(147,51,234,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(147,51,234,0.2)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Campaigns</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.campaigns}</h3>
               <div className="flex items-center mt-2 text-sm text-purple-600 font-medium bg-purple-50 w-fit px-2 py-0.5 rounded-full">
                <Activity className="w-3 h-3 mr-1" /> Active <span className="text-slate-400 ml-1 font-normal">now</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Megaphone className="w-6 h-6" />
            </div>
          </div>
           <div className="w-full bg-slate-100 h-1.5 mt-6 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-1.5 rounded-full w-[45%]" />
          </div>
        </div>

        {/* Card 4: Medicines */}
        <div className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(245,158,11,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(245,158,11,0.2)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Medicines</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.medicines}</h3>
              <div className="flex items-center mt-2 text-sm text-amber-600 font-medium bg-amber-50 w-fit px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-1" /> Stock <span className="text-slate-400 ml-1 font-normal">available</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Pill className="w-6 h-6" />
            </div>
          </div>
           <div className="w-full bg-slate-100 h-1.5 mt-6 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full w-[60%]" />
          </div>
        </div>
      </div>


      {/* --- SECTION 2: NEW "SATURATED" VERIFICATION CENTER --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pharmacy Verification Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900">Pharmacy Approvals</h3>
                </div>
                <span className="text-xs font-medium bg-white border px-2 py-1 rounded text-slate-500">
                    Total: {stats.users.pharmacies.total}
                </span>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
                {/* Pending - Saturated Yellow */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-amber-600">{stats.users.pharmacies.pending}</span>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide mt-1 flex items-center gap-1">
                        {stats.users.pharmacies.pending > 0 && <AlertTriangle className="w-3 h-3 animate-bounce" />}
                        Pending
                    </span>
                </div>
                {/* Approved - Saturated Green */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-emerald-600">{stats.users.pharmacies.approved}</span>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide mt-1">Active</span>
                </div>
                {/* Rejected - Saturated Red */}
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-rose-600">{stats.users.pharmacies.rejected}</span>
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wide mt-1">Rejected</span>
                </div>
            </div>
        </div>

        {/* Charity Verification Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                        <Heart className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900">Charity Approvals</h3>
                </div>
                <span className="text-xs font-medium bg-white border px-2 py-1 rounded text-slate-500">
                    Total: {stats.users.charities.total}
                </span>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
                {/* Pending */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-amber-600">{stats.users.charities.pending}</span>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide mt-1 flex items-center gap-1">
                         {stats.users.charities.pending > 0 && <AlertTriangle className="w-3 h-3 animate-bounce" />}
                        Pending
                    </span>
                </div>
                {/* Approved */}
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-purple-600">{stats.users.charities.approved}</span>
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wide mt-1">Active</span>
                </div>
                {/* Rejected */}
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-rose-600">{stats.users.charities.rejected}</span>
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wide mt-1">Rejected</span>
                </div>
            </div>
        </div>

      </div>


      {/* --- SECTION 3: CHARTS & ACTIVITY (Standard) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Distribution Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg text-[#119abf]"><Activity className="w-5 h-5" /></div>
                <h3 className="text-lg font-bold text-slate-900">User Growth</h3>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userDistributionData} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="count" fill="#119abf" radius={[8, 8, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Donation Activity Pie Chart */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-500"><Heart className="w-5 h-5" /></div>
                <h3 className="text-lg font-bold text-slate-900">Impact Overview</h3>
            </div>
            <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie 
                        data={donationData} 
                        cx="50%" cy="50%" 
                        innerRadius={80} outerRadius={110} 
                        paddingAngle={5} 
                        dataKey="value" stroke="none"
                    >
                    {donationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
      
      {/* Recent Activity Section */}
      <div className="bg-white p-0 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-fit overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Clock className="w-5 h-5" /></div>
               <h3 className="text-lg font-bold text-slate-900">Live Activity</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[400px]">
            {(stats.recentActivity?.length || 0) === 0 ? (
                <div className="text-center py-10">
                    <p className="text-sm text-slate-400 italic">No recent activity detected.</p>
                </div>
            ) : (
                stats.recentActivity.map((item) => (
                    <div key={item.id} className="group flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-50 group-hover:ring-blue-100 transition-all"></div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                New Request for <span className="text-[#119abf]">{item.medicine?.name || "Medicine"}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                                    {item.user?.name || "Anonymous"}
                                </p>
                                <span className="text-[10px] text-slate-400">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))
            )}
          </div>
           <div className="p-4 border-t border-slate-50 bg-slate-50/30 text-center">
            <Link href="/admin/donations" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              View All History
            </Link>
          </div>
      </div>

    </div>
  );
}