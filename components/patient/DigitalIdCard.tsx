"use client";

import React, { forwardRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { ShieldCheck, ScanLine } from "lucide-react";
import Logo from "@/components/layout/Logo";

interface DigitalIdCardProps {
  fullName: string;
  bloodType: string;
  gender: string;
  dob?: string;
  qrCodeUrl: string;
  profileId?: string | number;
}

const EXPORT_WIDTH = 1050;
const EXPORT_HEIGHT = 600;

const DigitalIdCard = forwardRef<HTMLDivElement, DigitalIdCardProps>(
  ({ fullName, bloodType, gender, dob, qrCodeUrl, profileId }, ref) => {
    return (
      <div className="w-full flex justify-center">
        {/* DISPLAY WRAPPER */}
        <div
          className="
            w-full
            max-w-[300px]
            sm:max-w-[340px]
            md:max-w-[380px]
            xl:max-w-[450px]
          "
        >
          {/* SCALE VARIABLES */}
          <style>{`
            :root {
              --scale: ${300 / EXPORT_WIDTH};
            }
            @media (min-width: 640px) {
              :root {
                --scale: ${340 / EXPORT_WIDTH};
              }
            }
            @media (min-width: 768px) {
              :root {
                --scale: ${380 / EXPORT_WIDTH};
              }
            }
            @media (min-width: 1280px) {
              :root {
                --scale: ${450 / EXPORT_WIDTH};
              }
            }
          `}</style>

          {/* HEIGHT CONTROLLER (THIS FIXES THE GAP) */}
          <div
            style={{
              height: `calc(${EXPORT_HEIGHT}px * var(--scale))`,
            }}
          >
            {/* SCALE CONTAINER (visual only) */}
            <div
              style={{
                width: EXPORT_WIDTH,
                height: EXPORT_HEIGHT,
                transform: "scale(var(--scale))",
                transformOrigin: "top left",
              }}
              className="relative"
            >
              {/* EXPORT CARD — UNCHANGED */}
              <div
                ref={ref}
                className="
                        bg-white
                        rounded-[10px]
                        sm:rounded-[12px]
                        md:rounded-[14px]
                        lg:rounded-[16px]
                        overflow-hidden
                        shadow-2xl
                        border border-slate-100
                        flex flex-col
                        "
                style={{ width: EXPORT_WIDTH, height: EXPORT_HEIGHT }}
              >
                {/* HEADER */}
                <div className="
                  h-[140px]
                  bg-gradient-to-r from-[#0F4C5C] to-[#119abf]
                  px-12
                  flex items-center justify-between
                  relative
                  rounded-t-[10px]
                  sm:rounded-t-[12px]
                  md:rounded-t-[14px]
                  lg:rounded-t-[16px]
                 ">
                  <div className="bg-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-3">
                    <Logo withTitle width={36} height={36} />
                  </div>
                  <div className="text-right">
                    <div className="text-white font-black text-3xl uppercase tracking-[0.15em]">
                      Health Pass
                    </div>
                    <div className="text-teal-100 font-medium uppercase tracking-[0.3em] text-sm mt-1 flex items-center justify-end gap-2">
                      <ScanLine className="w-4 h-4" /> Emergency ID
                    </div>
                  </div>
                </div>

                {/* BODY */}
                <div className="flex-1 flex bg-white">
                  <div className="w-[35%] bg-slate-50 border-r border-slate-200 flex flex-col items-center justify-center p-8">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border">
                      <QRCodeCanvas value={qrCodeUrl} size={180} level="H" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                      Scan Code
                    </p>
                  </div>

                  <div className="w-[65%] p-12 flex flex-col justify-center space-y-9">
                    <div>
                      <h3 className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-1.5">
                        Patient Identity
                      </h3>
                      <p className="text-5xl font-black text-slate-800 font-serif truncate">
                        {fullName || "PATIENT"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="bg-red-50 border-l-[6px] border-red-600 pl-5 py-3 rounded-r-lg">
                        <p className="text-red-400 font-bold uppercase text-xs">
                          Blood Group
                        </p>
                        <p className="text-[3.5rem] font-black text-red-600">
                          {bloodType || "?"}
                        </p>
                      </div>

                      <div className="pl-5 py-2 border-l-2 border-slate-200">
                        <p className="text-slate-400 font-bold uppercase text-[10px]">
                          Gender
                        </p>
                        <p className="text-2xl font-bold text-slate-700 capitalize">
                          {gender || "-"}
                        </p>
                        <p className="text-slate-400 font-bold uppercase text-[10px] mt-3">
                          Date of Birth
                        </p>
                        <p className="text-xl font-bold text-slate-600">
                          {dob || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="h-6 bg-[#0F4C5C] flex items-center justify-between px-10">
                  <span className="text-white/40 text-[10px] uppercase font-mono">
                    DawaLocate Secure System
                  </span>
                  <span className="text-white/40 text-[10px] uppercase font-mono">
                    ID: #{profileId || "PENDING"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DigitalIdCard.displayName = "DigitalIdCard";
export default DigitalIdCard;
