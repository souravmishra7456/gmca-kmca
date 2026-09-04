"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Users,
  Bell,
  UserCog,
  ChartNoAxesCombined,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

const iconMap = {
  LayoutDashboard,
  User,
  Users,
  Bell,
  UserCog,
  ChartNoAxesCombined,
};

export default function Sidebar({ items, onNavigate, variant = "desktop" }) {
  const pathname = usePathname();
  const isDesktop = variant === "desktop";

  return (
    <aside
      className={cn(
        "flex h-dvh w-64 shrink-0 flex-col border-r border-white/10 bg-sidebar text-sidebar-foreground",
        isDesktop && "fixed inset-y-0 left-0 z-30 hidden lg:flex",
        !isDesktop && "w-full"
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          GK
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">{APP_NAME}</p>
          <p className="text-xs text-sidebar-foreground/70">Member Portal</p>
        </div>
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
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="text-xs text-sidebar-foreground/60">
          Gujarat & Maharashtra Cricket Association
        </p>
      </div>
    </aside>
  );
}
