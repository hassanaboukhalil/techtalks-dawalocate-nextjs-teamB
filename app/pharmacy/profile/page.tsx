"use client";

import { useEffect, useState } from "react";
import { User, MapPin, Phone, Mail, Clock, Truck, Package } from "lucide-react";

interface PharmacyProfile {
  id: number;
  name: string;
  email: string;
  city: string | null;
  phone: string | null;
  address: string | null;
  openingHours: string | null;
  hasDelivery: boolean | null;
  status: string | null;
  userType: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Medicine {
  id: number;
  name: string;
  genericName: string | null;
  strength: string | null;
  form: string | null;
  synonyms: string | null;
}

interface InventoryItem {
  id: number;
  quantity: number;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  medicine: Medicine;
}

interface ProfileData {
  profile: PharmacyProfile;
  inventory: InventoryItem[];
  inventoryCount: number;
}

export default function PharmacyProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/pharmacy/profile");
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch profile");
        }

        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error("Failed to load profile data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">No profile data available</div>
      </div>
    );
  }

  const { profile, inventory, inventoryCount } = data;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Pharmacy Profile</h1>

      {/* Profile Information Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-gray-500 capitalize">{profile.userType.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{profile.email}</p>
            </div>
          </div>

          {profile.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{profile.phone}</p>
              </div>
            </div>
          )}

          {profile.city && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="text-gray-900">{profile.city}</p>
              </div>
            </div>
          )}

          {profile.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-gray-900">{profile.address}</p>
              </div>
            </div>
          )}

          {profile.openingHours && (
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Opening Hours</p>
                <p className="text-gray-900">{profile.openingHours}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Delivery Service</p>
              <p className="text-gray-900">
                {profile.hasDelivery ? "Available" : "Not Available"}
              </p>
            </div>
          </div>

          {profile.status && (
            <div className="flex items-start gap-3">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    profile.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : profile.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {profile.status}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold text-gray-900">Inventory</h2>
          </div>
          <div className="text-sm text-gray-500">
            {inventoryCount} {inventoryCount === 1 ? "item" : "items"}
          </div>
        </div>

        {inventory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No inventory items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Medicine</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Expires</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.medicine.name}</p>
                        {item.medicine.genericName && (
                          <p className="text-sm text-gray-500">
                            {item.medicine.genericName}
                            {item.medicine.strength && ` - ${item.medicine.strength}`}
                            {item.medicine.form && ` (${item.medicine.form})`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{item.quantity}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          item.status === "IN_STOCK"
                            ? "bg-green-100 text-green-800"
                            : item.status === "LOW"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {item.expiresAt
                        ? new Date(item.expiresAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

