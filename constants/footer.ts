import { Instagram, Mail, Facebook } from "lucide-react";

const FOOTER_LINKS = [
  { id: 1, label: "Home", link: "/" },
  { id: 2, label: "Features", link: "/#features" },
  { id: 3, label: "How It Works", link: "/#how-it-works" },
  { id: 4, label: "For Patients", link: "/#for-patients" },
  { id: 5, label: "For Pharmacies", link: "/#for-pharmacies" },
  { id: 6, label: "For Charities", link: "/#for-charities" },
];

const FOOTER_SOCIALS = [
  {
    id: 1,
    label: "Facebook",
    link: "https://www.facebook.com",
    icon: Facebook,
  },
  {
    id: 2,
    label: "Instagram",
    link: "https://www.instagram.com",
    icon: Instagram,
  },
  { id: 3, label: "Email", link: "mailto:info@dawalocate.com", icon: Mail },
];

export { FOOTER_LINKS, FOOTER_SOCIALS };
