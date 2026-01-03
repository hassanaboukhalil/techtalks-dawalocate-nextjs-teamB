"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Megaphone, FileText, Gift, Activity, 
  TrendingUp, Calendar, ArrowRight, Loader2,
  PieChart as PieIcon, BarChart3, Pill, Sparkles, Inbox,
  User, ChevronRight, ClipboardList, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/layout/Logo"; 
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

interface DashboardData {
  stats: { campaigns: number; requests: number; donations: number };
  myCampaigns: any[]; // 🔥 New Type
  charityName: string;
  charts: {
    area: any[];
    pie: any[];
    campaignGoals: any[];
    topMedicines: any[];
  };
}

export default function CharityDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/charity/dashboard");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#119abf]" /></div>;
  if (!data) return <div className="p-10 text-center text-red-500 font-bold">Failed to load dashboard data.</div>;

  return (
    <div className="relative min-h-screen bg-[#f8f9fc] overflow-hidden font-sans">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-3xl opacity-50 translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 pb-40">
        
        {/* HEADER */}
        <header className="flex flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hidden md:block">
                <Logo withTitle={false} width={36} height={36} />
             </div>
             <div>
               <h1 className="text-xl md:text-3xl font-black text-slate-800 leading-tight">
                 Analytics Dashboard
               </h1>
               <p className="text-sm md:text-base text-slate-500 font-medium">
                 Welcome back, <span className="text-[#119abf] font-bold">{data.charityName}</span>
               </p>
             </div>
          </div>
          
          <div className="flex justify-end shrink-0">
             <Link href="/charity/account" className="relative group">
                <Button variant="outline" className="h-10 w-10 md:h-12 md:w-12 rounded-full border-slate-200 bg-white text-slate-600 hover:bg-[#119abf] hover:border-[#119abf] hover:text-white shadow-sm transition-all duration-300 flex items-center justify-center">
                   <User className="w-5 h-5 transition-transform group-hover:scale-110" />
                </Button>
                <span className="absolute top-full right-0 mt-2 w-auto p-2 min-w-[80px] rounded-lg bg-slate-800 text-white text-xs font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl z-20">
                  Account <span className="absolute -top-1 right-4 w-2 h-2 bg-slate-800 rotate-45"></span>
                </span>
             </Link>
          </div>
        </header>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/charity/campaigns" className="group">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Megaphone className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-800">Manage Campaigns</h3>
                       <p className="text-xs text-slate-500">Create & Track Drives</p>
                    </div>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                 </div>
              </div>
            </Link>
            <Link href="/charity/requests" className="group">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-800">Medicine Requests</h3>
                       <p className="text-xs text-slate-500">Review Patient Needs</p>
                    </div>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                 </div>
              </div>
            </Link>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
               <div>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total Campaigns</p>
                  <h3 className="text-4xl font-black text-slate-800">{data.stats.campaigns}</h3>
                  <p className="text-emerald-500 text-xs font-bold mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Live </p>
               </div>
               <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                  <Megaphone className="w-7 h-7" />
               </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
               <div>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total Donations</p>
                  <h3 className="text-4xl font-black text-slate-800">{data.stats.donations}</h3>
                  <p className="text-emerald-500 text-xs font-bold mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Available</p>
               </div>
               <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Gift className="w-7 h-7" />
               </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
               <div>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Pending Requests</p>
                  <h3 className="text-4xl font-black text-slate-800">{data.stats.requests}</h3>
                  <p className="text-orange-500 text-xs font-bold mt-2 flex items-center gap-1">Needs Action</p>
               </div>
               <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                  <FileText className="w-7 h-7" />
               </div>
            </div>
        </div>

        {/* ROW 2: CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#119abf]" /> Impact Trends
                    </h3>
                    <p className="text-slate-500 text-sm">Requests vs Donations (Last 6 Months)</p>
                  </div>
               </div>
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.charts.area} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#119abf" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#119abf" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <CartesianGrid vertical={false} stroke="#f1f5f9" />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                      <Area type="monotone" dataKey="donations" stroke="#119abf" strokeWidth={3} fillOpacity={1} fill="url(#colorDonations)" name="Donations" />
                      <Area type="monotone" dataKey="requests" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRequests)" name="New Requests" />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>
            </div>

           {/* PIE CHART SECTION */}
           <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col">
               <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <PieIcon className="w-5 h-5 text-purple-500" /> Request Status
               </h3>
               <p className="text-slate-500 text-sm mb-6">Real-time breakdown</p>
               
               {data.charts.pie && data.charts.pie.length > 0 ? (
                 <>
                   <div className="w-full h-[200px] relative mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data.charts.pie} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={5} dataKey="value">
                            {data.charts.pie.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      {/* 🔥 THE FIX IS HERE: Calculate the sum dynamically */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                         <span className="text-3xl font-black text-slate-800">
                            {/* Calculate Total: 28 + 20 = 48 */}
                            {data.charts.pie.reduce((acc: number, item: any) => acc + item.value, 0)}
                         </span>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      {data.charts.pie.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                           <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                              <span className="text-slate-600 font-medium">{item.name}</span>
                           </div>
                           <span className="font-bold text-slate-800">{item.value}</span>
                        </div>
                      ))}
                   </div>
                 </>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                    <div className="bg-white p-3 rounded-full shadow-sm mb-3"><Inbox className="w-6 h-6 text-slate-400" /></div>
                    <p className="text-slate-500 font-medium text-sm">No requests yet</p>
                 </div>
               )}
            </div>
        </div>

        {/* CAMPAIGN GOALS */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
           <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-purple-600" /> Campaign Goals
           </h3>
           {data.charts.campaignGoals && data.charts.campaignGoals.length > 0 ? (
             <div className="h-[280px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.campaignGoals} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                    <Legend iconType="circle" />
                    <Bar dataKey="collected" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Collected" />
                    <Bar dataKey="goal" fill="#ede9fe" radius={[4, 4, 0, 0]} name="Target Goal" />
                  </BarChart>
               </ResponsiveContainer>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-[280px] bg-gradient-to-b from-slate-50 to-white rounded-3xl border-2 border-dashed border-slate-100">
                <div className="bg-purple-50 p-4 rounded-full mb-4"><Sparkles className="w-8 h-8 text-purple-400" /></div>
                <h4 className="text-lg font-bold text-slate-700">Ready to make an impact?</h4>
                <p className="text-slate-500 text-sm mt-1 mb-4 max-w-sm text-center">You have no active campaigns. Start your first drive here!</p>
                <Link href="/charity/campaigns/new">
                   <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">Create First Campaign</Button>
                </Link>
             </div>
           )}
        </div>

        {/* ROW 3: TOP MEDICINES & NEW 'MY CAMPAIGNS' LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
               <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                  <Pill className="w-5 h-5 text-emerald-500" /> Top Requested Medicines
               </h3>
               {data.charts.topMedicines && data.charts.topMedicines.length > 0 ? (
                 <div className="h-[250px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.charts.topMedicines} barSize={24} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} width={100} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                        <Bar dataKey="count" fill="#34d399" radius={[0, 4, 4, 0]} name="Requests" />
                      </BarChart>
                   </ResponsiveContainer>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center h-[250px] text-center p-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-medium">No medicine requests yet.</p>
                 </div>
               )}
            </div>

            {/* 🔥🔥 THE NEW 'MY RECENT CAMPAIGNS' LIST (Names & Dates) */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Your Recent Campaigns</h3>
               </div>
               <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                 {data.myCampaigns && data.myCampaigns.length > 0 ? (
                   data.myCampaigns.map((camp: any) => (
                      <div key={camp.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-default border border-transparent hover:border-slate-100">
                         {/* Icon Box */}
                         <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                             <Megaphone className="w-5 h-5" />
                         </div>
                         
                         {/* Name & Date */}
                         <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold text-slate-800 truncate">{camp.title}</p>
                             <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                <Clock className="w-3 h-3" />
                                <span>Started: {new Date(camp.startDate || camp.createdAt).toLocaleDateString(undefined, {
                                   month: 'short', day: 'numeric', year: 'numeric'
                                })}</span>
                             </div>
                         </div>
                         
                         {/* Status Badge */}
                         <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                            Active
                         </span>
                      </div>
                   ))
                 ) : (
                    <div className="text-center py-10">
                       <p className="text-slate-400 italic">No campaigns created yet.</p>
                       <Link href="/charity/campaigns/new">
                          <Button variant="link" className="text-purple-600 p-0 h-auto font-bold mt-2">Create one now</Button>
                       </Link>
                    </div>
                 )}
               </div>
            </div>
        </div>

      </div>
    </div>
  );
}