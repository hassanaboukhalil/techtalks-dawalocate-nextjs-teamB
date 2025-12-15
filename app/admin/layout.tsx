"use client";

import Sidebar from "@/components/layout/Sidebar";
import { ADMIN_NAV_ITEMS } from "@/constants/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={ADMIN_NAV_ITEMS} />
      <main className="flex-1 lg:ml-0 overflow-x-hidden pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
