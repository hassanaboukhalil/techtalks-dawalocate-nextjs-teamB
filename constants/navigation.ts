import {
  Home,
  Info,
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
  { id: 1, label: "Features", link: "/#features", icon: Home },
  { id: 2, label: "How It Works", link: "/#how-it-works", icon: Info },
  { id: 3, label: "For Patients", link: "/#for-patients", icon: Tag },
  { id: 4, label: "For Pharmacies", link: "/#for-pharmacies", icon: Building2 },
  { id: 5, label: "For Charities", link: "/#for-charities", icon: Heart },
];

// 2. PATIENT Navigation
export const PATIENT_NAV_ITEMS: NavItem[] = [
  { id: 1, label: "Dashboard", link: "/patient", icon: LayoutDashboard },
  { id: 2, label: "Find Medicine", link: "/patient/search", icon: Search },
  { id: 3, label: "Donate Medicine", link: "/patient/donations", icon: Gift },
  { id: 4, label: "My Requests", link: "/patient/requests", icon: FileText },
  {
    id: 5,
    label: "Health Profile",
    link: "/patient/health-profile",
    icon: QrCode,
  },
  { id: 6, label: "Account", link: "/patient/account", icon: Settings },
];

// 3. PHARMACY Navigation
export const PHARMACY_NAV_ITEMS: NavItem[] = [
  { id: 1, label: "Dashboard", link: "/pharmacy", icon: LayoutDashboard },
  { id: 2, label: "Inventory", link: "/pharmacy/inventory", icon: Pill },
  { id: 3, label: "Requests", link: "/pharmacy/requests", icon: Inbox },
  { id: 4, label: "Campaigns", link: "/pharmacy/campaigns", icon: Megaphone },
  { id: 5, label: "Profile", link: "/pharmacy/profile", icon: User },
  { id: 6, label: "Settings", link: "/pharmacy/settings", icon: Settings },
];

// 4. CHARITY Navigation
export const CHARITY_NAV_ITEMS: NavItem[] = [
  { id: 1, label: "Dashboard", link: "/charity", icon: LayoutDashboard },
  { id: 2, label: "Campaigns", link: "/charity/campaigns", icon: Megaphone },
  { id: 3, label: "Medicine Requests", link: "/charity/requests", icon: Inbox },
  { id: 5, label: "Account", link: "/charity/account", icon: Settings },
];

// 5. ADMIN Navigation
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: 1, label: "Dashboard", link: "/admin", icon: LayoutDashboard },
  { id: 2, label: "Pharmacies", link: "/admin/pharmacies", icon: Building2 },
  { id: 3, label: "Charities", link: "/admin/charities", icon: Heart },
  { id: 4, label: "Patients", link: "/admin/patients", icon: Users },
  { id: 5, label: "Medicines", link: "/admin/medicines", icon: Pill },
  { id: 6, label: "Account", link: "/admin/account", icon: Settings },
];
