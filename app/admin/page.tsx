"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { 
  Users, Building2, Heart, Megaphone, Pill, Activity, ArrowUpRight, Loader2, Clock, CheckCircle2, TrendingUp, ShieldCheck, Flame, ChevronRight, ExternalLink, AlertTriangle, Gift, HandHeart
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from "recharts";
import { PageTitle } from "@/components/layout/PageTitle";

// --- TYPES ---
interface DashboardStats {
  users: {
    patients: number;
    pharmacies: { total: number; pending: number; approved: number; rejected: number; };
    charities: { total: number; pending: number; approved: number; rejected: number; };
  };
  campaigns: number;
  donations: { offers: number; requests: number; fulfilled: number; };
  medicines: number;
  recentActivity: {
    // 👇 Split into two arrays
    requests: Array<{
        id: number; createdAt: string;
        user: { id: number; name: string; email: string };
        medicine: { id: number; name: string };
    }>;
    offers: Array<{
        id: number; createdAt: string;
        user: { id: number; name: string; email: string };
        medicine: { id: number; name: string };
    }>;
  };
  analytics: {
    topMedicines: Array<{ id: number; name: string; count: number }>;
    pendingQueue: Array<{ id: number; name: string; type: string; location: string; date: string }>;
  };
}

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

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

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-[#119abf]" /></div>;
  if (!stats) return null;

  const userDistributionData = [
    { name: "Patients", count: stats.users.patients },
    { name: "Pharmacies", count: stats.users.pharmacies.total },
    { name: "Charities", count: stats.users.charities.total },
  ];

  const donationData = [
    { name: `Fulfilled (${stats.donations.fulfilled})`, value: stats.donations.fulfilled },
    { name: `Offers (${stats.donations.offers})`, value: stats.donations.offers },
    { name: `Requests (${stats.donations.requests})`, value: stats.donations.requests },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-slate-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <PageTitle>Dashboard Overview</PageTitle>
          <p className="text-slate-500 mt-1">Real-time platform statistics and verification queue.</p>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
           📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* --- SECTION 1: THE LIVELY OVERVIEW --- */}
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

        {/* Card 2: Pharmacies */}
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

      {/* --- SECTION 2: VERIFICATION CENTER --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><ShieldCheck className="w-5 h-5" /></div>
                    <h3 className="font-bold text-slate-900">Pharmacy Approvals</h3>
                </div>
                <span className="text-xs font-medium bg-white border px-2 py-1 rounded text-slate-500">Total: {stats.users.pharmacies.total}</span>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-amber-600">{stats.users.pharmacies.pending}</span>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide mt-1 flex items-center gap-1">
                        {stats.users.pharmacies.pending > 0 && <AlertTriangle className="w-3 h-3 animate-bounce" />} Pending
                    </span>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-emerald-600">{stats.users.pharmacies.approved}</span>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide mt-1">Active</span>
                </div>
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-rose-600">{stats.users.pharmacies.rejected}</span>
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wide mt-1">Rejected</span>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Heart className="w-5 h-5" /></div>
                    <h3 className="font-bold text-slate-900">Charity Approvals</h3>
                </div>
                <span className="text-xs font-medium bg-white border px-2 py-1 rounded text-slate-500">Total: {stats.users.charities.total}</span>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-amber-600">{stats.users.charities.pending}</span>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide mt-1 flex items-center gap-1">
                         {stats.users.charities.pending > 0 && <AlertTriangle className="w-3 h-3 animate-bounce" />} Pending
                    </span>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-purple-600">{stats.users.charities.approved}</span>
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wide mt-1">Active</span>
                </div>
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-rose-600">{stats.users.charities.rejected}</span>
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wide mt-1">Rejected</span>
                </div>
            </div>
        </div>
      </div>


      {/* --- 4. CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg text-[#119abf]"><Activity className="w-5 h-5" /></div>
                <h3 className="font-bold text-slate-900">User Growth</h3>
            </div>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userDistributionData} barSize={50}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="count" fill="#119abf" radius={[6, 6, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-500"><Heart className="w-5 h-5" /></div>
                <h3 className="font-bold text-slate-900">Donation Impact</h3>
            </div>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={donationData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                    {donationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
      
      {/* --- SECTION 3: MARKET INTELLIGENCE & ACTION QUEUE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1: High Demand (Fixed Height) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[500px]"> {/* 👈 Fixed Height */}
            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-500"><Flame className="w-5 h-5" /></div>
                <div>
                    <h3 className="font-bold text-slate-900">High Demand</h3>
                    <p className="text-xs text-slate-500">Most requested medicines</p>
                </div>
            </div>
            <div className="p-6 space-y-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100">
                {stats.analytics?.topMedicines.length === 0 ? <p className="text-sm text-slate-400">No data yet.</p> : stats.analytics?.topMedicines.map((med, i) => (
                    <Link href={`/admin/medicines?search=${encodeURIComponent(med.name)}`} key={i} className="group block cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-700 group-hover:text-blue-600 flex items-center gap-1">
                                {med.name} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                            <span className="text-slate-500">{med.count} reqs</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${Math.min(med.count * 10, 100)}%` }}></div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>

        {/* COLUMN 2: Pending Reviews (Fixed Height) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[500px]"> {/* 👈 Fixed Height */}
            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><ShieldCheck className="w-5 h-5" /></div>
                <div>
                    <h3 className="font-bold text-slate-900">Pending Reviews</h3>
                    <p className="text-xs text-slate-500">Entities waiting for approval</p>
                </div>
            </div>
            
            <div className="p-6 space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100">
                {(stats.analytics?.pendingQueue.length || 0) === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-100" />
                        <p className="text-sm">All caught up! No pending users.</p>
                    </div>
                ) : (
                    stats.analytics?.pendingQueue.map((user, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-amber-200 transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${user.type === 'pharmacy' ? 'bg-emerald-400' : 'bg-purple-400'}`}>
                                    {user.type === 'pharmacy' ? <Building2 className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{user.name}</p>
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <span className="capitalize">{user.type}</span> • {user.location}
                                    </p>
                                </div>
                            </div>
                            <Link 
                                href={`/admin/${user.type === 'pharmacy' ? 'pharmacies' : 'charities'}?search=${encodeURIComponent(user.name)}`}
                                className="px-3 py-1.5 bg-white text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:text-amber-600 hover:border-amber-200 transition-colors shadow-sm"
                            >
                                Review
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* COLUMN 3: Live Feed (Fixed Height + Internal Scroll) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[500px]"> {/* 👈 Fixed Height */}
            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                   <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Clock className="w-5 h-5" /></div>
                   <h3 className="font-bold text-slate-900">Live Activity</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-100">
                
                {/* 1. REQUESTS SECTION */}
                <div>
                    <div className="sticky top-0 bg-white z-10 pb-2 border-b border-slate-50 mb-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Activity className="w-3 h-3 text-blue-400" /> Recent Requests
                        </h4>
                    </div>
                    <div className="space-y-3">
                        {stats.recentActivity.requests.length === 0 ? <p className="text-xs text-slate-400 italic pl-2">No recent requests.</p> : stats.recentActivity.requests.map((item) => (
                            <div key={item.id} className="flex gap-3 items-start pb-2">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                                <div className="text-sm text-slate-800 leading-snug">
                                    <span className="text-slate-500">Patient</span> <Link href={`/admin/patients?search=${encodeURIComponent(item.user.name)}`} className="font-medium hover:text-blue-600 hover:underline">{item.user?.name}</Link> 
                                    <span className="text-slate-400"> needs </span>
                                    <Link href={`/admin/medicines?search=${encodeURIComponent(item.medicine?.name)}`} className="text-[#119abf] font-medium hover:underline">{item.medicine?.name}</Link>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Fake Link 1 */}
                    <div className="mt-3 pt-2 border-t border-slate-50">
                        <Link href="/admin/donations?tab=requests" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center justify-end gap-1">
                            View All Requests <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* 2. OFFERS SECTION */}
                <div>
                    <div className="sticky top-0 bg-white z-10 pb-2 border-b border-slate-50 mb-3 mt-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Heart className="w-3 h-3 text-emerald-400" /> Recent Donations
                        </h4>
                    </div>
                    <div className="space-y-3">
                        {stats.recentActivity.offers.length === 0 ? <p className="text-xs text-slate-400 italic pl-2">No recent offers.</p> : stats.recentActivity.offers.map((item) => (
                            <div key={item.id} className="flex gap-3 items-start pb-2">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                <div className="text-sm text-slate-800 leading-snug">
                                    <span className="text-slate-500">Donor</span> <Link href={`/admin/patients?search=${encodeURIComponent(item.user.name)}`} className="font-medium hover:text-emerald-600 hover:underline">{item.user?.name}</Link> 
                                    <span className="text-slate-400"> offers </span>
                                    <Link href={`/admin/medicines?search=${encodeURIComponent(item.medicine?.name)}`} className="text-emerald-600 font-medium hover:underline">{item.medicine?.name}</Link>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Fake Link 2 */}
                    <div className="mt-3 pt-2 border-t border-slate-50">
                        <Link href="/admin/donations?tab=offers" className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center justify-end gap-1">
                            View All Offers <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

            </div>
        </div>

      </div>

      

    </div>
  );
}