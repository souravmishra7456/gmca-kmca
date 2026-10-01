import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScoreboardDisplay from "@/components/matches/ScoreboardDisplay";

const API_URL = process.env.API_URL || "http://localhost:5000";

async function getScoreboard(selectionId) {
  try {
    const response = await fetch(`${API_URL}/api/intra-match-scorer/${selectionId}/public`, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default async function PublicScoreboardPage({ params, searchParams }) {
  const { selectionId } = await params;
  const { from } = await searchParams;
  const backHref = from === "portal" ? "/portal/team-selection" : "/";
  const backLabel = from === "portal" ? "Team Selection" : "Home";
  const result = await getScoreboard(selectionId);
  if (!result?.success) return <main className="mx-auto max-w-xl px-4 py-16 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Match scoreboard</p><h1 className="mt-2 text-2xl font-bold">Scoreboard unavailable</h1><p className="mt-2 text-sm text-muted-foreground">This match has no published scorecard yet.</p><Button asChild className="mt-5 rounded-xl"><Link href={backHref}><ArrowLeft className="h-4 w-4" />Return to {backLabel}</Link></Button></main>;

  return <main className="min-h-screen bg-slate-100 px-0 py-0 sm:px-6 sm:py-8"><ScoreboardDisplay {...result} backHref={backHref} backLabel={backLabel} /></main>;
}
