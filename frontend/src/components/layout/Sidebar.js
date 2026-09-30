"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Users,
  Bell,
  UserCog,
  KeyRound,
  ChartNoAxesCombined,
  ClipboardCheck,
  LogOut,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AssociationBrand from "@/components/shared/AssociationBrand";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/authStore";
import { getInitials } from "@/lib/utils";

const iconMap = {
  LayoutDashboard,
  User,
  Users,
  Bell,
  UserCog,
  KeyRound,
  ChartNoAxesCombined,
  ClipboardCheck,
};

export default function Sidebar({ items, onNavigate, variant = "desktop" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const isDesktop = variant === "desktop";

  const handleLogout = async () => {
    setAccountMenuOpen(false);
    await logout();
    onNavigate?.();
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "flex h-dvh w-64 shrink-0 flex-col border-r border-white/10 bg-sidebar text-sidebar-foreground",
        isDesktop && "fixed inset-y-0 left-0 z-30 hidden lg:flex",
        !isDesktop && "w-full"
      )}
    >
      <div className="border-b border-white/10 px-4 py-3">
        <AssociationBrand
          compact
          subtitle="Member Portal"
          className="text-sidebar-foreground [&_p]:text-sidebar-foreground [&_p:last-child]:text-sidebar-foreground/70"
        />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold leading-none text-white" aria-label={`${item.badge} notifications`}>
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="relative border-t border-white/10 p-3">
        {accountMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 z-50 mb-2 rounded-xl border border-white/10 bg-sidebar p-1.5 shadow-xl">
            <div className="px-3 py-2.5">
              <p className="break-words text-sm font-semibold leading-snug text-white">
                {user?.name || "Member"}
              </p>
              <p className="mt-0.5 break-all text-xs leading-snug text-sidebar-foreground/60">
                {user?.username || user?.memberId || ""}
              </p>
            </div>
            <div className="mx-2 border-t border-white/10" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 text-sidebar-foreground hover:bg-white/10 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Log out</span>
            </Button>
          </div>
        )}
        <button
          type="button"
          aria-label="Open account menu"
          aria-expanded={accountMenuOpen}
          onClick={() => setAccountMenuOpen((open) => !open)}
          className="flex w-full items-center gap-2 rounded-xl bg-white/[0.07] p-2 text-left transition-colors hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-white">
            {getInitials(user?.name || "Member")}
          </div>
          <span className="flex-1 whitespace-normal break-words text-sm font-medium leading-tight text-white">
            {user?.name || "Member"}
          </span>
          <MoreVertical className="h-5 w-5 shrink-0 text-sidebar-foreground" />
        </button>
      </div>
    </aside>
  );
}
