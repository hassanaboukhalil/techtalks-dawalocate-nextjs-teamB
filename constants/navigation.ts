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
    Tag,          // Added for "Offers"
    Building2,    // Added for "Pharmacies"
    Users         // Added for "Patients"
  } from 'lucide-react';
  
  export interface NavItem {
    label: string;
    href: string;
    icon?: React.ElementType;
  }
  
  // 1. PUBLIC Navigation (Accessible by everyone)
  export const publicNav: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Browse Offers', href: '/offers', icon: Tag }, // New: Public can see pharmacy deals
    { label: 'About Us', href: '/about', icon: Info },
    { label: 'Contact', href: '/contact', icon: Phone },
  ];
  
  // 2. PATIENT Navigation
  export const patientNav: NavItem[] = [
    { label: 'Dashboard', href: '/patient', icon: LayoutDashboard },
    { label: 'Find Medicine', href: '/patient/search', icon: Search },
    { label: 'Pharmacy Offers', href: '/patient/offers', icon: Tag }, // New: View Offers
    { label: 'Donate Medicine', href: '/patient/donations', icon: Gift },
    { label: 'My Requests', href: '/patient/requests', icon: FileText },
    { label: 'Health Card', href: '/patient/health-card', icon: QrCode },
    { label: 'Profile', href: '/patient/profile', icon: User },
  ];
  
  // 3. PHARMACY Navigation
  export const pharmacyNav: NavItem[] = [
    { label: 'Dashboard', href: '/pharmacy', icon: LayoutDashboard },
    { label: 'Inventory', href: '/pharmacy/inventory', icon: Pill },
    { label: 'My Offers', href: '/pharmacy/offers', icon: Tag }, // New: Create/Manage public offers
    { label: 'Local Requests', href: '/pharmacy/requests', icon: Inbox },//"A list of patients in my city/area who are looking for a specific medicine."
    { label: 'Profile', href: '/pharmacy/profile', icon: User },
  ];
  
  // 4. CHARITY Navigation
  export const charityNav: NavItem[] = [
    { label: 'Dashboard', href: '/charity', icon: LayoutDashboard },
    { label: 'Donations', href: '/charity/donations', icon: Gift },
    { label: 'Campaigns', href: '/charity/campaigns', icon: Megaphone },
    { label: 'Profile', href: '/charity/profile', icon: User },
  ];
  
  // 5. ADMIN Navigation
  // Updated to show specific dashboards for each user type as you requested
  export const adminNav: NavItem[] = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Pharmacies', href: '/admin/pharmacies', icon: Building2 }, // Monitor Pharmacy actions/approvals
    { label: 'Charities', href: '/admin/charities', icon: Heart },       // Monitor Charity actions/approvals
    { label: 'Patients', href: '/admin/patients', icon: Users },         // Monitor Patient actions
    { label: 'Medicines', href: '/admin/medicines', icon: Pill },        // Master Catalog
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
  ];