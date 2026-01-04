"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Search, History, ArrowRight, Clock, CheckCircle2, 
  Loader2, Files, Activity, AlertTriangle, 
  HeartHandshake, ShieldCheck, Pill, Bell, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/layout/Logo"; 
import DigitalIdCard from "@/components/patient/DigitalIdCard";

// --- TYPES ---
interface ActivityItem {
  id: number;
  type: 'REQUEST' | 'DONATION'; 
  status: string;
  createdAt: string;
  updatedAt: string;
  medicine: { name: string; strength: string };
}

interface DashboardData {
  stats: { active: number; completed: number };
  recentRequests: any[]; 
  recentDonations?: any[]; 
  donations?: any[]; 
  healthProfile?: {
    id: number;
    fullName?: string; 
    bloodType?: string;
    gender?: string;
    dob?: string;
    // Added fields for the full QR Code URL
    emergencyName?: string;
    emergencyPhone?: string;
    conditions?: string;
    medications?: string; 
    height?: string;
    weight?: string;
  } | null;
}

export default function PatientDashboard() {
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/patient/dashboard");
        const json = await res.json();
        
        // 🔍 DEBUG: Remove before deploying
        console.log("🔥 API RESPONSE:", json); 

        if (json.success) {
          setData(json.data);
          
          // 1. Process Requests
          const requests = (json.data.recentRequests || []).map((r: any) => ({ ...r, type: 'REQUEST' }));
          
          // 2. Process Donations
          const rawDonations = json.data.recentDonations || json.data.donations || [];
          const donations = rawDonations.map((d: any) => ({ ...d, type: 'DONATION' }));

          // 3. Combine & Sort by Date (Newest First)
          const combined = [...requests, ...donations].sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          setActivities(combined);

          // 🔥 FIXED: QR URL now includes FULL details
          if (json.data.healthProfile) {
             const baseUrl = window.location.origin;
             const p = json.data.healthProfile;
             
             // Clean up medications string (replace newlines with commas)
             const meds = p.medications ? p.medications.replace(/\n/g, ", ") : "";

             const url = `${baseUrl}/view-health-profile?` +
                `name=${encodeURIComponent(p.fullName || "")}&` +
                `bloodType=${encodeURIComponent(p.bloodType || "")}&` +
                `dob=${encodeURIComponent(p.dob || "")}&` +
                `gender=${encodeURIComponent(p.gender || "")}&` +
                `emergencyContact=${encodeURIComponent(p.emergencyName || "")}&` +
                `emergencyPhone=${encodeURIComponent(p.emergencyPhone || "")}&` +
                `allergies=${encodeURIComponent(p.conditions || "")}&` +
                `medications=${encodeURIComponent(meds)}&` +
                `height=${encodeURIComponent(p.height || "")}&` +
                `weight=${encodeURIComponent(p.weight || "")}`;
                
             setQrUrl(url);
          }
        } else {
          setError(json.error || "Failed to load data");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#2699B2]" /></div>;
  if (error || !data) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  const hasProfile = !!data.healthProfile; 

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden font-sans">
      
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* 1. ANIMATED BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-32 left-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      {/* 2. MAIN CONTAINER */}
      {/* Reduced padding on mobile so header touches edges */}
      <div className="relative z-10 p-0 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-12 pb-40">
        
        {/* 🔥 HEADER FIX: Sticky top-0 on mobile, rounded on desktop */}
        <header className="sticky top-0 md:top-4 z-50 bg-white/80 backdrop-blur-xl border-b md:border border-white/50 md:rounded-2xl shadow-sm px-4 py-3 md:px-6 md:py-4 flex flex-row justify-between items-center gap-3 transition-all hover:shadow-md duration-300">
          <div className="flex items-center gap-3 md:gap-4 flex-1 overflow-hidden">
             <div className="p-1.5 md:p-2 bg-white rounded-lg md:rounded-xl shadow-sm border border-slate-100 shrink-0">
                {/* Ensure Logo is imported correctly */}
                <Logo withTitle={false} width={28} height={28} /> 
             </div>
             <div className="min-w-0">
               <h1 className="text-base md:text-2xl font-bold text-slate-800 truncate">
                 <span className="md:hidden">Hi, </span>
                 <span className="hidden md:inline">Welcome back, </span>
                 <span className="text-[#119abf]">{data.healthProfile?.fullName?.split(' ')[0] || "Patient"}</span>
               </h1>
               <p className="text-xs md:text-sm text-slate-500 font-medium hidden md:block">Here is your daily health overview</p>
             </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
             <div className="hidden md:block text-right mr-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today</p>
                <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
             </div>

             <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

             <div className="flex items-center gap-2 md:gap-3">
      
               
               <div className="flex items-center pl-1">
                 <Link href="/patient/account" className="relative group">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-[#119abf] to-teal-400 text-white flex items-center justify-center font-bold shadow-md ring-2 ring-white cursor-pointer hover:scale-110 transition-transform">
                        <User className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    {/* 🔥 The Tooltip: Appears on Hover */}
                    <span className="absolute top-full mt-2 right-0 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-50">
                        Account
                    </span>
                 </Link>
               </div>
             </div>
          </div>
        </header>

        {/* Content Wrapper for horizontal padding on mobile */}
        <div className="px-4 md:px-0 space-y-6 md:space-y-12">

            {/* 3. HERO SEARCH */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0F4C5C] via-[#119abf] to-[#0F4C5C] p-6 md:p-12 text-white border border-slate-100 shadow-xl shadow-slate-200/50 group hover:-translate-y-2 transition-all duration-300 cursor-default">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 -z-10 group-hover:scale-110 transition-transform duration-1000"></div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                  <div className="max-w-xl space-y-3 md:space-y-4 text-center md:text-left">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-teal-100 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                          <Activity className="w-3 h-3" /> Medicine Finder
                      </span>
                      <h2 className="text-2xl md:text-5xl font-black text-white tracking-tight leading-tight">
                        Need Medicine?
                      </h2>
                      <p className="text-blue-100/80 text-sm md:text-lg font-medium leading-relaxed max-w-md mx-auto md:mx-0">
                        Search our trusted network of pharmacies and donors instantly.
                      </p>
                  </div>

                  <Link href="/patient/search" className="w-full md:w-auto min-w-full md:min-w-[400px] group/search">
                      <div className="bg-white/95 backdrop-blur-md p-2 pl-6 rounded-full shadow-2xl flex items-center justify-between transition-all duration-300 hover:scale-[1.03] hover:bg-white cursor-pointer border-4 border-transparent hover:border-blue-200/30">
                          <span className="text-slate-400 font-medium text-sm md:text-lg flex items-center gap-3">
                              <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-300" /> Find medicine...
                          </span>
                          <div className="bg-[#119abf] text-white p-2 md:p-4 rounded-full shadow-lg group-hover/search:bg-[#0e8cae] transition-colors group-hover/search:rotate-[-45deg] transform duration-300">
                              <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
                          </div>
                      </div>
                  </Link>
              </div>
            </div>

            {/* 4. STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-[2rem] p-5 md:p-6 text-white shadow-lg shadow-blue-500/20 group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute right-[-20px] top-[-20px] opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        <Clock className="w-24 h-24 md:w-32 md:h-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center backdrop-blur-md mb-3 md:mb-4">
                            <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <p className="text-blue-100 font-bold uppercase text-[10px] md:text-xs tracking-widest">Open Requests</p>
                        <h3 className="text-3xl md:text-4xl font-black mt-1">{data.stats.active}</h3>
                        <p className="text-xs md:text-sm font-medium text-blue-100 mt-2 opacity-90">Open Requests</p>
                    </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-5 md:p-6 text-white shadow-lg shadow-emerald-500/20 group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute right-[-20px] top-[-20px] opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        <CheckCircle2 className="w-24 h-24 md:w-32 md:h-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="bg-white/20 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center backdrop-blur-md mb-3 md:mb-4">
                            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <p className="text-emerald-100 font-bold uppercase text-[10px] md:text-xs tracking-widest">Fulfilled</p>
                        <h3 className="text-3xl md:text-4xl font-black mt-1">{data.stats.completed}</h3>
                        <p className="text-xs md:text-sm font-medium text-emerald-100 mt-2 opacity-90">Medicines Received</p>
                    </div>
                </div>
            </div>

            {/* 5. DONATE BANNER */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#e11d48] to-[#9f1239] shadow-xl shadow-rose-500/20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[80px] opacity-10 translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
                        <div className="bg-white/20 p-4 rounded-full border border-white/10 backdrop-blur-md shadow-inner shrink-0">
                            <HeartHandshake className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Donate Medicine</h3>
                            <p className="text-rose-100 max-w-md font-medium text-sm md:text-base leading-relaxed">
                                Don't let unused medicine expire. Turn your extra supplies into a lifeline for someone in need today.
                            </p>
                        </div>
                    </div>
                    <Link href="/patient/donations" className="shrink-0 w-full md:w-auto">
                        <Button className="w-full h-12 bg-white/20 hover:bg-white hover:text-[#e11d48] text-white border border-white/40 backdrop-blur-md rounded-xl font-bold text-base md:text-lg px-8 transition-all duration-300 shadow-lg group">
                            Donate Now <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 6. ID CARD SECTION */}
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-teal-400"></div>
                
                <div className="flex flex-col lg:flex-row items-center gap-8 px-4 py-8 md:p-10">
                  <div className="w-full lg:w-1/3 text-center lg:text-left space-y-3">
                      <div className="inline-block p-3 bg-blue-50 rounded-2xl">
                        <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-[#119abf]" />
                      </div>
                      <h2 className="text-xl md:text-3xl font-black text-slate-800">Your Digital ID</h2>
                      <p className="text-slate-500 text-sm md:text-lg leading-relaxed">
                        Official DawaLocate emergency pass. Keep accessible for first responders.
                      </p>
                      <Link href="/patient/health-profile">
                        <Button variant="outline" className="mt-2 h-10 md:h-12 px-6 md:px-8 rounded-xl font-bold border-2 border-slate-200 hover:border-[#119abf] hover:text-[#119abf] w-full md:w-auto transition-all">
                          Manage Profile
                        </Button>
                      </Link>
                  </div>

                  <div className="w-full lg:w-2/3 flex justify-center">
                      {hasProfile ? (
                        // 🔥 FIXED: Just allow the DigitalIdCard to size itself. No external scaling hacks.
                        // Added hover lift effect back for interactivity.
                        <div className="w-full flex justify-center hover:scale-[1.02] transition-transform duration-300 cursor-pointer">
                            <DigitalIdCard 
                                fullName={data.healthProfile?.fullName || "Patient"}
                                bloodType={data.healthProfile?.bloodType || "-"}
                                gender={data.healthProfile?.gender || "-"}
                                dob={data.healthProfile?.dob || ""}
                                profileId={data.healthProfile?.id}
                                qrCodeUrl={qrUrl}
                            />
                        </div>
                      ) : (
                        // 🔥 FIXED: "ID Not Active" is now a RECTANGLE (rounded-none) and BIG (w-full)
                        <Link href="/patient/health-profile" className="w-full h-[240px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-none flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 m-4 transition-all group hover:border-blue-300">
                            <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <AlertTriangle className="w-7 h-7 text-orange-500" />
                            </div>
                            <h3 className="font-bold text-slate-700 text-lg">ID Not Active</h3>
                            <p className="text-slate-400 mt-1 text-sm">Click to set up your profile</p>
                        </Link>
                      )}
                  </div>
                </div>
            </div>

            {/* 7. RECENT ACTIVITY (MIXED TABLE) */}
            <div className="bg-white/60 backdrop-blur-md p-4 md:p-8 rounded-[2rem] border border-white/60 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-400" /> Recent Activity
                    </h3>
                    <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs">
                        <Link href="/patient/requests" className="font-bold text-[#119abf] hover:underline flex items-center gap-1 transition-all hover:gap-2">
                            Requests <ArrowRight className="w-3 h-3" />
                        </Link>
                        <div className="w-px h-3 bg-slate-300"></div>
                        <Link href="/patient/donations" className="font-bold text-rose-500 hover:underline flex items-center gap-1 transition-all hover:gap-2">
                            Donations <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                    {activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-slate-400 italic bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Files className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-sm font-medium">No activity yet.</p>
                        </div>
                    ) : (
                        activities.slice(0, 3).map((item) => {
                            const isDonation = item.type === 'DONATION';

                            return (
                              <div key={item.id} className="flex items-center justify-between p-3 md:p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 group cursor-default">
                                  <div className="flex items-center gap-3 md:gap-5 overflow-hidden">
                                      {/* Icon */}
                                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110 shrink-0 ${
                                          isDonation 
                                            ? 'bg-rose-500' // Pink for Donation
                                            : item.status === 'OPEN' ? 'bg-[#119abf]' : item.status === 'FULFILLED' ? 'bg-emerald-500' : 'bg-slate-400'
                                      }`}>
                                          {isDonation ? <HeartHandshake className="w-5 h-5 md:w-6 md:h-6" /> : <Pill className="w-5 h-5 md:w-6 md:h-6" />}
                                      </div>
                                      
                                      <div className="min-w-0">
                                          {/* Type Label */}
                                          <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-0.5 block ${isDonation ? 'text-rose-500' : 'text-[#119abf]'}`}>
                                            {isDonation ? 'Donation' : 'Request'}
                                          </span>
                                          
                                          {/* Medicine Name */}
                                          <p className="font-bold text-slate-800 text-sm md:text-lg line-clamp-1 group-hover:text-slate-600 transition-colors">
                                            {item.medicine.name}
                                          </p>
                                          
                                          <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500 mt-0.5 md:mt-1">
                                             <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">{item.medicine.strength}</span>
                                             <span>•</span>
                                             <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  {/* Status Badge */}
                                  <span className={`px-2 py-1 md:px-4 md:py-1.5 text-[9px] md:text-[10px] font-bold rounded-full uppercase tracking-wider border shrink-0 ml-2 transition-colors ${
                                      item.status === 'OPEN' || item.status === 'PENDING' ? 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100' : 
                                      item.status === 'FULFILLED' || item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100' : 
                                      'bg-slate-50 text-slate-600 border-slate-200'
                                  }`}>
                                      {item.status}
                                  </span>
                              </div>
                            );
                        })
                    )}
                </div>
            </div>
        
        </div>
      </div>
    </div>
  );
}