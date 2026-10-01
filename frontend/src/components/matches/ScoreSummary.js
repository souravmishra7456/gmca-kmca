import { Trophy } from "lucide-react";
import Link from "next/link";

const formatOvers = (balls = 0) => `${Math.floor(balls / 6)}.${balls % 6}`;

export function MatchStatusBadgeText({ match }) {
  if (match?.matchStatus === "completed") return "Completed";
  if (match?.matchStatus === "live" || match?.matchStatus === "innings-break") return "In progress";
  return null;
}

export default function ScoreSummary({ scorecard, compact = false, selectionId, returnToPortal = false }) {
  if (!scorecard?.innings?.length) return null;
  return (
    <div className={`rounded-xl border border-primary/20 bg-primary/[0.035] ${compact ? "p-3" : "p-4"}`}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Trophy className="h-4 w-4 text-primary" />{scorecard.status === "completed" ? "Final score" : "Live score"}</div>
      <div className="grid min-w-0 grid-cols-1 gap-2">
        {scorecard.innings.map((innings, index) => (
          <div key={`${innings.battingTeam}-${index}`} className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-background/80 px-3 py-2 text-sm">
            <span className="shrink-0 whitespace-nowrap text-muted-foreground">Team {innings.battingTeam}{compact ? "" : ` · Innings ${index + 1}`}</span>
            <span className="shrink-0 whitespace-nowrap text-right font-bold tabular-nums text-foreground">{innings.runs}/{innings.wickets}<span className="ml-1.5 text-xs font-normal text-muted-foreground">({formatOvers(innings.legalBalls)} ov)</span></span>
          </div>
        ))}
      </div>
      {scorecard.status === "completed" && scorecard.innings.length === 2 && (
        <p className="mt-2 text-sm font-semibold text-primary">{scorecard.innings[0].runs === scorecard.innings[1].runs ? "Match tied" : scorecard.innings[0].runs > scorecard.innings[1].runs ? `Team ${scorecard.innings[0].battingTeam} won by ${scorecard.innings[0].runs - scorecard.innings[1].runs} runs` : `Team ${scorecard.innings[1].battingTeam} won by ${Math.max(1, (scorecard.teamSize || 2) - 1 - scorecard.innings[1].wickets)} wickets`}</p>
      )}
      {selectionId && <Link href={`/scoreboard/${selectionId}${returnToPortal ? "?from=portal" : ""}`} className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg border border-primary/20 bg-background px-3 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/[0.04]">View scoreboard</Link>}
    </div>
  );
}
