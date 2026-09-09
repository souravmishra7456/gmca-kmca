"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { NAV_ITEMS, CHAIRMAN_NAV_ITEMS, DIRECTOR_NAV_ITEMS, ROLES } from "@/lib/constants";
import useAuthStore from "@/store/authStore";

export default function PortalLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, getCurrentUser } = useAuthStore();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      await useAuthStore.persist.rehydrate();
      const authenticatedUser = await getCurrentUser();

      if (!active) return;

      if (!authenticatedUser) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}&notice=login-required`);
        return;
      }

      setCheckingSession(false);
    };

    verifySession();
    return () => {
      active = false;
    };
  }, [getCurrentUser, pathname, router]);

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <LoadingSpinner label="Checking your session..." />
      </div>
    );
  }

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
