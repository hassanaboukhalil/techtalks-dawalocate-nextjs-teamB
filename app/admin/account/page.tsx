"use client";

import { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import {
    User,
    Mail,
    Phone,
    Lock,
    ShieldCheck,
    ArrowRight,
    Settings,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    Loader2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/* =====================
   Types
 ===================== */
interface AdminAccount {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
}

interface FormState {
    name: string;
    email: string;
    phoneDigits: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

export default function AdminAccountPage() {
    const [account, setAccount] = useState<AdminAccount | null>(null);
    const [form, setForm] = useState<FormState | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const res = await axios.get<AdminAccount>("/api/admin/account");
                setAccount(res.data);
                setForm({
                    name: res.data.name,
                    email: res.data.email,
                    phoneDigits: res.data.phone?.replace("+961", "") ?? "",
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAccount();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!form) return;
        setForm({ ...form, [e.target.name]: e.target.value });
        if (message) setMessage(null);
    };

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!form) return;
        const digits = e.target.value.replace(/\D/g, "");
        if (digits.length <= 8) {
            setForm({ ...form, phoneDigits: digits });
        }
        if (message) setMessage(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;

        if (form.phoneDigits && form.phoneDigits.length !== 8) {
            setMessage({ type: "error", text: "Phone number must be exactly 8 digits" });
            return;
        }

        if (form.newPassword && form.newPassword !== form.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        try {
            setSaving(true);
            await axios.patch("/api/admin/account", {
                name: form.name,
                email: form.email,
                phone: form.phoneDigits ? `+961${form.phoneDigits}` : null,
                ...(form.newPassword && {
                    currentPassword: form.currentPassword,
                    newPassword: form.newPassword,
                }),
            });

            setMessage({ type: "success", text: "Account settings updated successfully" });

            // Clear password fields
            setForm({
                ...form,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            // Update local account data
            setAccount({
                ...account!,
                name: form.name,
                email: form.email,
                phone: form.phoneDigits ? `+961${form.phoneDigits}` : null,
            });

        } catch (err: any) {
            console.error("Account update error:", JSON.stringify({
                data: err.response?.data,
                status: err.response?.status,
                headers: err.response?.headers,
                message: err.message,
                stack: err.stack
            }, null, 2));
            setMessage({
                type: "error",
                text: err.response?.data?.details
                    ? `${err.response.data.error}: ${err.response.data.details}`
                    : (err.response?.data?.error || "Failed to update account settings")
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading || !form || !account) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
                    <p className="text-slate-500 mt-1">Manage your administrative profile and security credentials.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-slate-50 border rounded-lg flex items-center gap-3 shadow-sm">
                        <div className="h-8 w-8 rounded-full bg-[#119abf] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                            {account.name[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-sm text-slate-900 leading-none">{account.name}</p>
                            <p className="text-[10px] text-[#119abf] font-bold uppercase tracking-wider mt-1">System Admin</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FEEDBACK MESSAGE */}
            {message && (
                <div className={`flex items-center gap-3 p-4 rounded-xl border animate-in slide-in-from-top-4 ${message.type === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : "bg-rose-50 border-rose-100 text-rose-700"
                    }`}>
                    {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* GENERAL INFORMATION */}
                <div className="lg:col-span-12">
                    <Card className="overflow-hidden border rounded-xl shadow-sm z-0">
                        <div className="p-6 border-b bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-[#119abf]" />
                                General Information
                            </h2>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-slate-700 ml-0.5">Full Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-[#119abf] transition-colors" />
                                    <Input
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Admin Name"
                                        className="pl-9 h-11 rounded-lg border-slate-200 focus:ring-2 focus:ring-[#119abf]/20 focus:border-[#119abf] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-0.5">Email Address</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-[#119abf] transition-colors" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="admin@dawalocate.com"
                                        className="pl-9 h-11 rounded-lg border-slate-200 focus:ring-2 focus:ring-[#119abf]/20 focus:border-[#119abf] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 ml-0.5">Phone Number</Label>
                                <div className="flex h-11 w-full rounded-lg border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-[#119abf]/20 focus-within:border-[#119abf] overflow-hidden transition-all">
                                    <div className="flex items-center gap-2 px-3 bg-slate-50 border-r border-slate-200 shrink-0">
                                        <img
                                            src="https://flagcdn.com/w40/lb.png"
                                            alt="Lebanon Flag"
                                            className="w-6 h-4 object-cover rounded-sm shadow-sm"
                                        />
                                        <span className="text-sm font-bold text-slate-700">+961</span>
                                    </div>
                                    <input
                                        id="phone"
                                        name="phoneDigits"
                                        className="flex h-full w-full bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none"
                                        placeholder="70 123 456"
                                        value={form.phoneDigits}
                                        onChange={handlePhoneChange}
                                        maxLength={8}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* SECURITY SETTINGS */}
                <div className="lg:col-span-12">
                    <Card className="overflow-hidden border rounded-xl shadow-sm z-0">
                        <div className="p-6 border-b bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#119abf]" />
                                Security Credentials
                            </h2>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword" title="Current Password" className="text-sm font-semibold text-slate-700 ml-0.5">Current Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-[#119abf] transition-colors" />
                                        <Input
                                            id="currentPassword"
                                            name="currentPassword"
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={form.currentPassword}
                                            onChange={handleChange}
                                            placeholder="Enter current password"
                                            className="pl-9 h-11 rounded-lg border-slate-200 focus:ring-2 focus:ring-[#119abf]/20 focus:border-[#119abf] transition-all pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" title="New Password" className="text-sm font-semibold text-slate-700 ml-0.5">New Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-[#119abf] transition-colors" />
                                        <Input
                                            id="newPassword"
                                            name="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            value={form.newPassword}
                                            onChange={handleChange}
                                            placeholder="Create new password"
                                            className="pl-9 h-11 rounded-lg border-slate-200 focus:ring-2 focus:ring-[#119abf]/20 focus:border-[#119abf] transition-all pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" title="Confirm Password" className="text-sm font-semibold text-slate-700 ml-0.5">Confirm New Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-[#119abf] transition-colors" />
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm new password"
                                            className="pl-9 h-11 rounded-lg border-slate-200 focus:ring-2 focus:ring-[#119abf]/20 focus:border-[#119abf] transition-all pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* APPLY CHANGES */}
                <div className="lg:col-span-12 flex items-center justify-between p-6 bg-slate-50 border rounded-xl shadow-sm border-slate-200/60">
                    <div className="hidden sm:block">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">Apply Changes</h3>
                        <p className="text-xs text-slate-500 font-medium">Updates will be synchronized across the administrative system.</p>
                    </div>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-[#119abf] hover:bg-[#0e8cae] px-10 h-12 rounded-lg font-bold shadow-md shadow-[#119abf]/20 transform transition-all active:scale-95 disabled:opacity-70"
                    >
                        {saving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> saving...</>
                        ) : (
                            <>SUBMIT <ArrowRight className="ml-2 h-4 w-4" /></>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
