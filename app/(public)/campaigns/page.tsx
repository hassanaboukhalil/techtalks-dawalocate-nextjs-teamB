"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Calendar,
  MapPin,
  Package,
  Loader2,
  AlertCircle,
  Search,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  Building2,
  ArrowRight,
  Filter,
  X,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface Medicine {
  id: number;
  name: string;
  genericName: string | null;
  strength: string | null;
  form: string | null;
  imageUrl: string | null;
}

interface Charity {
  id: number;
  name: string;
  city: string | null;
  phone: string | null;
  email: string;
}

interface Campaign {
  id: number;
  title: string;
  description: string;
  targetAreas: string;
  startDate: string;
  endDate: string | null;
  contactInfo: string;
  createdAt: string;
  charity: Charity;
  campaignMedicines?: {
    id: number;
    medicine: Medicine;
  }[];
}

type StatusFilter = "all" | "active" | "upcoming";

export default function PublicCampaignsPage() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchMedicine, setSearchMedicine] = useState("");
  const [searchCharity, setSearchCharity] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter]);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("status", statusFilter);
      params.append("limit", "50");
      if (searchMedicine) params.append("medicine", searchMedicine);
      if (searchCharity) params.append("charity", searchCharity);

      const response = await axios.get(
        `/api/global/campaigns?${params.toString()}`
      );

      if (response.data.success) {
        setCampaigns(response.data.data || []);
        setTotalCount(response.data.pagination?.total || 0);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCampaigns();
  };

  const handleReturnToAll = () => {
    setSearchMedicine("");
    setSearchCharity("");
    setStatusFilter("all");
    // fetchCampaigns will be triggered by useEffect when statusFilter changes
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

  // Use campaigns directly since filtering is done server-side
  const filteredCampaigns = campaigns;

  // Get filter counts
  const getFilterCount = (filter: StatusFilter) => {
    if (filter === "all") return totalCount;
    return campaigns.filter((c) => getCampaignStatus(c) === filter).length;
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-[#f6fbfc] via-white to-[#f0f9ff] pt-24 pb-16">
        <div className="my-container">
          {/* Hero Section */}
          <div className="mb-12 text-center animate-slide-up">
            <div className="inline-flex items-center justify-center bg-primary/10 rounded-full px-4 py-2 mb-4">
              <Heart className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm font-semibold text-primary">
                Make a Difference
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Active Medicine <span className="text-primary">Campaigns</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Support local charities in their mission to provide essential
              medicines to those in need across Lebanon
            </p>
          </div>

          {/* Stats Banner */}
          {!loading && !error && (
            <div className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20 animate-scale-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {totalCount}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Total Campaigns
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {
                      campaigns.filter((c) => getCampaignStatus(c) === "active")
                        .length
                    }
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Active Campaigns
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {
                      campaigns.filter((c) => getCampaignStatus(c) === "upcoming")
                        .length
                    }
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Upcoming Campaigns
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {campaigns.reduce(
                      (acc, c) => acc + (c.campaignMedicines?.length || 0),
                      0
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Medicines Needed
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Bar */}
          <div className="mb-8 space-y-4 animate-scale-in">
            {/* Search Fields and Button Row */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Medicine Search */}
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchMedicine}
                    onChange={(e) => setSearchMedicine(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search by medicine..."
                    className="pl-10 h-10 text-sm rounded-lg border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
                  />
                  {searchMedicine && (
                    <button
                      onClick={() => {
                        setSearchMedicine("");
                        fetchCampaigns();
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Charity Name Search */}
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchCharity}
                    onChange={(e) => setSearchCharity(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search by charity name..."
                    className="pl-10 h-10 text-sm rounded-lg border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
                  />
                  {searchCharity && (
                    <button
                      onClick={() => {
                        setSearchCharity("");
                        fetchCampaigns();
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                className="h-10 px-6 rounded-lg bg-primary hover:bg-secondary transition-all duration-200 whitespace-nowrap"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Return to All Campaigns Button */}
            {(searchMedicine || searchCharity || statusFilter !== "all") && (
              <div className="flex justify-end">
                <Button
                  onClick={handleReturnToAll}
                  variant="outline"
                  className="h-9 px-4 rounded-lg border-gray-300 hover:bg-gray-50 text-sm"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Return to All Campaigns
                </Button>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              {(["all", "active", "upcoming"] as StatusFilter[]).map(
                (status) => (
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
                    <span className="ml-2 text-xs text-gray-400">
                      ({getFilterCount(status)})
                    </span>
                  </button>
                )
              )}
            </div>
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
                  <h3 className="font-semibold text-red-900 mb-1">
                    Error Loading Campaigns
                  </h3>
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
                  <Heart className="h-12 w-12 text-primary opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No campaigns found
                </h3>
                <p className="text-gray-600 mb-6">
                  {(searchMedicine || searchCharity || statusFilter !== "all")
                    ? "Try adjusting your search terms or filters"
                    : "Check back soon for new campaigns from charities"}
                </p>
                {(searchMedicine || searchCharity || statusFilter !== "all") && (
                  <Button
                    onClick={handleReturnToAll}
                    className="rounded-xl px-6"
                  >
                    Return to All Campaigns
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Campaigns Grid */}
          {!loading && !error && filteredCampaigns.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
              {filteredCampaigns.map((campaign, index) => {
                const status = getCampaignStatus(campaign);
                const daysRemaining = getDaysRemaining(campaign.endDate);

                return (
                  <Card
                    key={campaign.id}
                    className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 ease-out overflow-hidden cursor-pointer animate-scale-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => router.push(`/campaigns/${campaign.id}`)}
                  >
                    {/* Status Badge - Top Right Corner */}
                    <div className="absolute top-3 right-3 z-10">
                      {getStatusBadge(status)}
                    </div>

                    {/* Card Header with Gradient Background */}
                    <div className="relative bg-gradient-to-br from-primary/5 via-primary/3 to-secondary/5 p-4 pb-5 border-b border-gray-100">
                      {/* Heart Icon - Top Left */}
                      <div className="absolute top-2.5 left-2.5 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm group-hover:bg-white transition-colors">
                        <Heart className="h-4 w-4 text-primary" />
                      </div>

                      {/* Campaign Title */}
                      <h3 className="font-bold text-xl leading-tight text-gray-900 mt-5 mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                        {campaign.title}
                      </h3>

                      {/* Charity Name */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-1">
                          <Building2 className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-semibold">
                          {campaign.charity.name}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Description */}
                      <p className="text-sm text-gray-600 leading-normal line-clamp-2">
                        {campaign.description}
                      </p>

                      {/* Key Information Grid */}
                      <div className="grid grid-cols-1 gap-2 pt-1.5 border-t border-gray-100">
                        {/* Target Areas */}
                        <div className="flex items-start gap-2">
                          <div className="bg-blue-50 rounded-lg p-1 flex-shrink-0">
                            <MapPin className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                              Target Areas
                            </p>
                            <p className="text-sm font-medium text-gray-900 leading-tight">
                              {campaign.targetAreas}
                            </p>
                          </div>
                        </div>

                        {/* Campaign Duration */}
                        <div className="flex items-start gap-2">
                          <div className="bg-purple-50 rounded-lg p-1 flex-shrink-0">
                            <Calendar className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                              Duration
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(campaign.startDate)}
                              {campaign.endDate &&
                                ` - ${formatDate(campaign.endDate)}`}
                            </p>
                            {daysRemaining !== null && daysRemaining > 0 && (
                              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 border border-orange-200 rounded-full">
                                <Clock className="h-3 w-3 text-orange-600" />
                                <span className="text-xs font-semibold text-orange-700">
                                  {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Medicines Needed */}
                        {campaign.campaignMedicines &&
                          campaign.campaignMedicines.length > 0 && (
                            <div className="flex items-start gap-2">
                              <div className="bg-emerald-50 rounded-lg p-1 flex-shrink-0">
                                <Package className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                  Medicines ({campaign.campaignMedicines.length})
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {campaign.campaignMedicines
                                    .slice(0, 2)
                                    .map((cm) => (
                                      <span
                                        key={cm.id}
                                        className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-100 hover:bg-blue-100 transition-colors"
                                      >
                                        {cm.medicine.name}
                                      </span>
                                    ))}
                                  {campaign.campaignMedicines.length > 2 && (
                                    <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200">
                                      +{campaign.campaignMedicines.length - 2} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Contact Information - Compact Design */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl p-2.5 border border-gray-100">
                        <div className="flex items-center justify-between gap-2">
                          {campaign.charity.phone && (
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <div className="bg-white rounded-lg p-1 shadow-sm">
                                <Phone className="h-3.5 w-3.5 text-gray-500" />
                              </div>
                              <span className="text-xs font-medium text-gray-700 truncate">
                                {campaign.charity.phone}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <div className="bg-white rounded-lg p-1 shadow-sm">
                              <Mail className="h-3.5 w-3.5 text-gray-500" />
                            </div>
                            <span className="text-xs font-medium text-gray-700 truncate">
                              {campaign.charity.email}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button - Enhanced Design */}
                      <Button
                        className="w-full rounded-xl bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg text-white font-semibold py-2 group-hover:scale-[1.02] transition-all duration-300 border-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/campaigns/${campaign.id}`);
                        }}
                      >
                        <span>View Full Details</span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500 pointer-events-none rounded-2xl" />
                  </Card>
                );
              })}
            </div>
          )}

          {/* Results Summary */}
          {!loading && !error && filteredCampaigns.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Showing{" "}
                <span className="font-semibold">
                  {filteredCampaigns.length}
                </span>{" "}
                of <span className="font-semibold">{totalCount}</span>{" "}
                campaign(s)
                {(searchMedicine || searchCharity) && (
                  <>
                    {" "}matching{" "}
                    {[
                      searchMedicine && `medicine: "${searchMedicine}"`,
                      searchCharity && `charity: "${searchCharity}"`,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </>
                )}
              </p>
            </div>
          )}

          {/* Call to Action for Charities */}
          <div className="mt-16 bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 text-white text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Are you a charity organization?
            </h2>
            <p className="text-white/90 mb-6 max-w-xl mx-auto">
              Join DawaLocate to create impactful medicine donation campaigns
              and reach communities in need across Lebanon
            </p>
            <Button
              onClick={() => router.push("/signup")}
              variant="outline"
              className="bg-white text-primary hover:bg-gray-100 border-white rounded-xl px-8 py-6 text-lg font-semibold"
            >
              Register Your Charity
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

