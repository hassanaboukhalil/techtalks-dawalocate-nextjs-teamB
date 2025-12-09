import {
  Home,
  Info,
  Phone,
  LayoutDashboard,
  Search,
  FileText,
  User,
  Pill,
  Heart,
  Megaphone,
  Settings,
  QrCode,
  Gift,
  Inbox,
  Tag, // Added for "Offers"
  Building2, // Added for "Pharmacies"
  Users, // Added for "Patients"
} from "lucide-react";

export interface NavItem {
  id: number;
  label: string;
  link: string;
  icon?: React.ElementType;
}

// 1. PUBLIC Navigation (Accessible by everyone)
export const PUBLIC_NAV_ITEMS: NavItem[] = [
  { id: 1, label: "Features", link: "/", icon: Home },
  { id: 2, label: "For Patients", link: "/for-patients", icon: Tag },
  { id: 3, label: "For Pharmacies", link: "/for-pharmacies", icon: Info },
  { id: 4, label: "For Charities", link: "/for-charities", icon: Phone },
  { id: 5, label: "FAQ", link: "/faq", icon: User },
];

// 2. PATIENT Navigation
export const PATIENT_NAV_ITEMS: NavItem[] = [
  { id: 1, label: "Dashboard", link: "/patient", icon: LayoutDashboard },
  { id: 2, label: "Find Medicine", link: "/patient/search", icon: Search },
  { id: 3, label: "Pharmacy Offers", link: "/patient/offers", icon: Tag }, // New: View Offers
  { id: 4, label: "Donate Medicine", link: "/patient/donations", icon: Gift },
  { id: 5, label: "My Requests", link: "/patient/requests", icon: FileText },
  { id: 6, label: "Health Card", link: "/patient/health-card", icon: QrCode },
  { id: 7, label: "Profile", link: "/patient/profile", icon: User },
];

// 3. PHARMACY Navigation
export const PHARMACY_NAV_ITEMS: NavItem[] = [
  { id: 1, label: "Dashboard", link: "/pharmacy", icon: LayoutDashboard },
  { id: 2, label: "Inventory", link: "/pharmacy/inventory", icon: Pill },
  { id: 3, label: "My Offers", link: "/pharmacy/offers", icon: Tag }, // New: Create/Manage public offers
  { id: 4, label: "Local Requests", link: "/pharmacy/requests", icon: Inbox }, //"A list of patients in my city/area who are looking for a specific medicine."
  { id: 5, label: "Profile", link: "/pharmacy/profile", icon: User },
];

// 4. CHARITY Navigation
export const CHARITY_NAV_ITEMS: NavItem[] = [
  { id: 1, label: "Dashboard", link: "/charity", icon: LayoutDashboard },
  { id: 2, label: "Donations", link: "/charity/donations", icon: Gift },
  { id: 3, label: "Campaigns", link: "/charity/campaigns", icon: Megaphone },
  { id: 4, label: "Profile", link: "/charity/profile", icon: User },
];

// 5. ADMIN Navigation
// Updated to show specific dashboards for each user type as you requested
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: 1, label: "Dashboard", link: "/admin", icon: LayoutDashboard },
  { id: 2, label: "Pharmacies", link: "/admin/pharmacies", icon: Building2 }, // Monitor Pharmacy actions/approvals
  { id: 3, label: "Charities", link: "/admin/charities", icon: Heart }, // Monitor Charity actions/approvals
  { id: 4, label: "Patients", link: "/admin/patients", icon: Users }, // Monitor Patient actions
  { id: 5, label: "Medicines", link: "/admin/medicines", icon: Pill }, // Master Catalog
  { id: 6, label: "System Settings", link: "/admin/settings", icon: Settings },
];
