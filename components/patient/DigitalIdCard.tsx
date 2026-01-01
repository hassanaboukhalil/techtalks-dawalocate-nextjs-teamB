"use client";

import React, { forwardRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ShieldCheck, ScanLine, HeartPulse } from "lucide-react";
import Logo from "@/components/layout/Logo";

interface DigitalIdCardProps {
  fullName: string;
  bloodType: string;
  gender: string;
  dob?: string;
  qrCodeUrl: string;
  profileId?: string | number; // 👈 New Prop
}

const DigitalIdCard = forwardRef<HTMLDivElement, DigitalIdCardProps>(
  ({ fullName, bloodType, gender, dob, qrCodeUrl, profileId }, ref) => {
    
    return (
      <div className="w-full max-w-[450px] mx-auto">
        {/* Professional Label above the card */}
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="p-1 bg-[#119abf]/10 rounded-full text-[#119abf]">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-700 text-xs tracking-tight uppercase">Official Digital ID</span>
        </div>

        {/* 🚨 EXPORT WRAPPER 🚨 
           Fixed at 1050x600 for High-Res Export.
           Scaled down for display.
        */}
        <div
          ref={ref}
          style={{
            width: "1050px",
            height: "600px",
            transform: "scale(0.4285)", // Scales 1050px -> ~450px
            transformOrigin: "top left",
            marginBottom: "-342px", // Reclaims empty space
          }}
          className="relative bg-white rounded-[30px] overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
        >
            {/* === HEADER (Teal Style 1) === */}
            <div className="h-[140px] bg-gradient-to-r from-[#0F4C5C] to-[#119abf] px-12 flex items-center justify-between relative overflow-hidden">
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
               
               {/* Logo in White Pill */}
               <div className="bg-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-3 z-10">
                  <Logo withTitle={true} width={36} height={36} />
               </div>

               <div className="text-right z-10">
                  <div className="text-white font-black text-3xl uppercase tracking-[0.15em]">Health Pass</div>
                  <div className="text-teal-100 font-medium uppercase tracking-[0.3em] text-sm mt-1 flex items-center justify-end gap-2">
                    <ScanLine className="w-4 h-4" /> Emergency ID
                  </div>
               </div>
            </div>

            {/* === BODY === */}
            <div className="flex-1 flex p-0 bg-white relative">
               <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] pointer-events-none"></div>

               {/* LEFT: QR AREA (Reverted to Simple Clean Look) */}
               <div className="w-[35%] bg-slate-50 border-r border-slate-200 flex flex-col items-center justify-center p-8 relative z-10">
                  {/* Clean White Box for QR - No extra icons */}
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                     <QRCodeCanvas value={qrCodeUrl} size={180} level="H" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Scan Code</p>
               </div>

               {/* RIGHT: DATA AREA */}
               <div className="w-[65%] p-12 flex flex-col justify-center space-y-9 relative z-10">
                  
                  {/* Name Block */}
                  <div>
                     <h3 className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-1.5">Patient Identity</h3>
                     <p className="text-5xl font-black text-slate-800 font-serif leading-none tracking-tight truncate">
                        {fullName || "PATIENT"}
                     </p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-8">
                     {/* Blood Type */}
                     <div className="bg-red-50 border-l-[6px] border-red-600 pl-5 py-3 rounded-r-lg">
                        <p className="text-red-400 font-bold uppercase text-xs tracking-wider">Blood Group</p>
                        <p className="text-[3.5rem] font-black text-red-600 leading-none mt-1 tracking-tighter">
                           {bloodType || "?"}
                        </p>
                     </div>

                     {/* Gender & DOB */}
                     <div className="pl-5 py-2 border-l-2 border-slate-200 flex flex-col justify-center">
                        <div>
                           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Gender</p>
                           <p className="text-2xl font-bold text-slate-700 capitalize leading-tight">{gender || "-"}</p>
                        </div>
                        <div className="mt-3">
                           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Date of Birth</p>
                           <p className="text-xl font-bold text-slate-600 leading-tight">{dob || "-"}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* === FOOTER STRIP === */}
            <div className="h-5 bg-[#0F4C5C] w-full flex items-center justify-between px-8">
                <span className="text-white/40 text-[10px] uppercase tracking-widest font-mono">DawaLocate Secure System</span>
                <span className="text-white/40 text-[10px] uppercase tracking-widest font-mono">
                    ID: #{profileId || "PENDING"}
                </span>
            </div>
        </div>
      </div>
    );
  }
);

DigitalIdCard.displayName = "DigitalIdCard";

export default DigitalIdCard;