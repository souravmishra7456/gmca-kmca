"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Users,
  Bell,
  UserCog,
  KeyRound,
  ChartNoAxesCombined,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AssociationBrand from "@/components/shared/AssociationBrand";

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
  const isDesktop = variant === "desktop";

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
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="text-xs leading-relaxed text-sidebar-foreground/60">
          Gayatri Mandir Cricket Association<br />
          Kalyan Mandap Cricket Association
        </p>
      </div>
    </aside>
  );
}
