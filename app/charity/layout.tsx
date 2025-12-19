"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { PageContent } from "@/components/layout/PageContent";
import { CHARITY_NAV_ITEMS } from "@/constants/navigation";

export default function CharityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Header />
      <div className="flex min-h-screen w-screen bg-gray-50">
        <Sidebar navItems={CHARITY_NAV_ITEMS} />
        <PageContent>{children}</PageContent>
      </div>
    </SidebarProvider>
  );
}
