"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, KeyRound, Loader2 } from "lucide-react";
import { authAPI } from "@/services/api";
import { ROLES } from "@/lib/constants";
import useAuthStore from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PasswordRequestsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState("");
  const [error, setError] = useState("");
  const [approved, setApproved] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (user && user.role !== ROLES.CHAIRMAN) router.replace("/portal/dashboard"); }, [router, user]);
  useEffect(() => {
    const load = async () => {
      try { const { data } = await authAPI.getPasswordResetRequests(); setRequests(data.requests || []); }
      catch (err) { setError(err.message || "Could not load password reset requests"); }
      finally { setLoading(false); }
    };
    if (user?.role === ROLES.CHAIRMAN) load();
  }, [user]);

  const approve = async (requestId) => {
    setError(""); setApproved(null); setCopied(false); setApprovingId(requestId);
    try {
      const { data } = await authAPI.approvePasswordReset(requestId);
      setRequests((current) => current.filter((request) => request.id !== requestId));
      setApproved({ ...data.member, tempPassword: data.tempPassword });
    } catch (err) { setError(err.message || "Could not approve this request"); }
    finally { setApprovingId(""); }
  };
  const copyCredentials = async () => {
    if (!approved) return;
    await navigator.clipboard.writeText(`Name: ${approved.name}\nUsername: ${approved.username}\nTemporary Password: ${approved.tempPassword}`);
    setCopied(true);
  };
  if (!user || user.role !== ROLES.CHAIRMAN) return null;

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold sm:text-3xl">Password Reset Requests</h1><p className="mt-1 text-muted-foreground">Approve a member’s request to create a temporary password.</p></div>
    {error && <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
    {approved && <Card className="border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20"><CardHeader><CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300"><CheckCircle2 className="h-5 w-5" />Temporary Password Generated</CardTitle><CardDescription>Shown only now. Share it securely with {approved.name}; they must change it after signing in.</CardDescription></CardHeader><CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="grid gap-2 text-sm"><span><strong>Username:</strong> {approved.username}</span><span className="font-mono text-base font-bold"><strong>Temporary password:</strong> {approved.tempPassword}</span></div><Button variant="outline" onClick={copyCredentials}><Copy className="h-4 w-4" />{copied ? "Copied" : "Copy Credentials"}</Button></CardContent></Card>}
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" />Pending Requests</CardTitle><CardDescription>Approving a request immediately invalidates the member’s previous password.</CardDescription></CardHeader><CardContent>
      {loading ? <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading requests...</div> : requests.length === 0 ? <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No pending password reset requests.</div> : <div className="divide-y overflow-hidden rounded-lg border">{requests.map((request) => <div key={request.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{request.member.name}</p><p className="text-sm text-muted-foreground">{request.member.username} · {request.member.memberId}</p><p className="mt-1 text-xs text-muted-foreground">Requested {new Date(request.requestedAt).toLocaleString()}</p></div><div className="flex items-center gap-3"><Badge variant="secondary">Pending</Badge><Button onClick={() => approve(request.id)} disabled={Boolean(approvingId)}>{approvingId === request.id ? <><Loader2 className="h-4 w-4 animate-spin" />Approving...</> : "Approve & Generate"}</Button></div></div>)}</div>}
    </CardContent></Card>
  </div>;
}
