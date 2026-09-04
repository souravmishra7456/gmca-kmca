"use client";

import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { NAV_ITEMS, CHAIRMAN_NAV_ITEMS, DIRECTOR_NAV_ITEMS, ROLES } from "@/lib/constants";
import useAuthStore from "@/store/authStore";

export default function PortalLayout({ children }) {
  const { user } = useAuthStore();

  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  const navItems =
    user?.role === ROLES.CHAIRMAN
      ? CHAIRMAN_NAV_ITEMS
      : user?.role === ROLES.DIRECTOR
        ? DIRECTOR_NAV_ITEMS
        : NAV_ITEMS;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar items={navItems} />
      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <Navbar navItems={navItems} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
