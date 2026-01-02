"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Package,
  Loader2,
  AlertCircle,
  Edit,
  TrendingUp,
  Clock,
  CheckCircle2,
  Building2,
  Mail,
  FileText,
  Info,
  X,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Medicine {
  id: number;
  name: string;
  genericName: string | null;
  strength: string | null;
  form: string | null;
  imageUrl: string | null;
}

interface CampaignMedicine {
  id: number;
  medicine: Medicine;
}

interface Charity {
  id: number;
  name: string;
  email: string;
  city: string | null;
  phone: string | null;
  address: string | null;
}

interface Campaign {
  id: number;
  charityUserId: number;
  title: string;
  description: string;
  targetAreas: string;
  startDate: string;
  endDate: string | null;
  contactInfo: string;
  createdAt: string;
  updatedAt: string;
  charity?: Charity;
  campaignMedicines?: CampaignMedicine[];
}

export default function CampaignDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editValidationErrors, setEditValidationErrors] = useState<string[]>([]);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    targetAreas: "",
    startDate: "",
    endDate: "",
    contactInfo: "",
  });

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const fetchCampaign = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/charity/campaigns/${campaignId}`);
      
      if (response.data.success) {
        setCampaign(response.data.data);
      }
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: unknown }).response === "object"
      ) {
        setError(
          (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
            "Failed to fetch campaign details"
        );
      } else {
        setError("Failed to fetch campaign details");
      }
    } finally {
      setLoading(false);
    }
  };

  const getCampaignStatus = (): string => {
    if (!campaign) return "unknown";
    
    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = campaign.endDate ? new Date(campaign.endDate) : null;

    if (startDate > now) {
      return "upcoming";
    } else if (!endDate || endDate >= now) {
      return "active";
    } else {
      return "past";
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-700 border-green-200",
      upcoming: "bg-blue-100 text-blue-700 border-blue-200",
      past: "bg-gray-100 text-gray-700 border-gray-200",
    };

    const icons = {
      active: <TrendingUp className="h-5 w-5" />,
      upcoming: <Clock className="h-5 w-5" />,
      past: <CheckCircle2 className="h-5 w-5" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
          styles[status as keyof typeof styles]
        }`}
      >
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysRemaining = () => {
    if (!campaign?.endDate) return null;
    
    const now = new Date();
    const end = new Date(campaign.endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return null;
    return diffDays;
  };

  // Edit dialog functions
  const openEditDialog = () => {
    if (!campaign) return;

    const formatDateForInput = (dateString: string) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setEditFormData({
      title: campaign.title,
      description: campaign.description,
      targetAreas: campaign.targetAreas,
      startDate: formatDateForInput(campaign.startDate),
      endDate: campaign.endDate ? formatDateForInput(campaign.endDate) : "",
      contactInfo: campaign.contactInfo,
    });
    
    setEditError(null);
    setEditValidationErrors([]);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditError(null);
    setEditValidationErrors([]);
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    setEditError(null);
    setEditValidationErrors([]);
  };

  const handleUpdateCampaign = async () => {
    if (!campaign) return;

    setEditLoading(true);
    setEditError(null);
    setEditValidationErrors([]);

    try {
      const response = await axios.put(
        `/api/charity/campaigns/${campaign.id}`,
        editFormData
      );

      if (response.data.success) {
        setCampaign(response.data.data);
        closeEditDialog();
      }
    } catch (err: unknown) {
      let errorData: { error?: string; details?: string[] } | undefined;
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: unknown }).response === "object"
      ) {
        errorData = (err as { response?: { data?: { error?: string; details?: string[] } } }).response?.data;
      }

      if (errorData?.details && Array.isArray(errorData.details)) {
        setEditValidationErrors(errorData.details);
      }

      setEditError(errorData?.error || "Failed to update campaign. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6fbfc] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6fbfc] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border border-red-200 bg-red-50 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Campaign</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="flex gap-2">
                <Button
                  onClick={fetchCampaign}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push("/charity/campaigns")}
                  variant="outline"
                >
                  Back to Campaigns
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const status = getCampaignStatus();
  const daysRemaining = getDaysRemaining();

  return (
    <div className="min-h-screen bg-[#f6fbfc] py-8">
      <div className="my-container max-w-6xl">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <Button
            variant="outline"
            onClick={() => router.push("/charity/campaigns")}
            className="mb-4 border-primary/30 text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-h2 text-primary">{campaign.title}</h1>
                {getStatusBadge(status)}
              </div>
              <p className="text-gray-600">
                Created {formatDate(campaign.createdAt)}
                {campaign.updatedAt !== campaign.createdAt && (
                  <> • Updated {formatDate(campaign.updatedAt)}</>
                )}
              </p>
            </div>
            <Button
              onClick={openEditDialog}
              className="h-12 px-6 rounded-xl bg-primary hover:bg-secondary"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Campaign
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="rounded-xl border border-gray-200 shadow-sm p-6 animate-scale-in">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="bg-purple-100 rounded-lg p-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Description</h2>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {campaign.description}
              </p>
            </Card>

            {/* Medicines */}
            {campaign.campaignMedicines && campaign.campaignMedicines.length > 0 && (
              <Card className="rounded-xl border border-gray-200 shadow-sm p-6 animate-scale-in">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Needed Medicines ({campaign.campaignMedicines.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {campaign.campaignMedicines.map((cm) => (
                    <div
                      key={cm.id}
                      className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="bg-blue-200 rounded-lg p-2">
                        <Package className="h-5 w-5 text-blue-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {cm.medicine.name}
                        </p>
                        {cm.medicine.genericName && (
                          <p className="text-sm text-gray-600 truncate">
                            {cm.medicine.genericName}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {[cm.medicine.strength, cm.medicine.form]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Contact Information */}
            <Card className="rounded-xl border border-gray-200 shadow-sm p-6 animate-scale-in">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="bg-orange-100 rounded-lg p-2">
                  <Phone className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {campaign.contactInfo}
              </p>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card className="rounded-xl border border-gray-200 shadow-sm p-6 animate-scale-in">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="bg-green-100 rounded-lg p-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Timeline</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase mb-1">
                    Start Date
                  </p>
                  <p className="text-gray-900 font-medium">
                    {formatDate(campaign.startDate)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase mb-1">
                    End Date
                  </p>
                  <p className="text-gray-900 font-medium">
                    {campaign.endDate ? formatDate(campaign.endDate) : "Ongoing"}
                  </p>
                </div>

                {daysRemaining !== null && daysRemaining > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-orange-900">
                      {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Target Areas */}
            <Card className="rounded-xl border border-gray-200 shadow-sm p-6 animate-scale-in">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="bg-indigo-100 rounded-lg p-2">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Target Areas</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {campaign.targetAreas.split(",").map((area, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-sm font-medium"
                  >
                    <MapPin className="h-3 w-3" />
                    {area.trim()}
                  </span>
                ))}
              </div>
            </Card>

            {/* Charity Info */}
            {campaign.charity && (
              <Card className="rounded-xl border border-gray-200 shadow-sm p-6 animate-scale-in">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="bg-teal-100 rounded-lg p-2">
                    <Building2 className="h-5 w-5 text-teal-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Charity</h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase mb-1">
                      Organization
                    </p>
                    <p className="text-gray-900 font-medium">{campaign.charity.name}</p>
                  </div>

                  {campaign.charity.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-700">{campaign.charity.email}</p>
                    </div>
                  )}

                  {campaign.charity.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-700">{campaign.charity.phone}</p>
                    </div>
                  )}

                  {campaign.charity.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-700">{campaign.charity.city}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Campaign Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Edit className="h-6 w-6 text-primary" />
              Edit Campaign
            </DialogTitle>
          </DialogHeader>

          {editError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700">{editError}</p>
                  {editValidationErrors.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {editValidationErrors.map((err, idx) => (
                        <li key={idx} className="text-sm text-red-600">• {err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-2">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Update your campaign information. All fields are required unless marked optional.
              </p>
            </div>
          </div>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="flex items-center gap-2 text-gray-700 font-medium">
                <FileText className="h-4 w-4 text-gray-500" />
                Campaign Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-title"
                name="title"
                value={editFormData.title}
                onChange={handleEditInputChange}
                maxLength={200}
                className="rounded-lg"
              />
              <p className="text-xs text-gray-500">
                {editFormData.title.length}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="flex items-center gap-2 text-gray-700 font-medium">
                <FileText className="h-4 w-4 text-gray-500" />
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="edit-description"
                name="description"
                value={editFormData.description}
                onChange={handleEditInputChange}
                rows={5}
                maxLength={2000}
                className="rounded-lg resize-none"
              />
              <p className="text-xs text-gray-500">
                {editFormData.description.length}/2000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-targetAreas" className="flex items-center gap-2 text-gray-700 font-medium">
                <MapPin className="h-4 w-4 text-gray-500" />
                Target Areas <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-targetAreas"
                name="targetAreas"
                value={editFormData.targetAreas}
                onChange={handleEditInputChange}
                className="rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate" className="flex items-center gap-2 text-gray-700 font-medium">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-startDate"
                  name="startDate"
                  type="datetime-local"
                  value={editFormData.startDate}
                  onChange={handleEditInputChange}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-endDate" className="flex items-center gap-2 text-gray-700 font-medium">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  End Date <span className="text-gray-500">(Optional)</span>
                </Label>
                <Input
                  id="edit-endDate"
                  name="endDate"
                  type="datetime-local"
                  value={editFormData.endDate}
                  onChange={handleEditInputChange}
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contactInfo" className="flex items-center gap-2 text-gray-700 font-medium">
                <Phone className="h-4 w-4 text-gray-500" />
                Contact Information <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="edit-contactInfo"
                name="contactInfo"
                value={editFormData.contactInfo}
                onChange={handleEditInputChange}
                rows={3}
                className="rounded-lg resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeEditDialog}
              disabled={editLoading}
              className="rounded-lg"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateCampaign}
              disabled={editLoading}
              className="rounded-lg bg-primary hover:bg-secondary"
            >
              {editLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

