"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, CircleDot, Loader2, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { intraMatchScorerAPI } from "@/services/api";
import { toast } from "sonner";
import useAuthStore from "@/store/authStore";

const memberId = (member) => typeof member === "string" ? member : member?._id || member?.id || "";
const playerName = (member) => typeof member === "string" ? "Player" : member?.name || "Player";
const overText = (balls) => `${Math.floor((balls || 0) / 6)}.${(balls || 0) % 6}`;
const formatRate = (runs, balls) => balls ? ((runs / balls) * 100).toFixed(1) : "0.0";

function PlayerSelect({ label, players, value, onChange, disabled = false }) {
  return <label className="block space-y-1.5 text-sm font-medium">{label}<select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"><option value="">Choose player</option>{players.map((player) => <option key={memberId(player)} value={memberId(player)}>{playerName(player)}</option>)}</select></label>;
}

function InningsScore({ innings, teamName, index }) {
  return <Card className="rounded-2xl"><CardContent className="p-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-muted-foreground">{teamName} · Innings {index + 1}</p><p className="mt-1 text-3xl font-bold tabular-nums">{innings.runs}/{innings.wickets}</p></div><p className="text-sm text-muted-foreground">Overs {overText(innings.legalBalls)}</p></div></CardContent></Card>;
}

export default function MatchScorerPage() {
  const { selectionId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [selection, setSelection] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [oversLimit, setOversLimit] = useState(10);
  const [battingTeam, setBattingTeam] = useState("A");
  const [battingMode, setBattingMode] = useState("standard");
  const [wicketEndMode, setWicketEndMode] = useState("all-out");
  const [opening, setOpening] = useState({ striker: "", nonStriker: "", bowler: "" });
  const [wicketSetup, setWicketSetup] = useState({ dismissal: "bowled", newBatter: "", dismissedPlayer: "" });
  const [nextBowler, setNextBowler] = useState("");
  const [extraRuns, setExtraRuns] = useState(1);
  const [noBallBatRuns, setNoBallBatRuns] = useState(0);
  const [wicketRuns, setWicketRuns] = useState(0);

  const load = useCallback(async () => {
    try {
      const { data } = await intraMatchScorerAPI.get(selectionId);
      setSelection(data.selection);
      setScorecard(data.scorecard);
    } catch (error) {
      toast.error(error.message || "Could not load this intra-match.");
      router.replace("/portal/team-selection");
    } finally { setLoading(false); }
  }, [selectionId, router]);

  useEffect(() => { if (selectionId) load(); }, [selectionId, load]);

  const teams = useMemo(() => ({ A: selection?.teamA || [], B: selection?.teamB || [] }), [selection]);
  const innings = scorecard?.innings?.[scorecard.innings.length - 1];
  const battingPlayers = innings ? teams[innings.battingTeam] : teams[battingTeam];
  const bowlingPlayers = innings ? teams[innings.battingTeam === "A" ? "B" : "A"] : teams[battingTeam === "A" ? "B" : "A"];
  const unusedBatters = innings ? battingPlayers.filter((player) => !innings.batters?.some((row) => memberId(row.player) === memberId(player) && row.dismissed)) : [];
  const currentBattingTeam = (team) => team === "A" ? "Team A" : "Team B";
  const inningsWicketLimit = innings ? scorecard.wicketEndMode === "second-last" ? Math.max(1, teams[innings.battingTeam].length - 2) : teams[innings.battingTeam].length - 1 : 0;

  const perform = async (operation) => {
    setBusy(true);
    try { const response = await operation(); if (response?.data?.scorecard) setScorecard(response.data.scorecard); else await load(); return true; }
    catch (error) { toast.error(error.message || "Unable to update this scorecard."); return false; }
    finally { setBusy(false); }
  };

  const start = async (event) => {
    event.preventDefault();
    await perform(() => intraMatchScorerAPI.start(selectionId, { oversLimit: Number(oversLimit), battingTeam, battingMode, wicketEndMode, ...opening }));
  };
  const addBall = (data) => perform(() => intraMatchScorerAPI.recordDelivery(selectionId, data));
  const addWicket = () => addBall({ batterRuns: Number(wicketRuns), extra: "none", extraRuns: 0, wicket: true, ...wicketSetup, dismissedPlayer: wicketSetup.dismissedPlayer || memberId(innings.striker) });

  if (loading) return <LoadingSpinner label="Loading match scorer..." />;
  if (!selection) return null;
  if (!["chairman", "director"].includes(user?.role)) return <div className="mx-auto max-w-xl py-16 text-center"><h1 className="text-2xl font-bold">Scorer access is restricted</h1><p className="mt-2 text-muted-foreground">Only association management can operate the match scorer.</p><Button asChild className="mt-5 rounded-xl"><Link href="/portal/team-selection">Return to Team Selection</Link></Button></div>;

  const initialTeam = battingTeam === "A" ? teams.A : teams.B;
  const initialFielding = battingTeam === "A" ? teams.B : teams.A;
  const needsSecondInnings = scorecard?.status === "innings-break";
  const needsBowler = scorecard?.status === "live" && innings?.awaitingNextBowler;
  const matchResult = scorecard?.innings?.length === 2 ? scorecard.innings[0].runs === scorecard.innings[1].runs ? "Match tied" : scorecard.innings[0].runs > scorecard.innings[1].runs ? `${currentBattingTeam(scorecard.innings[0].battingTeam)} won by ${scorecard.innings[0].runs - scorecard.innings[1].runs} runs` : `${currentBattingTeam(scorecard.innings[1].battingTeam)} won by ${Math.max(1, selection.teamSize - 1 - scorecard.innings[1].wickets)} wickets` : "";

  return <div className="mx-auto max-w-5xl space-y-6 pb-12">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><Button asChild variant="ghost" className="mb-2 -ml-3 rounded-xl"><Link href="/portal/team-selection"><ArrowLeft className="h-4 w-4" />Team Selection</Link></Button><p className="text-sm font-medium text-primary">Intra-match scoring</p><h1 className="mt-1 text-3xl font-bold tracking-tight">{selection.title}</h1><p className="mt-1 text-sm text-muted-foreground">Two innings · Live scorecard · Stats update at finalization</p></div>
      {scorecard && <Badge variant={scorecard.status === "completed" ? "secondary" : "outline"} className="rounded-full px-3 py-1.5">{scorecard.status === "completed" ? "Completed" : scorecard.status === "innings-break" ? "Innings break" : "Live"}</Badge>}
    </div>

    {!scorecard && <Card className="rounded-2xl"><CardHeader><CardTitle>Set up the match</CardTitle></CardHeader><CardContent><form className="space-y-5" onSubmit={start}><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium">Overs per innings<input type="number" min="1" max="50" value={oversLimit} onChange={(event) => setOversLimit(event.target.value)} className="h-11 w-full rounded-xl border border-input bg-background px-3" /></label><label className="space-y-1.5 text-sm font-medium">Batting first<select value={battingTeam} onChange={(event) => { setBattingTeam(event.target.value); setOpening({ striker: "", nonStriker: "", bowler: "" }); }} className="h-11 w-full rounded-xl border border-input bg-background px-3"><option value="A">Team A</option><option value="B">Team B</option></select></label></div><label className="block max-w-xl space-y-1.5 text-sm font-medium">Batting rotation<select value={battingMode} onChange={(event) => setBattingMode(event.target.value)} className="h-11 w-full rounded-xl border border-input bg-background px-3"><option value="standard">Standard — rotate on odd runs and at the end of each over</option><option value="fixed">Stay on strike — batter keeps strike until dismissed</option><option value="over">Change strike after each over — singles do not change strike</option></select></label><p className="-mt-3 text-xs text-muted-foreground">This setting applies to both innings. Runs are always credited to the batter who faced the ball.</p><label className="block max-w-xl space-y-1.5 text-sm font-medium">End innings at<select value={wicketEndMode} onChange={(event) => setWicketEndMode(event.target.value)} className="h-11 w-full rounded-xl border border-input bg-background px-3"><option value="all-out">All out — end when the last available wicket falls</option><option value="second-last">Second-last wicket — end when one wicket remains</option></select></label><p className="-mt-3 text-xs text-muted-foreground">This setting applies to both innings.</p><div className="grid gap-4 sm:grid-cols-3"><PlayerSelect label="Opening striker" players={initialTeam} value={opening.striker} onChange={(striker) => setOpening((value) => ({ ...value, striker }))} /><PlayerSelect label="Non-striker" players={initialTeam} value={opening.nonStriker} onChange={(nonStriker) => setOpening((value) => ({ ...value, nonStriker }))} /><PlayerSelect label="Opening bowler" players={initialFielding} value={opening.bowler} onChange={(bowler) => setOpening((value) => ({ ...value, bowler }))} /></div><Button type="submit" disabled={busy || !opening.striker || !opening.nonStriker || !opening.bowler} className="rounded-xl">{busy && <Loader2 className="h-4 w-4 animate-spin" />}Start Scoring</Button></form></CardContent></Card>}

    {scorecard && <><div className="grid gap-3 sm:grid-cols-2">{scorecard.innings.map((item, index) => <InningsScore key={index} innings={item} index={index} teamName={currentBattingTeam(item.battingTeam)} />)}</div>

    {needsSecondInnings && <Card className="rounded-2xl border-primary/20"><CardHeader><CardTitle>Start the chase</CardTitle></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-3"><PlayerSelect label="Opening striker" players={teams[scorecard.innings[0].battingTeam === "A" ? "B" : "A"]} value={opening.striker} onChange={(striker) => setOpening((value) => ({ ...value, striker }))} /><PlayerSelect label="Non-striker" players={teams[scorecard.innings[0].battingTeam === "A" ? "B" : "A"]} value={opening.nonStriker} onChange={(nonStriker) => setOpening((value) => ({ ...value, nonStriker }))} /><PlayerSelect label="Opening bowler" players={teams[scorecard.innings[0].battingTeam]} value={opening.bowler} onChange={(bowler) => setOpening((value) => ({ ...value, bowler }))} /></div><div className="mt-4 flex flex-wrap gap-2"><Button disabled={busy || !opening.striker || !opening.nonStriker || !opening.bowler} className="rounded-xl" onClick={() => perform(() => intraMatchScorerAPI.startSecondInnings(selectionId, opening))}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Start Second Innings</Button><Button variant="outline" disabled={busy || !innings.deliveries?.length} className="rounded-xl" onClick={() => perform(() => intraMatchScorerAPI.undoLastDelivery(selectionId))}><RotateCcw className="h-4 w-4" />Undo last ball</Button></div></CardContent></Card>}

    {scorecard.status === "live" && <>
      <Card className="overflow-hidden rounded-2xl border-primary/25"><CardHeader className="bg-primary/[0.04]"><CardTitle className="flex items-center gap-2"><CircleDot className="h-5 w-5 text-primary" />{currentBattingTeam(innings.battingTeam)}: {innings.runs}/{innings.wickets}<span className="ml-auto text-base font-medium text-muted-foreground">{overText(innings.legalBalls)} / {scorecard.oversLimit} ov</span></CardTitle></CardHeader><CardContent className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">Striker</p><p className="mt-1 font-semibold">{playerName(innings.striker)}</p></div><div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">Non-striker</p><p className="mt-1 font-semibold">{playerName(innings.nonStriker)}</p></div><div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">Bowler</p><p className="mt-1 font-semibold">{playerName(innings.currentBowler)}</p></div></div>
        {needsBowler ? <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-4 sm:flex-row sm:items-end"><PlayerSelect label="Next over bowler" players={bowlingPlayers} value={nextBowler} onChange={setNextBowler} /><Button disabled={busy || !nextBowler} onClick={() => perform(() => intraMatchScorerAPI.changeBowler(selectionId, { bowler: nextBowler }))} className="rounded-xl">Set Bowler</Button></div> : <>
          <div><p className="mb-2 text-sm font-semibold">Runs off the bat</p><div className="grid grid-cols-4 gap-2 sm:grid-cols-7">{[0, 1, 2, 3, 4, 5, 6].map((runs) => <Button key={runs} disabled={busy} variant={runs === 4 || runs === 6 ? "default" : "outline"} className="h-12 rounded-xl text-lg font-bold" onClick={() => addBall({ batterRuns: runs, extra: "none", extraRuns: 0 })}>{runs}</Button>)}</div></div>
          <div><p className="mb-2 text-sm font-semibold">Extras</p><div className="mb-2 grid max-w-lg gap-2 sm:grid-cols-2"><label className="space-y-1 text-xs font-medium text-muted-foreground">Extra runs<input type="number" min="1" max="6" value={extraRuns} onChange={(event) => setExtraRuns(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground" /></label><label className="space-y-1 text-xs font-medium text-muted-foreground">Batter runs on a no-ball<input type="number" min="0" max="6" value={noBallBatRuns} onChange={(event) => setNoBallBatRuns(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground" /></label></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[["wide", "Wide"], ["no-ball", "No-ball"], ["bye", "Bye"], ["leg-bye", "Leg-bye"]].map(([extra, label]) => <Button key={extra} disabled={busy || !Number.isInteger(Number(extraRuns)) || Number(extraRuns) < 1 || Number(extraRuns) > 6 || (extra === "no-ball" && (!Number.isInteger(Number(noBallBatRuns)) || Number(noBallBatRuns) < 0 || Number(noBallBatRuns) > 6))} variant="outline" className="h-11 rounded-xl" onClick={() => addBall({ batterRuns: extra === "no-ball" ? Number(noBallBatRuns) : 0, extra, extraRuns: Number(extraRuns) })}>{label} +{extraRuns}{extra === "no-ball" && Number(noBallBatRuns) > 0 ? ` + ${noBallBatRuns} bat` : ""}</Button>)}</div></div>
          <div className="grid gap-3 rounded-xl border border-destructive/20 bg-destructive/[0.025] p-4 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]"><label className="space-y-1.5 text-sm font-medium">Dismissal<select value={wicketSetup.dismissal} onChange={(event) => setWicketSetup((value) => ({ ...value, dismissal: event.target.value, dismissedPlayer: "" }))} className="h-10 w-full rounded-lg border border-input bg-background px-2"><option value="bowled">Bowled</option><option value="caught">Caught</option><option value="lbw">LBW</option><option value="stumped">Stumped</option><option value="run-out">Run out</option><option value="other">Other</option></select></label><PlayerSelect label="Batter out" players={[innings.striker, innings.nonStriker]} value={wicketSetup.dismissedPlayer || memberId(innings.striker)} onChange={(dismissedPlayer) => setWicketSetup((value) => ({ ...value, dismissedPlayer }))} /><PlayerSelect label="Incoming batter" players={unusedBatters.filter((player) => ![memberId(innings.striker), memberId(innings.nonStriker)].includes(memberId(player)))} value={wicketSetup.newBatter} onChange={(newBatter) => setWicketSetup((value) => ({ ...value, newBatter }))} /><label className="space-y-1.5 text-sm font-medium">Runs on wicket<select value={wicketRuns} onChange={(event) => setWicketRuns(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-2">{[0,1,2,3].map((runs) => <option key={runs} value={runs}>{runs}</option>)}</select></label><Button variant="destructive" disabled={busy || (innings.wickets + 1 < inningsWicketLimit && !wicketSetup.newBatter)} className="self-end rounded-xl" onClick={addWicket}>Record Wicket</Button></div>
        </>}
        <div className="flex flex-wrap gap-3 border-t pt-4"><Button variant="outline" disabled={busy || !innings.deliveries?.length} className="rounded-xl" onClick={() => perform(() => intraMatchScorerAPI.undoLastDelivery(selectionId))}><RotateCcw className="h-4 w-4" />Undo last ball</Button><span className="self-center text-xs text-muted-foreground">Undo is available until the match is finalized.</span></div>
      </CardContent></Card>
    </>}

    {scorecard.status === "completed" && <Card className="rounded-2xl"><CardContent className="p-5"><div className="flex items-center gap-3"><Trophy className="h-6 w-6 text-primary" /><div><h2 className="text-lg font-bold">{matchResult}</h2><p className="text-sm text-muted-foreground">{scorecard.statsApplied ? "Player career statistics have been updated." : "Review the final score, then update player career statistics."}</p></div></div>{!scorecard.statsApplied && <div className="mt-4 flex flex-wrap gap-2"><Button disabled={busy} className="rounded-xl" onClick={() => perform(() => intraMatchScorerAPI.finalize(selectionId))}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Finalize match and update stats</Button><Button variant="outline" disabled={busy || !innings.deliveries?.length} className="rounded-xl" onClick={() => perform(() => intraMatchScorerAPI.undoLastDelivery(selectionId))}><RotateCcw className="h-4 w-4" />Undo last ball</Button></div>}</CardContent></Card>}

    <Card className="rounded-2xl"><CardHeader><CardTitle>Scorecard details</CardTitle></CardHeader><CardContent className="space-y-6">{scorecard.innings.map((item, index) => <section key={index}><div className="mb-2 flex justify-between gap-3"><h3 className="font-semibold">{currentBattingTeam(item.battingTeam)} batting</h3><span className="text-sm text-muted-foreground">{item.runs}/{item.wickets} ({overText(item.legalBalls)} ov)</span></div><div className="overflow-x-auto"><table className="w-full min-w-[420px] text-left text-sm"><thead className="border-b text-xs text-muted-foreground"><tr><th className="py-2">Batter</th><th className="py-2 text-right">R</th><th className="py-2 text-right">B</th><th className="py-2 text-right">4s</th><th className="py-2 text-right">6s</th><th className="py-2 text-right">SR</th></tr></thead><tbody>{item.batters.map((row) => <tr key={memberId(row.player)} className="border-b last:border-0"><td className="py-2.5 font-medium">{playerName(row.player)}{row.dismissed ? <span className="ml-1 text-xs text-muted-foreground">out</span> : ""}</td><td className="py-2.5 text-right tabular-nums">{row.runs}</td><td className="py-2.5 text-right tabular-nums">{row.balls}</td><td className="py-2.5 text-right tabular-nums">{row.fours}</td><td className="py-2.5 text-right tabular-nums">{row.sixes}</td><td className="py-2.5 text-right tabular-nums">{formatRate(row.runs, row.balls)}</td></tr>)}</tbody></table></div><h4 className="mb-2 mt-4 text-sm font-semibold">Bowling</h4><div className="overflow-x-auto"><table className="w-full min-w-[400px] text-left text-sm"><thead className="border-b text-xs text-muted-foreground"><tr><th className="py-2">Bowler</th><th className="py-2 text-right">O</th><th className="py-2 text-right">R</th><th className="py-2 text-right">W</th></tr></thead><tbody>{item.bowlers.map((row) => <tr key={memberId(row.player)} className="border-b last:border-0"><td className="py-2.5 font-medium">{playerName(row.player)}</td><td className="py-2.5 text-right">{overText(row.balls)}</td><td className="py-2.5 text-right">{row.runs}</td><td className="py-2.5 text-right">{row.wickets}</td></tr>)}</tbody></table></div></section>)}</CardContent></Card>
    </>}
  </div>;
}
