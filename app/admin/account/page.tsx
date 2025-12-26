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
    EyeOff
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
            setMessage({
                type: "error",
                text: err.response?.data?.error || "Failed to update account settings"
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
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 bg-primary/5 min-h-screen">

            {/* GLOSSY HEADER */}
            <header className="relative overflow-hidden rounded-[40px] bg-slate-950 p-10 text-white shadow-2xl border-b-8 border-primary">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
                                <Settings className="h-8 w-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase">Admin Settings</h1>
                        </div>
                        <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
                            Manage your administrative profile, security credentials, and system preferences with full control.
                        </p>
                    </div>
                    <div className="hidden lg:block">
                        <div className="px-8 py-4 bg-white/5 backdrop-blur-2xl rounded-[30px] border border-white/10 flex items-center gap-5 shadow-inner">
                            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-2xl font-black shadow-lg shadow-primary/40 text-white">
                                {account.name[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-xl tracking-tight text-white">{account.name}</p>
                                <p className="text-sm text-primary font-bold uppercase tracking-widest opacity-80">System Admin</p>
                                <p className="text-[10px] text-slate-500 italic mt-1 font-medium">Admin since {new Date(account.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/10 blur-[120px]"></div>
                <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-primary/5 blur-[100px]"></div>
            </header>

            {/* FEEDBACK MESSAGE */}
            {message && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-500 animate-in slide-in-from-top-4 ${message.type === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm"
                    : "bg-rose-50 border-rose-100 text-rose-700 shadow-sm"
                    }`}>
                    {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Profile info */}
                <div className="lg:col-span-12 space-y-8">
                    <Card className="overflow-hidden border-none shadow-2xl bg-primary/10 backdrop-blur-md rounded-3xl border border-primary/20">
                        <div className="p-1 bg-gradient-to-r from-primary/40 via-transparent to-primary/40"></div>
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-primary/20 rounded-2xl">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-primary-foreground bg-primary px-4 py-1 rounded-full shadow-sm">General Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-bold text-primary ml-1">Full Name</Label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary group-focus-within:text-white transition-colors" />
                                        <Input
                                            id="name"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Admin Name"
                                            className="pl-11 h-12 rounded-xl border-primary/30 focus:ring-4 focus:ring-primary/20 transition-all bg-white/60 text-primary font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-bold text-primary ml-1">Email Address</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary group-focus-within:text-white transition-colors" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="admin@dawalocate.com"
                                            className="pl-11 h-12 rounded-xl border-primary/30 focus:ring-4 focus:ring-primary/20 transition-all bg-white/60 text-primary font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="phone" className="text-sm font-bold text-primary ml-1">Phone Number</Label>
                                    <div className="flex gap-2">
                                        <div className="flex items-center justify-center px-4 h-12 rounded-xl bg-primary text-white font-bold font-mono text-sm shadow-md">
                                            +961
                                        </div>
                                        <div className="relative flex-1 group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary group-focus-within:text-white transition-colors" />
                                            <Input
                                                id="phone"
                                                name="phoneDigits"
                                                value={form.phoneDigits}
                                                onChange={handlePhoneChange}
                                                placeholder="70 123 456"
                                                className="pl-11 h-12 rounded-xl border-primary/30 focus:ring-4 focus:ring-primary/20 transition-all bg-white/60 text-primary font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Security Section Integrated into Main Grid */}
                        <Card className="overflow-hidden border-none shadow-2xl bg-primary rounded-3xl relative">
                            <div className="p-8 space-y-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                        <ShieldCheck className="h-6 w-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Security Settings</h2>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword" title="Current Password" className="text-white/80 font-bold ml-1 uppercase text-[10px] tracking-widest" />
                                        <div className="relative group">
                                            <Input
                                                id="currentPassword"
                                                name="currentPassword"
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={form.currentPassword}
                                                onChange={handleChange}
                                                placeholder="Enter current password"
                                                className="h-14 rounded-2xl border-white/20 focus:ring-4 focus:ring-white/10 transition-all bg-white/10 text-white placeholder:text-white/40 font-medium pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                                            >
                                                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword" title="New Password" className="text-white/80 font-bold ml-1 uppercase text-[10px] tracking-widest" />
                                        <div className="relative group">
                                            <Input
                                                id="newPassword"
                                                name="newPassword"
                                                type={showNewPassword ? "text" : "password"}
                                                value={form.newPassword}
                                                onChange={handleChange}
                                                placeholder="Create new password"
                                                className="h-14 rounded-2xl border-white/20 focus:ring-4 focus:ring-white/10 transition-all bg-white/10 text-white placeholder:text-white/40 font-medium pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                                            >
                                                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" title="Confirm Password" className="text-white/80 font-bold ml-1 uppercase text-[10px] tracking-widest" />
                                        <div className="relative group">
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={form.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm new password"
                                                className="h-14 rounded-2xl border-white/20 focus:ring-4 focus:ring-white/10 transition-all bg-white/10 text-white placeholder:text-white/40 font-medium pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-white/5 to-transparent"></div>
                            <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>
                        </Card>

                        <div className="flex flex-col justify-end space-y-6">
                            <div className="p-10 bg-slate-900 rounded-3xl text-white shadow-2xl overflow-hidden relative group border-t-4 border-primary">
                                <div className="relative z-10 space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter">Apply Changes</h3>
                                        <p className="text-slate-400 text-sm mt-1 font-medium italic">Updates will be synchronized across the administrative system.</p>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full h-16 rounded-2xl bg-primary text-white hover:bg-primary/90 font-black text-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary/40 group/btn border-b-4 border-primary-foreground/20"
                                    >
                                        {saving ? "🔄 Processing..." : "COMMIT CHANGES"}
                                        {!saving && <ArrowRight className="ml-2 h-6 w-6 group-hover/btn:translate-x-3 transition-transform" />}
                                    </Button>
                                </div>
                                <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent"></div>
                                <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
