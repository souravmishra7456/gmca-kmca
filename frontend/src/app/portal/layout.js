"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { NAV_ITEMS, CHAIRMAN_NAV_ITEMS, DIRECTOR_NAV_ITEMS, ROLES } from "@/lib/constants";
import useAuthStore from "@/store/authStore";
import { noticesAPI, authAPI } from "@/services/api";

export default function PortalLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, getCurrentUser } = useAuthStore();
  const [checkingSession, setCheckingSession] = useState(true);
  const [unreadNoticeCount, setUnreadNoticeCount] = useState(0);
  const [passwordRequestCount, setPasswordRequestCount] = useState(0);

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

  useEffect(() => {
    if (!user?.id) return;
    const seenKey = `gmca-notices-last-seen-${user.id}`;
    const markNoticesSeen = pathname === "/portal/notices";

    if (markNoticesSeen) {
      localStorage.setItem(seenKey, new Date().toISOString());
      setUnreadNoticeCount(0);
    }

    let active = true;
    const refreshCounts = async () => {
      try {
        const { data } = await noticesAPI.getAll({ limit: 100 });
        if (!active) return;
        const lastSeen = localStorage.getItem(seenKey);
        if (!lastSeen) {
          localStorage.setItem(seenKey, new Date().toISOString());
          setUnreadNoticeCount(0);
        } else if (!markNoticesSeen) {
          const seenTime = new Date(lastSeen).getTime();
          setUnreadNoticeCount((data.notices || []).filter((notice) => new Date(notice.date).getTime() > seenTime).length);
        }
      } catch {
        // The notices page handles loading errors; a badge should stay quiet.
      }

      if (user.role === ROLES.CHAIRMAN) {
        try {
          const { data } = await authAPI.getPasswordResetRequests();
          if (active) setPasswordRequestCount((data.requests || []).length);
        } catch {
          // Hide the count if the request cannot be loaded.
        }
      }
    };

    refreshCounts();
    const interval = window.setInterval(refreshCounts, 60000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [pathname, user?.id, user?.role]);

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <LoadingSpinner label="Checking your session..." />
      </div>
    );
  }

  const baseNavItems =
    user?.role === ROLES.CHAIRMAN
      ? CHAIRMAN_NAV_ITEMS
      : user?.role === ROLES.DIRECTOR
        ? DIRECTOR_NAV_ITEMS
        : NAV_ITEMS;
  const navItems = baseNavItems.map((item) => ({
    ...item,
    badge: item.href === "/portal/notices"
      ? unreadNoticeCount
      : item.href === "/portal/password-requests"
        ? passwordRequestCount
        : 0,
  }));

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
