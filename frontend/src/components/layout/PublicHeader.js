"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { APP_NAME } from "@/lib/constants";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            GK
          </div>
          <div>
            <p className="font-bold leading-tight">{APP_NAME}</p>
            <p className="text-xs text-muted-foreground">Cricket Association</p>
          </div>
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
