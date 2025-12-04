import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cookies } from "next/headers";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Truck,
  Building2,
  Package,
  AlertCircle,
} from "lucide-react";

// Types for API response
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
  status: "IN_STOCK" | "LOW" | "OUT";
  expiresAt: string | null;
  medicine: Medicine;
}

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
}

interface ApiResponse {
  success: boolean;
  data: {
    profile: PharmacyProfile;
    inventory: InventoryItem[];
    inventoryCount: number;
  };
  error?: string;
  message?: string;
}

// Fetch pharmacy profile data
async function getPharmacyProfile(): Promise<ApiResponse | null> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token")?.value;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/pharmacy/profile`, {
      headers: {
        Cookie: `auth-token=${authToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json();
      return errorData;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching pharmacy profile:", error);
    return null;
  }
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    APPROVED: "bg-green text-white",
    PENDING: "bg-yellow-500 text-white",
    REJECTED: "bg-red-500 text-white",
    IN_STOCK: "bg-green text-white",
    LOW: "bg-yellow-500 text-white",
    OUT: "bg-red-500 text-white",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray text-white"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

// Info row component for profile details
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="h-5 w-5 text-primary shrink-0" />
      <div>
        <p className="text-xs text-gray">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value || "N/A"}</p>
      </div>
    </div>
  );
}

// Format date helper
function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Check if expired
function isExpired(dateString: string | null): boolean {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
}

export default async function PharmacyProfilePage() {
  const result = await getPharmacyProfile();

  // Error state
  if (!result || result.error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-4 py-8">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div>
                <h2 className="text-xl font-semibold text-red-700">
                  {result?.error || "Error"}
                </h2>
                <p className="text-red-600">
                  {result?.message || "Failed to load pharmacy profile. Please try again later."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { profile, inventory, inventoryCount } = result.data;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary flex-center">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-h2 text-gray-900">{profile.name}</h1>
            <p className="text-gray">Pharmacy Profile</p>
          </div>
          <div className="ml-auto">
            <StatusBadge status={profile.status || "PENDING"} />
          </div>
        </div>

        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Profile Information</CardTitle>
            <CardDescription>Your pharmacy details and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              <InfoRow icon={Phone} label="Phone" value={profile.phone} />
              <InfoRow icon={MapPin} label="City" value={profile.city} />
              <InfoRow icon={MapPin} label="Address" value={profile.address} />
              <InfoRow icon={Clock} label="Opening Hours" value={profile.openingHours} />
              <InfoRow
                icon={Truck}
                label="Delivery Service"
                value={profile.hasDelivery ? "Yes" : "No"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Inventory Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Inventory
                </CardTitle>
                <CardDescription>
                  {inventoryCount} medicine{inventoryCount !== 1 ? "s" : ""} in your inventory
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Strength / Form</TableHead>
                  <TableHead>Synonyms</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.length === 0 ? (
                  <TableEmpty
                    message="No medicines in inventory"
                    icon={<Package className="h-10 w-10" />}
                  />
                ) : (
                  inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{item.medicine.name}</p>
                          {item.medicine.genericName && (
                            <p className="text-xs text-gray">{item.medicine.genericName}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {item.medicine.strength || "-"} / {item.medicine.form || "-"}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {item.medicine.synonyms || "-"}
                      </TableCell>
                      <TableCell className="text-gray-700 font-medium">
                        {item.quantity}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            isExpired(item.expiresAt)
                              ? "text-red-500 font-medium"
                              : "text-gray-700"
                          }
                        >
                          {formatDate(item.expiresAt)}
                          {isExpired(item.expiresAt) && " (Expired)"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

