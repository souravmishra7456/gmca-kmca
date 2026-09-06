"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/shared/ThemeToggle";
import AssociationBrand from "@/components/shared/AssociationBrand";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="max-w-[calc(100%-8rem)] sm:max-w-none">
          <AssociationBrand compact subtitle="Cricket Association" />
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild>
            <Link href="/login">Member Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
