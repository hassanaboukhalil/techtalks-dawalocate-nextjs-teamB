"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { UserCircle2, Droplet, Phone, Activity, Calendar, AlertCircle } from "lucide-react";

function HealthCardContent() {
  const searchParams = useSearchParams();

  const name = searchParams.get("name") || "N/A";
  const bloodType = searchParams.get("bloodType") || "N/A";
  const dob = searchParams.get("dob") || "N/A";
  const gender = searchParams.get("gender") || "N/A";
  const emergencyContact = searchParams.get("emergencyContact") || "N/A";
  const emergencyPhone = searchParams.get("emergencyPhone") || "N/A";
  const allergies = searchParams.get("allergies") || "None reported";
  const medications = searchParams.get("medications") || "None reported";
  const height = searchParams.get("height") || "";
  const weight = searchParams.get("weight") || "";

  const medicationsList = medications.split(",").map(m => m.trim()).filter(m => m && m !== "None reported");

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header with Medical Cross */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6 border-t-4 border-teal-600">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-4 rounded-xl shadow-lg">
              <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="white" strokeWidth="2" fill="transparent"/>
                <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Emergency Medical Card</h1>
              <p className="text-slate-600">DawaLocate Health Profile</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                <strong>Emergency Use Only:</strong> This information is intended for medical professionals in emergency situations.
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-3">
            <UserCircle2 className="w-6 h-6 text-blue-600" />
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium mb-1">Full Name</p>
              <p className="text-xl font-bold text-slate-900">{name}</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <Droplet className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-700 font-medium">Blood Type</p>
              </div>
              <p className="text-xl font-bold text-red-700">{bloodType}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-slate-600" />
                <p className="text-sm text-slate-600 font-medium">Date of Birth</p>
              </div>
              <p className="text-lg font-semibold text-slate-900">
                {dob !== "N/A" ? new Date(dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-slate-600 font-medium mb-1">Gender</p>
              <p className="text-lg font-semibold text-slate-900 capitalize">{gender}</p>
            </div>

            {(height || weight) && (
              <>
                {height && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-slate-600 font-medium mb-1">Height</p>
                    <p className="text-lg font-semibold text-slate-900">{height} cm</p>
                  </div>
                )}
                {weight && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-slate-600 font-medium mb-1">Weight</p>
                    <p className="text-lg font-semibold text-slate-900">{weight} kg</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Emergency Contact Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-3">
            <Phone className="w-6 h-6 text-green-600" />
            Emergency Contact
          </h2>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">Contact Name</p>
                <p className="text-lg font-semibold text-slate-900">{emergencyContact}</p>
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">Phone Number</p>
                <p className="text-lg font-semibold text-slate-900">
                  <a href={`tel:${emergencyPhone}`} className="hover:text-green-700 transition-colors">
                    {emergencyPhone}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-3">
            <Activity className="w-6 h-6 text-purple-600" />
            Medical Information
          </h2>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
              <p className="text-sm text-orange-700 font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Allergies & Conditions
              </p>
              <p className="text-base text-slate-900 whitespace-pre-wrap">{allergies}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <p className="text-sm text-purple-700 font-medium mb-3">Current Medications</p>
              {medicationsList.length > 0 ? (
                <ul className="space-y-2">
                  {medicationsList.map((med, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-2"></span>
                      <span className="text-base text-slate-900">{med}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base text-slate-900">None reported</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-600 text-sm">
          <p>Powered by <span className="font-semibold text-teal-600">DawaLocate</span></p>
          <p className="mt-1">Emergency health information system for Lebanon</p>
        </div>

      </div>
    </div>
  );
}

export default function ViewHealthCardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    }>
      <HealthCardContent />
    </Suspense>
  );
}

