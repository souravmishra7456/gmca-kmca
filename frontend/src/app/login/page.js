"use client";

import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import PublicHeader from "@/components/layout/PublicHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Suspense fallback={<LoadingSpinner label="Loading..." />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
