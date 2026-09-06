"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/layout/Sidebar";
import ThemeToggle from "@/components/shared/ThemeToggle";
import AssociationBrand from "@/components/shared/AssociationBrand";
import { capitalizeRole } from "@/lib/utils";
import useAuthStore from "@/store/authStore";

export default function Navbar({ navItems }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <Sidebar
              items={navItems}
              variant="mobile"
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <Link href="/portal/dashboard" className="lg:hidden">
          <AssociationBrand compact subtitle={null} />
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />

        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">{user?.name}</p>
          <Badge variant="secondary" className="mt-0.5">
            {capitalizeRole(user?.role)}
          </Badge>
        </div>

        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
