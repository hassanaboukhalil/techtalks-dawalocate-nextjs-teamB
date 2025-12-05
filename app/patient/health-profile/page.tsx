"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Loader } from "lucide-react";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    bloodType: "",
    height: "",
    weight: "",
    conditions: "",
    medications: "",
    contactName: "",
    relationship: "",
    contactNumber: "",
  });

  // =============================
  // 1. LOAD FROM BACKEND (GET)
  // =============================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`/api/patient/health-profile`, {
          withCredentials: true,
        });

        if (res.data) {
          setFormData((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error("Axios GET error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // =============================
  // 2. HANDLERS
  // =============================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications
        ? `${prev.medications}\n• `
        : "• ",
    }));
  };

  // =============================
  // 3. SAVE (POST)
  // =============================
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.post(`/api/patient/health-profile`, formData);
    } catch (err) {
      console.error("Axios POST error:", err);
    } finally {
      setTimeout(() => setSaving(false), 600);
    }
  };

  // =============================
  // LOADING SCREEN
  // =============================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader className="w-8 h-8 text-[#119abf] animate-spin" />
      </div>
    );
  }

  // =============================
  // UI
  // =============================
  const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-[#119abf] focus:ring-1 focus:ring-[#119abf] transition-colors bg-white";

  const labelClass =
    "block text-sm font-bold text-slate-800 mb-2";

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex justify-center py-16 px-4">
      
      {/* NEW: Wider container for desktop */}
      <div className="w-full max-w-[1100px]">

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Health Profile</h1>
          <p className="text-slate-500 text-lg font-medium">Manage your medical information</p>
        </div>

        {/* FORM BECOMES 2-COLUMN ON LARGE SCREENS */}
        <form onSubmit={handleSave} className="space-y-10 lg:grid lg:grid-cols-2 lg:gap-12">

          {/* Personal Info */}
          <section className="col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none`}
                  />
                  <Calendar className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Gender</label>
                <input
                  type="text"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Blood Type</label>
                <input
                  type="text"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Conditions */}
          <section className="col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Medical Conditions</h2>
            <textarea
              name="conditions"
              value={formData.conditions}
              onChange={handleChange}
              rows={6}
              className={`${inputClass} resize-none`}
            />
          </section>

          {/* Medications */}
          <section className="col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Current Medications</h2>

            <textarea
              name="medications"
              value={formData.medications}
              onChange={handleChange}
              rows={6}
              className={`${inputClass} resize-none mb-4`}
            />

            <button
              type="button"
              onClick={addMedication}
              className="inline-flex items-center px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-sm font-bold"
            >
              Add Medication
            </button>
          </section>

          {/* Emergency Contact */}
          <section className="col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Emergency Contact</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Contact Name</label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Relationship</label>
                <input
                  type="text"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* SAVE BUTTON */}
          <div className="col-span-2 pt-2 pb-10">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#119abf] hover:bg-[#0e8cae] text-white font-bold py-4 rounded-md shadow-sm flex items-center justify-center gap-2 disabled:opacity-75 text-lg"
            >
              {saving ? <Loader className="w-5 h-5 animate-spin" /> : "Save Profile"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
