"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants";
import { getDummyPersonalDetails, getDummyPlayerStats } from "@/lib/playerStats";
import { capitalizeRole, getInitials } from "@/lib/utils";

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

export default function PlayerDetailsDialog({ player, onClose }) {
  const hasSavedStatistics = Boolean(player.statistics);
  const stats = player.statistics || getDummyPlayerStats(player);
  const fallbackPersonalDetails = getDummyPersonalDetails(player);
  const hasSavedPersonalDetails = Boolean(player.playerProfile?.dateOfBirth);
  const personalDetails = {
    ...fallbackPersonalDetails,
    ...player.playerProfile,
  };
  const statisticRows = [
    ["Matches", stats.matches], ["Innings", stats.innings], ["Runs", stats.runs],
    ["Balls played", stats.balls], ["Strike rate", stats.strikeRate.toFixed(2)], ["Average", stats.average.toFixed(2)],
    ["Wickets", stats.wickets], ["Economy", stats.economy.toFixed(2)], ["Highest score", stats.highestScore], ["Best figures", stats.bestFigures],
  ];

  useEffect(() => {
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="player-profile-title">
      <button type="button" className="fixed inset-0 bg-black/50" aria-label="Close player profile" onClick={onClose} />
      <section className="relative my-4 w-full max-w-5xl overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xl sm:my-8">
        <header className="flex items-start justify-between border-b p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Avatar className="h-14 w-14 shrink-0 sm:h-16 sm:w-16">
              <AvatarFallback className="text-lg">{getInitials(player.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 id="player-profile-title" className="truncate text-xl font-bold sm:text-2xl">{player.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{player.memberId}</p>
              <Badge variant="secondary" className="mt-2">{ROLE_LABELS[player.role] || capitalizeRole(player.role)}</Badge>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Close player profile">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-xl border bg-muted/30 p-5">
            <h3 className="text-base font-semibold">Personal details</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {hasSavedPersonalDetails ? "Player-provided details" : "Demo data until the player completes their profile"}
            </p>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <Detail label="Date of birth" value={personalDetails.dateOfBirth} />
              <Detail label="Birth place" value={personalDetails.birthPlace} />
              <Detail label="Batting style" value={personalDetails.battingStyle} />
              <Detail label="Bowling style" value={personalDetails.bowlingStyle} />
            </dl>
          </section>

          <section className="overflow-hidden rounded-xl border">
            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
              <h3 className="font-semibold">Career summary</h3>
              <span className="text-xs text-muted-foreground">{hasSavedStatistics ? "Updated statistics" : "Demo data"}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">{player.name} career statistics</caption>
                <tbody>
                  {statisticRows.map(([label, value], index) => (
                    <tr key={label} className={index % 2 ? "bg-muted/30" : ""}>
                      <th scope="row" className="whitespace-nowrap px-4 py-3 text-left font-medium">{label}</th>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
