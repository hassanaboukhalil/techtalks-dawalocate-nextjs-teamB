"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Plus,
  Calendar,
  MapPin,
  Package,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit,
  X,
  Save,
  FileText,
  Phone,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Campaign {
  id: number;
  title: string;
  description: string;
  targetAreas: string;
  startDate: string;
  endDate: string | null;
  contactInfo: string;
  createdAt: string;
  campaignMedicines?: {
    id: number;
    medicine: {
      id: number;
      name: string;
      strength: string | null;
      form: string | null;
    };
  }[];
}

type StatusFilter = "all" | "active" | "upcoming" | "past";

export default function CampaignsPage() {
  const router = useRouter();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
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
    fetchCampaigns();
  }, [statusFilter]);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `/api/charity/campaigns?status=${statusFilter}&limit=50`
      );
      
      if (response.data.success) {
        setCampaigns(response.data.data || []);
        setTotalCount(response.data.pagination?.total || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  const getCampaignStatus = (campaign: Campaign): string => {
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
      active: <TrendingUp className="h-3 w-3" />,
      upcoming: <Clock className="h-3 w-3" />,
      past: <CheckCircle2 className="h-3 w-3" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${
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
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return null;
    return diffDays;
  };

  // Filter campaigns by search query
  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.targetAreas.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get filter counts
  const getFilterCount = (filter: StatusFilter) => {
    if (filter === "all") return totalCount;
    return campaigns.filter((c) => getCampaignStatus(c) === filter).length;
  };

  // Edit dialog functions
  const openEditDialog = (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCampaign(campaign);
    
    // Format dates for datetime-local input
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
    setEditingCampaign(null);
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
    if (!editingCampaign) return;

    setEditLoading(true);
    setEditError(null);
    setEditValidationErrors([]);

    try {
      const response = await axios.put(
        `/api/charity/campaigns/${editingCampaign.id}`,
        editFormData
      );

      if (response.data.success) {
        // Update the campaign in the list
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === editingCampaign.id ? { ...c, ...response.data.data } : c
          )
        );
        
        closeEditDialog();
        
        // Optionally refresh the list to get latest data
        fetchCampaigns();
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      
      if (errorData?.details && Array.isArray(errorData.details)) {
        setEditValidationErrors(errorData.details);
      }
      
      setEditError(errorData?.error || "Failed to update campaign. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6fbfc] py-8">
      <div className="my-container">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/15 rounded-xl p-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-h2 text-primary mb-2">My Campaigns</h1>
                <p className="text-gray-600">
                  Manage and track your medicine donation campaigns
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/charity/campaigns/create")}
              className="h-12 px-6 rounded-xl bg-primary hover:bg-secondary transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Campaign
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns by title, description, or location..."
              className="pl-12 h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-primary"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-scale-in">
          <Card className="p-5 rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Total</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{totalCount}</p>
              </div>
              <div className="bg-blue-200 rounded-lg p-3">
                <Package className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </Card>

          <Card className="p-5 rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 uppercase tracking-wide">Active</p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {campaigns.filter((c) => getCampaignStatus(c) === "active").length}
                </p>
              </div>
              <div className="bg-green-200 rounded-lg p-3">
                <TrendingUp className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </Card>

          <Card className="p-5 rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">Upcoming</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  {campaigns.filter((c) => getCampaignStatus(c) === "upcoming").length}
                </p>
              </div>
              <div className="bg-purple-200 rounded-lg p-3">
                <Clock className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </Card>

          <Card className="p-5 rounded-xl border border-gray-200 bg-gradient-to-br from-orange-50 to-orange-100/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 uppercase tracking-wide">Completed</p>
                <p className="text-3xl font-bold text-orange-900 mt-1">
                  {campaigns.filter((c) => getCampaignStatus(c) === "past").length}
                </p>
              </div>
              <div className="bg-orange-200 rounded-lg p-3">
                <CheckCircle2 className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {(["all", "active", "upcoming", "past"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-6 py-3 font-medium capitalize transition-all duration-200 border-b-2 whitespace-nowrap ${
                statusFilter === status
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              {status}
              {statusFilter !== status && (
                <span className="ml-2 text-xs text-gray-400">
                  ({getFilterCount(status)})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-gray-600 text-lg">Loading campaigns...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border border-red-200 bg-red-50 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error Loading Campaigns</h3>
                <p className="text-red-700">{error}</p>
                <Button
                  onClick={fetchCampaigns}
                  variant="outline"
                  className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCampaigns.length === 0 && (
          <Card className="rounded-xl p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="bg-primary/10 rounded-full p-6 w-fit mx-auto mb-4">
                <Package className="h-12 w-12 text-primary opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery
                  ? "No campaigns found"
                  : statusFilter === "all"
                  ? "No campaigns yet"
                  : `No ${statusFilter} campaigns`}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Create your first campaign to start helping communities in need"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => router.push("/charity/campaigns/create")}
                  className="rounded-xl px-6"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Campaign
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Campaigns Grid */}
        {!loading && !error && filteredCampaigns.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign, index) => {
              const status = getCampaignStatus(campaign);
              const daysRemaining = getDaysRemaining(campaign.endDate);

              return (
                <Card
                  key={campaign.id}
                  className="rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => router.push(`/charity/campaigns/${campaign.id}`)}
                >
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1">
                        {campaign.title}
                      </h3>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(status)}
                        <button
                          onClick={(e) => openEditDialog(campaign, e)}
                          className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full transition-colors"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-3">{campaign.description}</p>

                    {/* Details Grid */}
                    <div className="space-y-3 pt-2">
                      {/* Target Areas */}
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase">Target Areas</p>
                          <p className="text-sm text-gray-900 truncate">{campaign.targetAreas}</p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase">Duration</p>
                          <p className="text-sm text-gray-900">
                            {formatDate(campaign.startDate)}
                            {campaign.endDate && ` - ${formatDate(campaign.endDate)}`}
                          </p>
                          {daysRemaining !== null && daysRemaining > 0 && (
                            <p className="text-xs text-orange-600 font-medium mt-1">
                              {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Medicines */}
                      {campaign.campaignMedicines && campaign.campaignMedicines.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                              Medicines ({campaign.campaignMedicines.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {campaign.campaignMedicines.slice(0, 2).map((cm) => (
                                <span
                                  key={cm.id}
                                  className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200"
                                >
                                  {cm.medicine.name}
                                </span>
                              ))}
                              {campaign.campaignMedicines.length > 2 && (
                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                  +{campaign.campaignMedicines.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/charity/campaigns/${campaign.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Results Summary */}
        {!loading && !error && filteredCampaigns.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredCampaigns.length}</span> of{" "}
              <span className="font-semibold">{totalCount}</span> campaign(s)
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        )}
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

          {/* Error Display */}
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

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-2">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Update your campaign information. All fields are required unless marked optional.
              </p>
            </div>
          </div>

          <div className="space-y-6 py-4">
            {/* Campaign Title */}
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
                placeholder="e.g., Winter Medicine Relief Drive 2024"
                maxLength={200}
                className="rounded-lg"
              />
              <p className="text-xs text-gray-500">
                {editFormData.title.length}/200 characters
              </p>
            </div>

            {/* Description */}
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
                placeholder="Describe your campaign goals and impact..."
                rows={5}
                maxLength={2000}
                className="rounded-lg resize-none"
              />
              <p className="text-xs text-gray-500">
                {editFormData.description.length}/2000 characters (minimum 20)
              </p>
            </div>

            {/* Target Areas */}
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
                placeholder="e.g., Beirut, Tripoli, Sidon"
                className="rounded-lg"
              />
              <p className="text-xs text-gray-500">
                Enter comma-separated city names
              </p>
            </div>

            {/* Dates */}
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

            {/* Contact Information */}
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
                placeholder="Email: contact@charity.org&#10;Phone: +961 1 234 567"
                rows={3}
                className="rounded-lg resize-none"
              />
              <p className="text-xs text-gray-500">
                Provide multiple contact methods
              </p>
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


