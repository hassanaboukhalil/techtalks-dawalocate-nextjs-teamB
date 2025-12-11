"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Loader } from "lucide-react";

// -------------------------
// MEDICINE TYPE
// -------------------------
interface Medicine {
  id: number;
  name: string;
  genericName: string;
  strength?: string;
  form?: string;
}

// -------------------------
export default function App() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Medicines (dropdown)
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    bloodType: "",
    height: "",
    weight: "",
    conditions: "",
    medications: [] as string[], // ARRAY NOW
    contactName: "",
    relationship: "",
    contactNumber: "",
  });

  // Filtered meds for dropdown
  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  // --------------------------------------------------
  // 1. LOAD PROFILE + MEDICINES (GET)
  // --------------------------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, medsRes] = await Promise.all([
          axios.get("/api/patient/health-profile", {
            withCredentials: true,
          }),
          axios.get("/api/global"),
        ]);

        // Load profile
        if (profileRes.data) {
          const profile = profileRes.data;

          setFormData((prev) => ({
            ...prev,
            ...profile,
            medications: profile.medications
              ? profile.medications.split("\n")
              : [],
          }));
        }

        // Load medicines
        if (medsRes.data?.success) {
          setMedicines(medsRes.data.data);
        }
      } catch (err) {
        console.error("Initial load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // --------------------------------------------------
  // HANDLERS
  // --------------------------------------------------

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // When selecting medicine from dropdown
  const handleSelectMedicine = (med: Medicine) => {
    const item = `${med.name} ${med.strength || ""} (${med.form || ""})`;

    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.includes(item)
        ? prev.medications
        : [...prev.medications, item],
    }));

    setSearch("");
    setShowDropdown(false);
  };

  // Remove tag
  const removeMedication = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m !== name),
    }));
  };

  // --------------------------------------------------
  // SAVE PROFILE
  // --------------------------------------------------
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.post("/api/patient/health-profile", {
        ...formData,
        medications: formData.medications.join("\n"), // Convert array → text
      });
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader className="w-8 h-8 text-[#119abf] animate-spin" />
      </div>
    );
  }

  // --------------------------------------------------
  // UI STYLES
  // --------------------------------------------------
  const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-[#119abf] focus:ring-[#119abf] bg-white";

  const labelClass = "block text-sm font-bold text-slate-800 mb-2";

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex justify-center py-16 px-4">
      <div className="w-full max-w-[1100px]">

        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Health Profile
          </h1>
          <p className="text-slate-500 text-lg">Manage your medical information</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSave} className="space-y-10">

          {/* PERSONAL INFO */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FULL NAME */}
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

              {/* DOB */}
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
                  <Calendar className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* GENDER */}
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

              {/* BLOOD TYPE */}
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

              {/* HEIGHT */}
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

              {/* WEIGHT */}
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

          {/* CONDITIONS */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Medical Conditions
            </h2>
            <textarea
              name="conditions"
              value={formData.conditions}
              onChange={handleChange}
              rows={5}
              className={`${inputClass} resize-none`}
            />
          </section>

          {/* MEDICATIONS */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Current Medications
            </h2>

            {/* SEARCH BOX */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search medicines..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                className={inputClass}
              />

              {/* DROPDOWN */}
              {showDropdown && search && (
                <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow max-h-60 overflow-y-auto z-10">
                  
                  {/* No results */}
                  {filteredMedicines.length === 0 && (
                    <li className="px-4 py-2 text-gray-500 text-sm">
                      No medicines found
                    </li>
                  )}

                  {/* Results */}
                  {filteredMedicines.map((med) => (
                    <li
                      key={med.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onMouseDown={() => handleSelectMedicine(med)}
                    >
                      <strong>{med.name}</strong>{" "}
                      {med.strength && (
                        <span className="text-gray-500">({med.strength})</span>
                      )}{" "}
                      {med.form && (
                        <span className="text-gray-400 text-xs">
                          {med.form}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* SELECTED TAGS */}
            <div className="flex flex-wrap gap-3 mt-4">
              {formData.medications.map((med, idx) => (
                <div
                  key={idx}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2 font-semibold shadow-sm"
                >
                  <span>{med}</span>
                  <button
                    type="button"
                    onClick={() => removeMedication(med)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* EMERGENCY CONTACT */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Emergency Contact
            </h2>

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
          <div className="pt-4 pb-10">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#119abf] hover:bg-[#0e8cae] text-white font-bold py-4 rounded-md shadow-sm flex items-center justify-center gap-2 text-lg disabled:opacity-75"
            >
              {saving ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
