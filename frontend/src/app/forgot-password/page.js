"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { authAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PublicHeader from "@/components/layout/PublicHeader";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!identifier.trim()) {
      setError("Enter your username or member ID");
      return;
    }

    setSubmitting(true);
    try {
      const value = identifier.trim();
      await authAPI.requestPasswordReset({
        username: value.toUpperCase().startsWith("GMCA") ? undefined : value,
        memberId: value.toUpperCase().startsWith("GMCA") ? value : undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Could not send the reset request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground"><KeyRound className="h-6 w-6" /></div>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>Send a request to the chairman, who will provide a temporary password after approval.</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-300"><p className="font-medium">Your request has been sent.</p><p className="mt-2">Contact the chairman for your temporary password. After signing in with it, you will be asked to choose a new password.</p></div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="identifier">Username or Member ID</Label><Input id="identifier" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="name@gmca-kmca.com or GMCA123ABC" autoComplete="username" disabled={submitting} /></div>
                {error && <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
                <Button type="submit" className="w-full" disabled={submitting}>{submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</> : "Send Reset Request"}</Button>
              </form>
            )}
            <p className="mt-5 text-center text-sm text-muted-foreground"><Link href="/login" className="font-medium text-primary hover:underline">Back to sign in</Link></p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
