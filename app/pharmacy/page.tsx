"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { 
  Package, CheckCircle2, AlertTriangle, XCircle, Loader2, 
  TrendingUp, Plus, User, Settings, ArrowRight, Activity, Clock, AlertOctagon,
  PieChart as PieChartIcon, Megaphone, HandHeart, MapPin
} from "lucide-react";
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";

// --- TYPES ---
interface PharmacyStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  recentRequests?: Array<{
    id: number;
    createdAt: string;
    user: { name: string; city: string };
    medicine: { name: string };
  }>;
  activeCampaigns?: Array<{
    id: number;
    title: string;
    targetAreas: string;
    charity: { name: string };
  }>;
  expiringSoon?: Array<{
    id: number;
    medicine: { name: string };
    expiresAt: string;
    quantity: number;
  }>;
}

const COLORS = ["#10b981", "#f59, "#f43f5e"]; 

export default function PharmacyDashboard() {
  const [stats, setStats] = useState<PharmacyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/pharmacy/dashboard");
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch pharmacy dashboard:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // 🗓️ Helper: Calculate Days Remaining (Precision Fix)
  const getDaysLeft = (dateString: string) => {
    const expiry = new Date(dateString);
    const today = new Date();
    // Reset time to midnight to ensure accurate day calculation
    today.setHours(0, 0, 0, 0); 
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
  if (!stats) return null;

  const pieData = [
    { name: "In Stock", value: stats.inStock },
    { name: "Low Stock", value: stats.lowStock },
    { name: "Out of Stock", value: stats.outOfStock },
  ];

  const barData = [
    { name: "Healthy", count: stats.inStock },
    { name: "Warning", count: stats.lowStock },
    { name: "Critical", count: stats.outOfStock },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-slate-50/50">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pharmacy Overview</h1>
          <p className="text-slate-500 mt-1">Manage your inventory health and account status.</p>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
           📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* --- ROW 1: HERO STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Inventory */}
        <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Medicines</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</h3>
              <div className="flex items-center mt-2 text-xs text-blue-600 font-bold bg-blue-50 w-fit px-2 py-1 rounded-full"><Package className="w-3 h-3 mr-1" /> Listed Items</div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg"><Package className="w-6 h-6" /></div>
          </div>
          <div className="w-full bg-blue-100 h-1.5 mt-4 rounded-full overflow-hidden"><div className="bg-blue-500 h-full w-[100%]"></div></div>
        </div>
        {/* In Stock */}
        <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Stock</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.inStock}</h3>
              <div className="flex items-center mt-2 text-xs text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-1 rounded-full"><CheckCircle2 className="w-3 h-3 mr-1" /> Healthy Level</div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg"><Activity className="w-6 h-6" /></div>
          </div>
          <div className="w-full bg-emerald-100 h-1.5 mt-4 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{ width: `${(stats.inStock / (stats.total || 1)) * 100}%` }}></div></div>
        </div>
        {/* Low Stock */}
        <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.lowStock}</h3>
              <div className="flex items-center mt-2 text-xs text-amber-600 font-bold bg-amber-50 w-fit px-2 py-1 rounded-full"><AlertTriangle className="w-3 h-3 mr-1" /> Reorder Soon</div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg"><TrendingUp className="w-6 h-6" /></div>
          </div>
          <div className="w-full bg-amber-100 h-1.5 mt-4 rounded-full overflow-hidden"><div className="bg-amber-500 h-full" style={{ width: `${(stats.lowStock / (stats.total || 1)) * 100}%` }}></div></div>
        </div>
        {/* Out of Stock */}
        <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Out of Stock</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.outOfStock}</h3>
              <div className="flex items-center mt-2 text-xs text-rose-600 font-bold bg-rose-50 w-fit px-2 py-1 rounded-full"><XCircle className="w-3 h-3 mr-1" /> Action Needed</div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg"><XCircle className="w-6 h-6" /></div>
          </div>
          <div className="w-full bg-rose-100 h-1.5 mt-4 rounded-full overflow-hidden"><div className="bg-rose-500 h-full" style={{ width: `${(stats.outOfStock / (stats.total || 1)) * 100}%` }}></div></div>
        </div>
      </div>

      {/* --- ROW 2: CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Health */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><PieChartIcon className="w-5 h-5" /></div>
                <h3 className="font-bold text-slate-900">Inventory Health</h3>
            </div>
            <div className="flex-1 min-h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
        {/* Stock Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><TrendingUp className="w-5 h-5" /></div>
                <h3 className="font-bold text-slate-900">Stock Distribution</h3>
            </div>
            <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {barData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* --- ROW 3: EXPIRING SOON ALERTS --- */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-lg text-rose-500"><AlertOctagon className="w-5 h-5" /></div>
                    <div>
                        <h3 className="font-bold text-slate-900">Expiring Soon</h3>
                        <p className="text-xs text-slate-500">Action needed within 6 months</p>
                    </div>
                </div>
                 <Link href="/pharmacy/inventory" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">View Full Inventory &rarr;</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(stats.expiringSoon || []).length === 0 ? (
                  <div className="col-span-3 text-center py-6 bg-slate-50 rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-600">All Clear!</p>
                    <p className="text-xs text-slate-400">No medicines expiring in the next 6 months.</p>
                  </div>
                ) : (
                  (stats.expiringSoon || []).map((item, i) => {
                    const daysLeft = getDaysLeft(item.expiresAt);
                    
                    // 🎨 SMART COLOR LOGIC
                    let bgColor, borderColor, iconColor, textColor, statusText;

                    if (daysLeft <= 30) {
                        // 🔴 0 - 1 Month (CRITICAL)
                        bgColor = "bg-red-50/50";
                        borderColor = "border-red-100";
                        iconColor = "text-red-500";
                        textColor = "text-red-600";
                        statusText = "Critical";
                    } else if (daysLeft <= 90) {
                        // 🟠 1 - 3 Months (WARNING)
                        bgColor = "bg-orange-50/50";
                        borderColor = "border-orange-100";
                        iconColor = "text-orange-500";
                        textColor = "text-orange-700";
                        statusText = "Warning";
                    } else {
                        // 🔵 3 - 6 Months (NOTICE)
                        bgColor = "bg-blue-50/50";
                        borderColor = "border-blue-100";
                        iconColor = "text-blue-500";
                        textColor = "text-blue-700";
                        statusText = "Upcoming";
                    }

                    return (
                      <div key={i} className={`flex items-center justify-between p-3 ${bgColor} border ${borderColor} rounded-xl`}>
                          <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center ${iconColor} shadow-sm font-bold text-xs`}>
                                {daysLeft}d
                              </div>
                              <div>
                                  <p className="text-sm font-bold text-slate-800">{item.medicine.name}</p>
                                  <p className={`text-[10px] ${textColor} flex items-center gap-1 font-medium`}>
                                      <Clock className="w-3 h-3" /> {statusText} • {daysLeft} days left
                                  </p>
                              </div>
                          </div>
                          {/* 🔗 LINK TO INVENTORY FILTERED BY NAME */}
                          <Link href={`/pharmacy/inventory?search=${encodeURIComponent(item.medicine.name)}`} className="text-xs bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-colors">
                              Check
                          </Link>
                      </div>
                    );
                  })
                )}
            </div>
      </div>

      

      {/* --- ROW 5: QUICK ACTIONS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/pharmacy/inventory" className="group p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex justify-between items-center text-white">
                <div>
                    <h3 className="text-lg font-bold">Manage Inventory</h3>
                    <p className="text-indigo-100 text-sm mt-1">Add, update, or remove medicines</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform"><Plus className="w-6 h-6 text-white" /></div>
            </div>
            <div className="mt-6 flex items-center text-xs font-bold text-white/80 group-hover:text-white uppercase tracking-wider">Go to Inventory <ArrowRight className="w-4 h-4 ml-2" /></div>
        </Link>
        <Link href="/pharmacy/profile" className="group p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 hover:border-indigo-200">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Pharmacy Profile</h3>
                    <p className="text-slate-500 text-sm mt-1">Edit location, hours & details</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-indigo-50 transition-colors"><User className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" /></div>
            </div>
            <div className="mt-6 flex items-center text-xs font-bold text-slate-400 group-hover:text-indigo-600 uppercase tracking-wider">View Profile <ArrowRight className="w-4 h-4 ml-2" /></div>
        </Link>
        <Link href="/pharmacy/settings" className="group p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 hover:border-indigo-200">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Account Settings</h3>
                    <p className="text-slate-500 text-sm mt-1">Security, notifications & preferences</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-indigo-50 transition-colors"><Settings className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" /></div>
            </div>
            <div className="mt-6 flex items-center text-xs font-bold text-slate-400 group-hover:text-indigo-600 uppercase tracking-wider">Open Settings <ArrowRight className="w-4 h-4 ml-2" /></div>
        </Link>
      </div>


      {/* --- ROW 4: INTERACTIVE SECTIONS (REQUESTS & CAMPAIGNS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Patient Requests - CLICKABLE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><HandHeart className="w-5 h-5" /></div>
                    <h3 className="font-bold text-slate-900">Recent Requests</h3>
                </div>
                <Link href="/pharmacy/requests" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
            <div className="space-y-3 flex-1">
                {(stats.recentRequests || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-6">
                       <HandHeart className="w-8 h-8 mb-2 opacity-50" />
                       <p className="text-sm italic">No recent requests.</p>
                    </div>
                ) : (
                    (stats.recentRequests || []).map((req, i) => (
                        // 🔗 CLICKABLE CARD LINKING TO /requests
                        <Link href="/pharmacy/requests" key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-all cursor-pointer group hover:translate-x-1">
                             <div>
                                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">{req.medicine.name}</p>
                                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <User className="w-3 h-3" /> {req.user.name} • <MapPin className="w-3 h-3" /> {req.user.city}
                                </p>
                             </div>
                             <div className="text-right">
                                <span className="block text-[10px] text-slate-400 mb-1">{new Date(req.createdAt).toLocaleDateString()}</span>
                                <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">View</span>
                             </div>
                        </Link>
                    ))
                )}
            </div>
        </div>

        {/* 2. Active Campaigns - CLICKABLE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Megaphone className="w-5 h-5" /></div>
                    <h3 className="font-bold text-slate-900">Active Campaigns</h3>
                </div>
                <Link href="/pharmacy/campaigns" className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-1">
                    View All <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
            <div className="space-y-3 flex-1">
                {(stats.activeCampaigns || []).length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full text-slate-400 py-6">
                       <Megaphone className="w-8 h-8 mb-2 opacity-50" />
                       <p className="text-sm italic">No active campaigns.</p>
                    </div>
                ) : (
                    (stats.activeCampaigns || []).map((camp, i) => (
                        // 🔗 CLICKABLE CARD LINKING TO /campaigns
                        <Link href="/pharmacy/campaigns" key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-purple-50 hover:border-purple-100 transition-all cursor-pointer group hover:translate-x-1">
                             <div>
                                <p className="text-sm font-bold text-slate-800 group-hover:text-purple-700">{camp.title}</p>
                                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <User className="w-3 h-3" /> {camp.charity.name} • {camp.targetAreas.split(',')[0]}
                                </p>
                             </div>
                             <span className="text-[10px] px-2 py-1 bg-white border border-slate-200 rounded text-slate-500 group-hover:border-purple-200 group-hover:text-purple-600 group-hover:font-bold shadow-sm transition-all">
                                Join
                             </span>
                        </Link>
                    ))
                )}
            </div>
        </div>

      </div>
    </div> 
  );
}