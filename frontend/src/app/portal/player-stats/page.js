"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { playersAPI } from "@/services/api";
import { ROLE_LABELS, ROLES } from "@/lib/constants";
import useAuthStore from "@/store/authStore";

const emptyStats = {
  matches: 0,
  innings: 0,
  runs: 0,
  balls: 0,
  strikeRate: 0,
  average: 0,
  wickets: 0,
  economy: 0,
  highestScore: 0,
  bestFigures: "0/0",
  bestFigureWickets: 0,
  bestFigureRuns: 0,
};

const fields = [
  { name: "matches", label: "Matches", whole: true },
  { name: "innings", label: "Innings", whole: true },
  { name: "runs", label: "Runs", whole: true },
  { name: "balls", label: "Balls played", whole: true },
  { name: "wickets", label: "Wickets", whole: true },
  { name: "economy", label: "Economy", step: "0.01" },
  { name: "highestScore", label: "Highest score", whole: true },
];

const roundToTwoDecimals = (value) => Math.round(value * 100) / 100;
const calculateBattingRates = ({ runs, balls, innings }) => {
  const totalRuns = Number(runs) || 0;
  const ballsPlayed = Number(balls) || 0;
  const totalInnings = Number(innings) || 0;
  return {
    strikeRate: ballsPlayed > 0 ? roundToTwoDecimals((totalRuns / ballsPlayed) * 100) : 0,
    average: totalInnings > 0 ? roundToTwoDecimals(totalRuns / totalInnings) : 0,
  };
};

const parseBestFigures = (value) => {
  const match = /^(\d{1,2})\/(\d{1,3})$/.exec(String(value || ""));
  return match
    ? { bestFigureWickets: Number(match[1]), bestFigureRuns: Number(match[2]) }
    : { bestFigureWickets: 0, bestFigureRuns: 0 };
};

export default function PlayerStatsPage() {
  const { user, loading: sessionLoading } = useAuthStore();
  const [players, setPlayers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const canManageStats = [ROLES.CHAIRMAN, ROLES.DIRECTOR].includes(user?.role);
  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === selectedId),
    [players, selectedId]
  );

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const { data } = await playersAPI.getAll();
        const roleOrder = { [ROLES.CHAIRMAN]: 0, [ROLES.DIRECTOR]: 1, [ROLES.PLAYER]: 2 };
        const playerMembers = (data.players || [])
          .filter((member) => [ROLES.PLAYER, ROLES.CHAIRMAN, ROLES.DIRECTOR].includes(member.role))
          .sort((a, b) => (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9) || a.name.localeCompare(b.name));
        setPlayers(playerMembers);
        if (playerMembers[0]) setSelectedId(playerMembers[0].id);
      } catch (error) {
        setMessage(error.message || "Unable to load players.");
      } finally {
        setLoading(false);
      }
    };

    if (canManageStats) loadPlayers();
    else setLoading(false);
  }, [canManageStats]);

  useEffect(() => {
    if (selectedPlayer) {
      const playerStats = { ...emptyStats, ...selectedPlayer.statistics };
      setStats({ ...playerStats, ...parseBestFigures(playerStats.bestFigures) });
      setMessage("");
    }
  }, [selectedPlayer]);

  const updateValue = (name, value) => {
    setStats((current) => ({ ...current, [name]: value }));
  };

  const validate = () => {
    if (!selectedPlayer) return "Select a player.";
    const parsed = {};

    for (const field of fields) {
      if (stats[field.name] === "") {
        return `${field.label} is required.`;
      }
      const value = Number(stats[field.name]);
      if (!Number.isFinite(value) || value < 0 || (field.whole && !Number.isInteger(value))) {
        return `${field.label} must be a non-negative ${field.whole ? "whole number" : "number"}.`;
      }
      parsed[field.name] = value;
    }

    if (parsed.highestScore > parsed.runs) return "Highest score cannot be greater than total runs.";
    const bestFigureWickets = Number(stats.bestFigureWickets);
    const bestFigureRuns = Number(stats.bestFigureRuns);
    if (!Number.isInteger(bestFigureWickets) || bestFigureWickets < 0 || !Number.isInteger(bestFigureRuns) || bestFigureRuns < 0) {
      return "Best figures must use non-negative whole numbers.";
    }
    if (bestFigureWickets > parsed.wickets) return "Best-figures wickets cannot be greater than total wickets.";

    return {
      ...parsed,
      ...calculateBattingRates(parsed),
      bestFigures: `${bestFigureWickets}/${bestFigureRuns}`,
    };
  };

  const saveStats = async (event) => {
    event.preventDefault();
    setMessage("");
    const validatedStats = validate();
    if (typeof validatedStats === "string") {
      setMessage(validatedStats);
      return;
    }

    setSaving(true);
    try {
      const { data } = await playersAPI.updateStats(selectedPlayer.id, {
        ...validatedStats,
        updatedBy: user.id,
      });
      setStats({ ...data.statistics, ...parseBestFigures(data.statistics.bestFigures) });
      setPlayers((current) => current.map((player) => (
        player.id === selectedPlayer.id ? { ...player, statistics: data.statistics } : player
      )));
      setMessage("Player statistics saved successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to save player statistics.");
    } finally {
      setSaving(false);
    }
  };

  if (sessionLoading) return <LoadingSpinner className="py-20" label="Loading session..." />;
  if (!canManageStats) {
    return <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">Only the chairman and director can manage player statistics.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Manage Player Statistics</h1>
        <p className="mt-1 text-muted-foreground">Enter and maintain official career statistics for players, the chairman, and the director.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Player statistics</CardTitle>
          <CardDescription>Only chairman and director accounts can save these records.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <LoadingSpinner className="py-10" label="Loading members..." /> : players.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">No member accounts are available yet.</p>
          ) : (
            <form className="space-y-6" onSubmit={saveStats}>
              <div className="space-y-2">
                <Label htmlFor="stats-player">Member</Label>
                <select id="stats-player" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name} · {ROLE_LABELS[player.role] || player.role} · {player.memberId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {fields.map((field) => (
                  <div className="space-y-2" key={field.name}>
                    <Label htmlFor={field.name}>{field.label}</Label>
                    <Input id={field.name} type="number" min="0" step={field.step || "1"} value={stats[field.name]} onChange={(event) => updateValue(field.name, event.target.value)} required disabled={saving} />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="strikeRate">Strike rate</Label>
                  <Input id="strikeRate" type="text" value={calculateBattingRates(stats).strikeRate.toFixed(2)} readOnly className="bg-muted" aria-describedby="strike-rate-help" />
                  <p id="strike-rate-help" className="text-xs text-muted-foreground">Calculated from runs and balls played.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="average">Average</Label>
                  <Input id="average" type="text" value={calculateBattingRates(stats).average.toFixed(2)} readOnly className="bg-muted" aria-describedby="average-help" />
                  <p id="average-help" className="text-xs text-muted-foreground">Calculated from runs and innings.</p>
                </div>
                <div className="space-y-2">
                  <Label>Best figures</Label>
                  <div className="flex items-center gap-2">
                    <Input aria-label="Best-figures wickets" type="number" min="0" step="1" value={stats.bestFigureWickets} onChange={(event) => updateValue("bestFigureWickets", event.target.value)} required disabled={saving} />
                    <span className="font-semibold text-muted-foreground">/</span>
                    <Input aria-label="Best-figures runs conceded" type="number" min="0" step="1" value={stats.bestFigureRuns} onChange={(event) => updateValue("bestFigureRuns", event.target.value)} required disabled={saving} />
                  </div>
                  <p className="text-xs text-muted-foreground">Wickets / runs conceded in the player&apos;s best bowling spell.</p>
                </div>
              </div>

              {message && <p className={`rounded-lg px-4 py-3 text-sm ${message.includes("successfully") ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"}`}>{message}</p>}

              <div className="flex justify-end"><Button type="submit" disabled={saving}><Save className="h-4 w-4" />{saving ? "Saving..." : "Save statistics"}</Button></div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
