"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { 
  Package, CheckCircle2, AlertTriangle, XCircle, Loader2, 
  TrendingUp, Plus, User, Settings, ArrowRight, Activity, Clock, AlertOctagon,
  PieChart as PieChartIcon 
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
}

const COLORS = ["#10b981", "#f59e0b", "#f43f5e"]; // Green, Amber, Red

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

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
  if (!stats) return null;

  // Prepare Chart Data
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

      {/* --- SECTION 1: HERO STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Inventory */}
        <div className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.2)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Medicines</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</h3>
              <div className="flex items-center mt-2 text-xs text-blue-600 font-bold bg-blue-50 w-fit px-2 py-1 rounded-full">
                <Package className="w-3 h-3 mr-1" /> Listed Items
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-blue-100 h-1.5 mt-4 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[100%]"></div>
          </div>
        </div>

        {/* Card 2: In Stock */}
        <div className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.2)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Stock</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.inStock}</h3>
              <div className="flex items-center mt-2 text-xs text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Healthy Level
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-emerald-100 h-1.5 mt-4 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${(stats.inStock / (stats.total || 1)) * 100}%` }}></div>
          </div>
        </div>

        {/* Card 3: Low Stock */}
        <div className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(245,158,11,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(245,158,11,0.2)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.lowStock}</h3>
              <div className="flex items-center mt-2 text-xs text-amber-600 font-bold bg-amber-50 w-fit px-2 py-1 rounded-full">
                <AlertTriangle className="w-3 h-3 mr-1" /> Reorder Soon
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-amber-100 h-1.5 mt-4 rounded-full overflow-hidden">
             <div className="bg-amber-500 h-full" style={{ width: `${(stats.lowStock / (stats.total || 1)) * 100}%` }}></div>
          </div>
        </div>

        {/* Card 4: Out of Stock */}
        <div className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(244,63,94,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(244,63,94,0.2)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Out of Stock</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.outOfStock}</h3>
              <div className="flex items-center mt-2 text-xs text-rose-600 font-bold bg-rose-50 w-fit px-2 py-1 rounded-full">
                <XCircle className="w-3 h-3 mr-1" /> Action Needed
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-rose-100 h-1.5 mt-4 rounded-full overflow-hidden">
             <div className="bg-rose-500 h-full" style={{ width: `${(stats.outOfStock / (stats.total || 1)) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: CHARTS (Now 2 Columns) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Inventory Health (Donut) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <PieChartIcon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900">Inventory Health</h3>
            </div>
            <div className="flex-1 min-h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Chart 2: Stock Levels (Bar) */}
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
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>

      {/* --- SECTION 3: ALERTS (New Row) --- */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-lg text-rose-500"><AlertOctagon className="w-5 h-5" /></div>
                    <div>
                        <h3 className="font-bold text-slate-900">Expiring Soon</h3>
                        <p className="text-xs text-slate-500">Action needed within 30 days</p>
                    </div>
                </div>
                 <Link href="/pharmacy/inventory" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">
                    View Full Report &rarr;
                </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Simulated Data */}
                <div className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-500 shadow-sm font-bold text-xs">
                           12
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Panadol Extra</p>
                            <p className="text-xs text-red-600 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Expires in 5 days
                            </p>
                        </div>
                    </div>
                    <button className="text-xs bg-white border border-red-200 text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                        Remove
                    </button>
                </div>

                 <div className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm font-bold text-xs">
                           05
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Amoxicillin</p>
                            <p className="text-xs text-amber-600 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Expires in 22 days
                            </p>
                        </div>
                    </div>
                     <button className="text-xs bg-white border border-amber-200 text-amber-600 px-2 py-1 rounded hover:bg-amber-50 transition-colors">
                        Check
                    </button>
                </div>
                
                 <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm font-bold text-xs">
                           20
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Brufen 400</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Expires in 45 days
                            </p>
                        </div>
                    </div>
                     <button className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors">
                        Details
                    </button>
                </div>
            </div>
      </div>

      {/* --- SECTION 4: QUICK ACTIONS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Link href="/pharmacy/inventory" className="group p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="flex justify-between items-center text-white">
                <div>
                    <h3 className="text-lg font-bold">Manage Inventory</h3>
                    <p className="text-indigo-100 text-sm mt-1">Add, update, or remove medicines</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-white" />
                </div>
            </div>
            <div className="mt-6 flex items-center text-xs font-bold text-white/80 group-hover:text-white uppercase tracking-wider">
                Go to Inventory <ArrowRight className="w-4 h-4 ml-2" />
            </div>
        </Link>

        <Link href="/pharmacy/profile" className="group p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 hover:border-indigo-200">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Pharmacy Profile</h3>
                    <p className="text-slate-500 text-sm mt-1">Edit location, hours & details</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-indigo-50 transition-colors">
                    <User className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" />
                </div>
            </div>
            <div className="mt-6 flex items-center text-xs font-bold text-slate-400 group-hover:text-indigo-600 uppercase tracking-wider">
                View Profile <ArrowRight className="w-4 h-4 ml-2" />
            </div>
        </Link>

        <Link href="/pharmacy/settings" className="group p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 hover:border-indigo-200">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Account Settings</h3>
                    <p className="text-slate-500 text-sm mt-1">Security, notifications & preferences</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-indigo-50 transition-colors">
                    <Settings className="w-6 h-6 text-slate-600 group-hover:text-indigo-600" />
                </div>
            </div>
            <div className="mt-6 flex items-center text-xs font-bold text-slate-400 group-hover:text-indigo-600 uppercase tracking-wider">
                Open Settings <ArrowRight className="w-4 h-4 ml-2" />
            </div>
        </Link>

      </div>

    </div>
  );
}