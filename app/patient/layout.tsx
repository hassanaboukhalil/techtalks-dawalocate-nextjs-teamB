"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { PageContent } from "@/components/layout/PageContent";
import { PATIENT_NAV_ITEMS } from "@/constants/navigation";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Header />
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar navItems={PATIENT_NAV_ITEMS} />
        <PageContent>{children}</PageContent>
      </div>
    </SidebarProvider>
  );
}
