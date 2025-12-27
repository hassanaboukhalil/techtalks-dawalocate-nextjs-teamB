"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Package,
  Loader2,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Building2,
  Mail,
  FileText,
  Heart,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  email: string;
  city: string | null;
  phone: string | null;
  address: string | null;
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

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get the back URL based on user type
  const getBackUrl = () => {
    if (session?.user?.userType === "pharmacy") {
      return "/pharmacy/campaigns";
    }
    return "/campaigns";
  };

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const fetchCampaign = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/global/campaigns/${campaignId}`);

      if (response.data.success) {
        setCampaign(response.data.data);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(
        error.response?.data?.error || "Failed to fetch campaign details"
      );
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

  const formatWhatsAppNumber = (phone: string | null): string | null => {
    if (!phone) return null;
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");
    // If it starts with 0, replace with country code 961 (Lebanon)
    if (cleaned.startsWith("0")) {
      return `961${cleaned.substring(1)}`;
    }
    // If it already starts with 961, return as is
    if (cleaned.startsWith("961")) {
      return cleaned;
    }
    // Otherwise, assume it's a local number and add 961
    return `961${cleaned}`;
  };

  const getWhatsAppUrl = (phone: string | null, message?: string): string => {
    const formattedNumber = formatWhatsAppNumber(phone);
    if (!formattedNumber) return "#";
    
    const defaultMessage = campaign
      ? `Hello! I'm interested in supporting your campaign: ${campaign.title}`
      : "Hello! I'm interested in supporting your campaign.";
    const encodedMessage = encodeURIComponent(message || defaultMessage);
    
    return `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
  };

  const handleShare = async () => {
    if (navigator.share && campaign) {
      try {
        await navigator.share({
          title: campaign.title,
          text: campaign.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-[#f6fbfc] via-white to-[#f0f9ff] pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading campaign details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-[#f6fbfc] via-white to-[#f0f9ff] pt-24 pb-16 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border border-red-200 bg-red-50 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">
                  Error Loading Campaign
                </h3>
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
                    onClick={() => router.push(getBackUrl())}
                    variant="outline"
                  >
                    Back to Campaigns
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  if (!campaign) {
    return null;
  }

  const status = getCampaignStatus();
  const daysRemaining = getDaysRemaining();
  const whatsappUrl = getWhatsAppUrl(campaign.charity.phone);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-[#f6fbfc] via-white to-[#f0f9ff] pt-24 pb-16">
        <div className="my-container max-w-6xl">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <Button
              variant="outline"
              onClick={() => router.push(getBackUrl())}
              className="mb-6 border-primary/30 text-primary hover:bg-primary/10 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    {campaign.title}
                  </h1>
                  {getStatusBadge(status)}
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-medium">{campaign.charity.name}</span>
                  {campaign.charity.city && (
                    <>
                      <span className="text-gray-400">•</span>
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{campaign.charity.city}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Created {formatDate(campaign.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="rounded-xl border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
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
                  <h2 className="text-xl font-bold text-gray-900">
                    About This Campaign
                  </h2>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {campaign.description}
                </p>
              </Card>

              {/* Medicines */}
              {campaign.campaignMedicines &&
                campaign.campaignMedicines.length > 0 && (
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
                          className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
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
                  <h2 className="text-xl font-bold text-gray-900">
                    Contact Information
                  </h2>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
                  {campaign.contactInfo}
                </p>
                <div className="space-y-2">
                  {campaign.charity.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a
                        href={`mailto:${campaign.charity.email}?subject=Regarding ${campaign.title}`}
                        className="hover:text-primary transition-colors"
                      >
                        {campaign.charity.email}
                      </a>
                    </div>
                  )}
                  {campaign.charity.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a
                        href={`tel:${campaign.charity.phone}`}
                        className="hover:text-primary transition-colors"
                      >
                        {campaign.charity.phone}
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Call to Action - WhatsApp Button */}
              {campaign.charity.phone && (
                <Card className="rounded-xl border-2 border-green-200 shadow-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50 animate-scale-in">
                  <div className="text-center mb-4">
                    <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-3">
                      <WhatsAppIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Get Involved
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Contact the charity directly via WhatsApp to learn more
                      about how you can help
                    </p>
                  </div>
                  <Button
                    onClick={() => window.open(whatsappUrl, "_blank")}
                    className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <WhatsAppIcon className="h-5 w-5 mr-2" />
                    Contact via WhatsApp
                  </Button>
                </Card>
              )}

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
                        {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}{" "}
                        remaining
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
                  <h2 className="text-xl font-bold text-gray-900">
                    Target Areas
                  </h2>
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
                    <p className="text-gray-900 font-medium">
                      {campaign.charity.name}
                    </p>
                  </div>

                  {campaign.charity.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a
                        href={`mailto:${campaign.charity.email}`}
                        className="text-sm text-gray-700 hover:text-primary transition-colors truncate"
                      >
                        {campaign.charity.email}
                      </a>
                    </div>
                  )}

                  {campaign.charity.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a
                        href={`tel:${campaign.charity.phone}`}
                        className="text-sm text-gray-700 hover:text-primary transition-colors"
                      >
                        {campaign.charity.phone}
                      </a>
                    </div>
                  )}

                  {campaign.charity.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-700">
                        {campaign.charity.city}
                      </p>
                    </div>
                  )}

                  {campaign.charity.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        {campaign.charity.address}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

