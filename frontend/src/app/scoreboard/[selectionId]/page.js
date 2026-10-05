import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScoreboardDisplay from "@/components/matches/ScoreboardDisplay";
import { SITE_URL } from "@/lib/site";

const API_URL = process.env.API_URL || "http://localhost:5000";

async function getPublicScoreboard(selectionId) {
  try {
    const response = await fetch(`${API_URL}/api/intra-match-scorer/${selectionId}/public`, { cache: "no-store" });
    if (!response.ok) return null;
    const result = await response.json();
    return result?.success ? result : null;
  } catch {
    return null;
  }
}

async function getScoreboard(selectionId) {
  return getPublicScoreboard(selectionId);
}

export async function generateMetadata({ params }) {
  const { selectionId } = await params;
  const result = await getPublicScoreboard(selectionId);

  if (!result?.selection) {
    return {
      title: "Scoreboard unavailable",
      description: "This match does not have a published public scorecard yet.",
      robots: { index: false, follow: false },
    };
  }

  const { selection, scorecard } = result;
  const scoreSummary = scorecard?.innings
    ?.map((innings) => `${innings.battingTeam}: ${innings.runs}/${innings.wickets}`)
    .join(" · ");
  const description = [
    `Live and match scorecard for ${selection.title} from GMCA & KMCA in Khordha, Odisha.`,
    scoreSummary,
  ].filter(Boolean).join(" ");

  return {
    title: `${selection.title} Scorecard`,
    description,
    ...(SITE_URL ? { alternates: { canonical: `${SITE_URL}/scoreboard/${encodeURIComponent(selectionId)}` } } : {}),
    openGraph: { title: `${selection.title} Scorecard | GMCA & KMCA`, description },
    twitter: { title: `${selection.title} Scorecard | GMCA & KMCA`, description },
  };
}

export default async function PublicScoreboardPage({ params, searchParams }) {
  const { selectionId } = await params;
  const { from } = await searchParams;
  const returnDestinations = {
    portal: { href: "/portal/team-selection", label: "Team Selection" },
    "team-selection": { href: "/portal/team-selection", label: "Team Selection" },
    dashboard: { href: "/portal/dashboard", label: "Dashboard" },
  };
  const { href: backHref, label: backLabel } = returnDestinations[from] || { href: "/", label: "Home" };
  const result = await getScoreboard(selectionId);
  if (!result?.success) return <main className="mx-auto max-w-xl px-4 py-16 text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Match scoreboard</p><h1 className="mt-2 text-2xl font-bold">Scoreboard unavailable</h1><p className="mt-2 text-sm text-muted-foreground">This match has no published scorecard yet.</p><Button asChild className="mt-5 rounded-xl"><Link href={backHref}><ArrowLeft className="h-4 w-4" />Return to {backLabel}</Link></Button></main>;

  return <main className="min-h-screen bg-slate-100 px-0 py-0 sm:px-6 sm:py-8"><ScoreboardDisplay {...result} backHref={backHref} backLabel={backLabel} /></main>;
}
