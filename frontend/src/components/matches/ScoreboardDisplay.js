"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { formatDate } from "@/lib/utils";

const overs = (balls = 0) => `${Math.floor(balls / 6)}.${balls % 6}`;
const economy = (runs, balls) => balls ? (runs / (balls / 6)).toFixed(2) : "0.00";
const strikeRate = (runs, balls) => balls ? ((runs / balls) * 100).toFixed(2) : "0.00";

function ScoreResult({ scorecard, selection }) {
  if (scorecard.status !== "completed" || scorecard.innings.length !== 2) return null;
  const [first, second] = scorecard.innings;
  const message = first.runs === second.runs
    ? "Match tied"
    : first.runs > second.runs
      ? `Team ${first.battingTeam} won by ${first.runs - second.runs} runs`
      : `Team ${second.battingTeam} won by ${Math.max(1, selection.teamSize - 1 - second.wickets)} wickets`;
  return <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-900 sm:px-4 sm:text-sm"><Trophy className="h-4 w-4 shrink-0" /><div className="min-w-0"><p>{message}</p><p className="text-[11px] text-emerald-700 sm:text-xs">Final result</p></div></div>;
}

function BattingSection({ innings, teamMembers }) {
  const batted = new Set(innings.batters.map((row) => row.player.id));
  const didNotBat = teamMembers.filter((player) => !batted.has(player.id));
  return <>
    <div className="overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)_36px_34px_30px_30px_46px] items-center gap-1 border-b bg-slate-50 px-2.5 py-2 text-[10px] font-bold text-slate-500 sm:grid-cols-[minmax(0,1fr)_44px_44px_44px_44px_58px] sm:px-3 sm:text-[11px]">
        <span>Batter</span><span className="text-right">R</span><span className="text-right">B</span><span className="text-right">4s</span><span className="text-right">6s</span><span className="text-right">SR</span>
      </div>
      {innings.batters.map((row) => <div key={row.player.id} className="grid grid-cols-[minmax(0,1fr)_36px_34px_30px_30px_46px] items-center gap-1 border-b border-slate-100 px-2.5 py-2.5 text-xs sm:grid-cols-[minmax(0,1fr)_44px_44px_44px_44px_58px] sm:px-3 sm:text-xs">
        <div className="min-w-0"><p className="break-words font-semibold text-sky-700">{row.player.name}</p><p className="break-words text-[10px] leading-tight text-slate-500 sm:text-[10px]">{row.dismissal}</p></div>
        <span className="text-right font-bold tabular-nums text-slate-800">{row.runs}</span><span className="text-right tabular-nums">{row.balls}</span><span className="text-right tabular-nums">{row.fours}</span><span className="text-right tabular-nums">{row.sixes}</span><span className="text-right tabular-nums">{strikeRate(row.runs, row.balls)}</span>
      </div>)}
    </div>
    <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-slate-100 bg-white px-3 py-2.5 text-[11px] sm:text-xs"><span className="font-semibold text-slate-700">Extras</span><span className="font-semibold tabular-nums">{innings.extras.total} <span className="font-normal text-slate-500">(wd {innings.extras.wides}, nb {innings.extras.noBalls}, b {innings.extras.byes}, lb {innings.extras.legByes})</span></span></div>
    <div className="grid grid-cols-[minmax(0,1fr)_auto] bg-emerald-50 px-3 py-2.5 text-[11px] font-bold text-slate-800 sm:text-xs"><span>Total</span><span className="whitespace-nowrap tabular-nums">{innings.runs}/{innings.wickets} ({overs(innings.legalBalls)} Ov)</span></div>
    {didNotBat.length > 0 && <div className="border-b border-slate-100 px-3 py-2.5 text-[11px] sm:text-xs"><span className="font-semibold text-slate-700">Did not bat: </span><span className="text-slate-600">{didNotBat.map((player) => player.name).join(", ")}</span></div>}
  </>;
}

function BowlingSection({ innings }) {
  return <section className="border-t border-slate-200">
    <h3 className="bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-700 sm:text-xs">Bowling</h3>
    <div className="grid grid-cols-[minmax(0,1fr)_36px_26px_34px_28px_46px] gap-1 border-b bg-slate-50 px-2.5 py-2 text-[10px] font-bold text-slate-500 sm:grid-cols-[minmax(0,1fr)_42px_42px_42px_42px_58px] sm:px-3 sm:text-[11px]"><span>Bowler</span><span className="text-right">O</span><span className="text-right">M</span><span className="text-right">R</span><span className="text-right">W</span><span className="text-right">ECO</span></div>
    {innings.bowlers.map((row) => <div key={row.player.id} className="grid grid-cols-[minmax(0,1fr)_36px_26px_34px_28px_46px] items-center gap-1 border-b border-slate-100 px-2.5 py-2.5 text-xs sm:grid-cols-[minmax(0,1fr)_42px_42px_42px_42px_58px] sm:px-3 sm:text-xs"><span className="break-words font-semibold text-sky-700">{row.player.name}</span><span className="text-right tabular-nums">{overs(row.balls)}</span><span className="text-right tabular-nums">{row.maidens}</span><span className="text-right tabular-nums">{row.runs}</span><span className="text-right tabular-nums">{row.wickets}</span><span className="text-right tabular-nums">{economy(row.runs, row.balls)}</span></div>)}
  </section>;
}

function DesktopInningsCard({ innings, index, teamMembers }) {
  const batted = new Set(innings.batters.map((row) => row.player.id));
  const didNotBat = teamMembers.filter((player) => !batted.has(player.id));
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-3 bg-emerald-800 px-6 py-4 text-white"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">Innings {index + 1}</p><h2 className="mt-1 text-lg font-bold">Team {innings.battingTeam}</h2></div><p className="whitespace-nowrap text-2xl font-black tabular-nums">{innings.runs}/{innings.wickets}<span className="ml-2 text-sm font-medium text-emerald-100">({overs(innings.legalBalls)} overs)</span></p></header>
    <div className="grid gap-8 p-6 xl:grid-cols-2">
      <section><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">Batting</h3><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50 text-xs font-bold text-slate-500"><tr><th className="px-3 py-2.5">Batter</th><th className="px-3 py-2.5 text-right">R</th><th className="px-3 py-2.5 text-right">B</th><th className="px-3 py-2.5 text-right">4s</th><th className="px-3 py-2.5 text-right">6s</th><th className="px-3 py-2.5 text-right">SR</th></tr></thead><tbody>{innings.batters.map((row) => <tr key={row.player.id} className="border-b last:border-0"><td className="px-3 py-3"><p className="font-semibold text-sky-700">{row.player.name}</p><p className="mt-0.5 text-xs text-slate-500">{row.dismissal}</p></td><td className="px-3 py-3 text-right font-bold tabular-nums">{row.runs}</td><td className="px-3 py-3 text-right tabular-nums">{row.balls}</td><td className="px-3 py-3 text-right tabular-nums">{row.fours}</td><td className="px-3 py-3 text-right tabular-nums">{row.sixes}</td><td className="px-3 py-3 text-right tabular-nums">{strikeRate(row.runs, row.balls)}</td></tr>)}</tbody></table></div><div className="mt-3 flex flex-wrap justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs"><span className="font-semibold">Extras</span><span>{innings.extras.total} (wd {innings.extras.wides}, nb {innings.extras.noBalls}, b {innings.extras.byes}, lb {innings.extras.legByes})</span></div>{didNotBat.length > 0 && <p className="mt-3 text-xs leading-relaxed text-slate-600"><span className="font-semibold text-slate-800">Did not bat: </span>{didNotBat.map((player) => player.name).join(", ")}</p>}</section>
      <section><h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">Bowling</h3><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50 text-xs font-bold text-slate-500"><tr><th className="px-3 py-2.5">Bowler</th><th className="px-3 py-2.5 text-right">O</th><th className="px-3 py-2.5 text-right">M</th><th className="px-3 py-2.5 text-right">R</th><th className="px-3 py-2.5 text-right">W</th><th className="px-3 py-2.5 text-right">ECO</th></tr></thead><tbody>{innings.bowlers.map((row) => <tr key={row.player.id} className="border-b last:border-0"><td className="px-3 py-3 font-semibold text-sky-700">{row.player.name}</td><td className="px-3 py-3 text-right tabular-nums">{overs(row.balls)}</td><td className="px-3 py-3 text-right tabular-nums">{row.maidens}</td><td className="px-3 py-3 text-right tabular-nums">{row.runs}</td><td className="px-3 py-3 text-right font-bold tabular-nums">{row.wickets}</td><td className="px-3 py-3 text-right tabular-nums">{economy(row.runs, row.balls)}</td></tr>)}</tbody></table></div></section>
    </div>
  </section>;
}

export default function ScoreboardDisplay({ selection, scorecard, teams, backHref = "/", backLabel = "Home" }) {
  const [activeInnings, setActiveInnings] = useState(Math.max(0, scorecard.innings.length - 1));
  const innings = scorecard.innings[activeInnings];
  const teamMembers = teams[innings.battingTeam] || [];
  return <>
  <div className="mx-auto min-h-screen w-full max-w-[440px] bg-white text-slate-900 shadow-xl md:hidden">
    <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-3 sm:px-4"><Link href={backHref} className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 sm:text-xs"><ArrowLeft className="h-4 w-4" /> {backLabel}</Link><span className="text-right text-[10px] text-slate-500 sm:text-[11px]">{formatDate(selection.matchDate)} · {scorecard.oversLimit} overs</span></div>
    <header className="px-3 pb-2 sm:px-4"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 sm:text-[10px]">Match scoreboard</p><div className="mt-1 flex items-start justify-between gap-2"><h1 className="min-w-0 break-words text-xl font-black leading-tight sm:text-2xl">{selection.title}</h1><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${scorecard.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{scorecard.status === "completed" ? "Completed" : scorecard.status === "innings-break" ? "Innings break" : "Live"}</span></div></header>
    <ScoreResult scorecard={scorecard} selection={selection} />
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-2 pt-2 [scrollbar-width:thin]">{scorecard.innings.map((item, index) => <button key={`${item.battingTeam}-${index}`} onClick={() => setActiveInnings(index)} className={`shrink-0 rounded-t-md px-3 py-2 text-xs font-bold sm:text-xs ${activeInnings === index ? "bg-emerald-700 text-white" : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"}`}>Team {item.battingTeam} (Innings {index + 1})</button>)}</div>
    {innings ? <><div className="flex items-center justify-between gap-3 bg-emerald-700 px-3 py-2.5 text-white sm:px-4"><span className="text-sm font-black sm:text-sm">TEAM {innings.battingTeam}</span><span className="whitespace-nowrap text-sm font-black tabular-nums sm:text-sm">{innings.runs}/{innings.wickets} ({overs(innings.legalBalls)} Ov)</span></div><BattingSection innings={innings} teamMembers={teamMembers} /><BowlingSection innings={innings} /></> : <p className="p-6 text-sm text-slate-500">No innings have been scored yet.</p>}
    <p className="px-3 py-3 text-center text-[10px] text-slate-400 sm:text-[10px]">GMCA · KMCA Match Centre</p>
  </div>
  <div className="hidden min-h-screen w-full bg-slate-100 px-6 py-8 text-slate-900 md:block xl:px-10"><div className="mx-auto max-w-7xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700"><ArrowLeft className="h-4 w-4" />{backLabel}</Link><span className="text-sm text-slate-500">{formatDate(selection.matchDate)} · {scorecard.oversLimit} overs per innings</span></div>
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Match scoreboard</p><h1 className="mt-2 text-4xl font-black tracking-tight">{selection.title}</h1></div><span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${scorecard.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{scorecard.status === "completed" ? "Completed" : scorecard.status === "innings-break" ? "Innings break" : "Live"}</span></header>
    <ScoreResult scorecard={scorecard} selection={selection} />
    <div className="grid gap-4 sm:grid-cols-2">{scorecard.innings.map((item, index) => <div key={`summary-${item.battingTeam}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"><div><p className="text-sm text-slate-500">Team {item.battingTeam} · Innings {index + 1}</p><p className="mt-1 text-2xl font-black tabular-nums">{item.runs}/{item.wickets}</p></div><span className="whitespace-nowrap text-sm text-slate-500">{overs(item.legalBalls)} overs</span></div>)}</div>
    {scorecard.innings.map((item, index) => <DesktopInningsCard key={`${item.battingTeam}-${index}`} innings={item} index={index} teamMembers={teams[item.battingTeam] || []} />)}
    <p className="py-2 text-center text-xs text-slate-400">GMCA · KMCA Match Centre</p>
  </div></div>
  </>;
}
