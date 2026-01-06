"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Calendar,
  MapPin,
  FileText,
  Phone,
  Package,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Search,
  X,
  Info,
  Sparkles,
} from "lucide-react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface Medicine {
  id: number;
  name: string;
  genericName: string | null;
  strength: string | null;
  form: string | null;
  imageUrl: string | null;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAreas: "",
    startDate: "",
    endDate: "",
    contactInfo: "",
  });

  // Medicine selection
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<number[]>([]);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [showMedicineDialog, setShowMedicineDialog] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Fetch medicines on mount
  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoadingMedicines(true);
      const response = await axios.get("/api/global?type=medicines");
      if (response.data.success) {
        setMedicines(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
    } finally {
      setLoadingMedicines(false);
    }
  };

  // Filter medicines based on search
  const filteredMedicines = medicines.filter((medicine) => {
    const searchLower = medicineSearch.toLowerCase();
    return (
      medicine.name.toLowerCase().includes(searchLower) ||
      medicine.genericName?.toLowerCase().includes(searchLower) ||
      medicine.form?.toLowerCase().includes(searchLower)
    );
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field-specific error
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setValidationErrors([]);
    setError(null);
  };

  const toggleMedicine = (medicineId: number) => {
    setSelectedMedicines((prev) =>
      prev.includes(medicineId)
        ? prev.filter((id) => id !== medicineId)
        : [...prev, medicineId]
    );
  };

  const removeMedicine = (medicineId: number) => {
    setSelectedMedicines((prev) => prev.filter((id) => id !== medicineId));
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      errors.title = "Campaign title is required";
    } else if (formData.title.trim().length < 5) {
      errors.title = "Title must be at least 5 characters";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      errors.description = "Description must be at least 20 characters";
    }

    if (!formData.targetAreas.trim()) {
      errors.targetAreas = "Target areas are required";
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }

    if (!formData.contactInfo.trim()) {
      errors.contactInfo = "Contact information is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    setError(null);
    setValidationErrors([]);

    try {
      const response = await axios.post("/api/charity/campaigns", {
        ...formData,
        medicineIds: selectedMedicines.length > 0 ? selectedMedicines : undefined,
      });

      if (response.data.success) {
        // Success - redirect to campaigns list
        router.push("/charity/campaigns");
      }
    } catch (err: unknown) {
      let errorData: unknown = undefined;
      if (typeof err === "object" && err !== null && "response" in err) {
        errorData = (err as { response?: { data?: unknown } }).response?.data;
      }
      
      if (
        typeof errorData === "object" &&
        errorData !== null &&
        "details" in errorData &&
        Array.isArray((errorData as { details?: unknown }).details)
      ) {
        setValidationErrors((errorData as { details: string[] }).details);
      }
      
      setError(
        typeof errorData === "object" && errorData !== null && "error" in errorData
          ? (errorData as { error?: string }).error || "Failed to create campaign. Please try again."
          : "Failed to create campaign. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getSelectedMedicineObjects = () => {
    return medicines.filter((m) => selectedMedicines.includes(m.id));
  };

  const getCharacterCount = (text: string, max: number) => {
    const length = text.length;
    const percentage = (length / max) * 100;
    let color = "text-gray-500";
    
    if (percentage > 90) color = "text-red-500";
    else if (percentage > 75) color = "text-orange-500";
    
    return <span className={color}>{length}/{max}</span>;
  };

  return (
    <div className="min-h-screen bg-[#f6fbfc] py-8">
      <div className="my-container max-w-5xl">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4 border-primary/30 text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-start gap-4">
            <div className="bg-primary/15 rounded-xl p-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <PageTitle>Create New Campaign</PageTitle>
              <p className="text-gray-600">
                Launch a medicine donation drive to help communities in need
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 border border-blue-200 bg-blue-50/50 rounded-xl animate-scale-in">
          <div className="p-6 flex gap-4">
            <div className="bg-blue-100 rounded-lg p-3 h-fit">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Campaign Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be clear and specific about your campaign goals</li>
                <li>• Provide accurate dates and contact information</li>
                <li>• Select medicines that are most needed in your target areas</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border border-red-200 bg-red-50 rounded-xl animate-scale-in">
            <div className="p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900 mb-1">Error</p>
                <p className="text-sm text-red-700">{error}</p>
                
                {validationErrors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {validationErrors.map((err, idx) => (
                      <li key={idx} className="text-sm text-red-600">• {err}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <Card className="rounded-xl border border-gray-200 shadow-sm animate-scale-in">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="bg-purple-100 rounded-lg p-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
              </div>

              {/* Campaign Title */}
              <div>
                <Label htmlFor="title" className="text-gray-700 font-medium">
                  Campaign Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Winter Medicine Relief Drive 2024"
                  maxLength={200}
                  className={`mt-2 rounded-xl border-gray-300 focus:border-primary focus:ring-primary ${
                    formErrors.title ? "border-red-500" : ""
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {formErrors.title ? (
                    <p className="text-sm text-red-600">{formErrors.title}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Give your campaign a clear, compelling title</p>
                  )}
                  <p className="text-sm">{getCharacterCount(formData.title, 200)}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium">
                  Campaign Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your campaign goals, who it will help, and why it matters. Be specific about the impact your campaign will have on the community..."
                  rows={6}
                  maxLength={2000}
                  className={`mt-2 rounded-xl border-gray-300 focus:border-primary focus:ring-primary resize-none ${
                    formErrors.description ? "border-red-500" : ""
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {formErrors.description ? (
                    <p className="text-sm text-red-600">{formErrors.description}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Minimum 20 characters</p>
                  )}
                  <p className="text-sm">{getCharacterCount(formData.description, 2000)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Location & Dates Section */}
          <Card className="rounded-xl border border-gray-200 shadow-sm animate-scale-in">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="bg-green-100 rounded-lg p-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Location & Timeline</h2>
              </div>

              {/* Target Areas */}
              <div>
                <Label htmlFor="targetAreas" className="text-gray-700 font-medium">
                  Target Areas <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="targetAreas"
                  name="targetAreas"
                  value={formData.targetAreas}
                  onChange={handleInputChange}
                  placeholder="e.g., Beirut, Tripoli, Sidon"
                  className={`mt-2 rounded-xl border-gray-300 focus:border-primary focus:ring-primary ${
                    formErrors.targetAreas ? "border-red-500" : ""
                  }`}
                />
                <div className="mt-1">
                  {formErrors.targetAreas ? (
                    <p className="text-sm text-red-600">{formErrors.targetAreas}</p>
                  ) : (
                    <p className="text-sm text-gray-500">Enter comma separated city names</p>
                  )}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-gray-700 font-medium">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <Input
                      id="startDate"
                      name="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`pl-10 rounded-xl border-gray-300 focus:border-primary focus:ring-primary ${
                        formErrors.startDate ? "border-red-500" : ""
                      }`}
                    />
                  </div>
                  {formErrors.startDate && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.startDate}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endDate" className="text-gray-700 font-medium">
                    End Date <span className="text-gray-500">(Optional)</span>
                  </Label>
                  <div className="relative mt-2">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <Input
                      id="endDate"
                      name="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="pl-10 rounded-xl border-gray-300 focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Leave empty for ongoing campaigns</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Information Section */}
          <Card className="rounded-xl border border-gray-200 shadow-sm animate-scale-in">
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="bg-orange-100 rounded-lg p-2">
                  <Phone className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
              </div>

              <div>
                <Label htmlFor="contactInfo" className="text-gray-700 font-medium">
                  How can donors reach you? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="contactInfo"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  placeholder="Email: contact@charity.org&#10;Phone: +961 1 234 567&#10;WhatsApp: +961 70 123 456"
                  rows={4}
                  className={`mt-2 rounded-xl border-gray-300 focus:border-primary focus:ring-primary resize-none ${
                    formErrors.contactInfo ? "border-red-500" : ""
                  }`}
                />
                <div className="mt-1">
                  {formErrors.contactInfo ? (
                    <p className="text-sm text-red-600">{formErrors.contactInfo}</p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Provide multiple contact methods for donors to reach you
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Medicines Section */}
          <Card className="rounded-xl border border-gray-200 shadow-sm animate-scale-in">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Needed Medicines</h2>
                    <p className="text-sm text-gray-500">Optional-Select specific medicines</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowMedicineDialog(true)}
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Browse Medicines
                </Button>
              </div>

              {/* Selected Medicines */}
              {selectedMedicines.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    {selectedMedicines.length} medicine(s) selected
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getSelectedMedicineObjects().map((medicine) => (
                      <div
                        key={medicine.id}
                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{medicine.name}</p>
                          <p className="text-sm text-gray-600">
                            {[medicine.strength, medicine.form].filter(Boolean).join(" • ")}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedicine(medicine.id)}
                          className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors"
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No medicines selected yet</p>
                  <p className="text-sm">You can add specific medicines or leave it open for all donations</p>
                </div>
              )}
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 text-lg rounded-xl bg-primary hover:bg-secondary transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating Campaign...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Create Campaign
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="px-8 h-12 rounded-xl border-gray-300"
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Medicine Selection Dialog */}
        {showMedicineDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl max-h-[80vh] flex flex-col rounded-2xl shadow-2xl">
              {/* Dialog Header */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Select Medicines</h3>
                  <button
                    onClick={() => setShowMedicineDialog(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    value={medicineSearch}
                    onChange={(e) => setMedicineSearch(e.target.value)}
                    placeholder="Search medicines by name, generic name, or form..."
                    className="pl-10 rounded-xl"
                  />
                </div>
                
                {selectedMedicines.length > 0 && (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 inline mr-1" />
                    {selectedMedicines.length} selected
                  </p>
                )}
              </div>

              {/* Medicine List */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingMedicines ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredMedicines.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No medicines found</p>
                    {medicineSearch && (
                      <p className="text-sm">Try a different search term</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredMedicines.map((medicine) => {
                      const isSelected = selectedMedicines.includes(medicine.id);
                      return (
                        <button
                          key={medicine.id}
                          type="button"
                          onClick={() => toggleMedicine(medicine.id)}
                          className={`text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected
                                  ? "border-primary bg-primary"
                                  : "border-gray-300"
                              }`}
                            >
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{medicine.name}</p>
                              {medicine.genericName && (
                                <p className="text-sm text-gray-600 truncate">{medicine.genericName}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {[medicine.strength, medicine.form].filter(Boolean).join(" • ")}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dialog Footer */}
              <div className="p-6 border-t">
                <Button
                  onClick={() => setShowMedicineDialog(false)}
                  className="w-full h-12 rounded-xl"
                >
                  Done
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

