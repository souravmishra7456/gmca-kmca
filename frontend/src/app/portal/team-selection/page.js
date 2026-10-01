"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Check, ClipboardList, Loader2, Send, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ScoreSummary, { MatchStatusBadgeText } from "@/components/matches/ScoreSummary";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import { playersAPI, teamSelectionsAPI } from "@/services/api";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";
import { getMemberAssignments, isMatchOver, sortSelections } from "@/lib/teamSelections";

const initialForm = {
  title: "",
  matchDate: "",
  type: "match",
  teamSize: 6,
  playingXI: [],
  substitutes: [],
  captain: "",
  teamA: [],
  teamB: [],
  teamACaptain: "",
  teamBCaptain: "",
};

const canManageSelection = (role) => ["chairman", "director"].includes(role);

function MemberAvatar({ name, selected = false }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${selected
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
        }`}
    >
      {initials}
    </span>
  );
}

function MemberPicker({
  members,
  selectedIds,
  onToggle,
  title,
  maxSelections,
  blockedIds = [],
}) {
  const atLimit = selectedIds.length >= maxSelections;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="flex items-center justify-between border-b bg-muted/[0.18] px-4 py-3.5">
        <div>
          <h3 className="font-semibold tracking-tight">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {selectedIds.length === maxSelections
              ? "Selection complete"
              : `${maxSelections - selectedIds.length} spot${maxSelections - selectedIds.length === 1 ? "" : "s"
              } remaining`}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${selectedIds.length === maxSelections
              ? "bg-primary text-primary-foreground"
              : "border bg-background text-muted-foreground"
            }`}
        >
          {selectedIds.length}/{maxSelections}
        </span>
      </div>

      <div className="grid gap-2 p-3 sm:grid-cols-2">
        {members.map((member) => {
          const selected = selectedIds.includes(member.id);
          const blocked = blockedIds.includes(member.id);
          const disabled = blocked || (!selected && atLimit);

          return (
            <label
              key={member.id}
              className={`flex min-h-[58px] items-center gap-3 rounded-xl border px-3 transition-all ${selected
                  ? "border-primary/40 bg-primary/[0.07] shadow-sm"
                  : disabled
                    ? "cursor-not-allowed border-border/50 bg-muted/20 opacity-40"
                    : "cursor-pointer border-border/70 bg-background hover:-translate-y-px hover:border-primary/35 hover:bg-primary/[0.025]"
                }`}
            >
              <input
                type="checkbox"
                checked={selected}
                disabled={disabled}
                onChange={() => onToggle(member.id)}
                className="sr-only"
              />
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background"
                  }`}
              >
                {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              <MemberAvatar name={member.name} selected={selected} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {member.name}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function MemberList({ members, emptyLabel, captainId }) {
  if (!members?.length) {
    return (
      <div className="rounded-xl border border-dashed px-3 py-4 text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {members.map((member, index) => (
        <li
          key={member.id}
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-background px-3 py-2.5"
        >
          <span className="w-5 text-center text-xs font-semibold text-muted-foreground">
            {index + 1}
          </span>
          <MemberAvatar name={member.name} />
          <span className="min-w-0 flex-1 whitespace-normal break-words text-sm font-medium">
            {member.name}{member.id === captainId ? " (C)" : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CaptainSelect({ id, label, members, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
      >
        <option value="">Select captain</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function SelectionCard({ selection, canDelete, deleting, onDelete }) {
  const intraMatch = selection.type === "intra";
  const matchOver = isMatchOver(selection);

  return (
    <Card className="group overflow-hidden rounded-2xl border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="border-b bg-muted/[0.12] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge
                className={`rounded-full ${intraMatch
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                  }`}
              >
                {intraMatch ? "Intra Match" : "Match Squad"}
              </Badge>
              <span className="text-xs font-medium text-muted-foreground">
                {formatDate(selection.matchDate)}
              </span>
              <Badge variant={matchOver || selection.matchStatus === "live" ? "secondary" : "outline"} className="rounded-full">
                {MatchStatusBadgeText({ match: selection }) || (matchOver ? "Match over" : "Upcoming")}
              </Badge>
            </div>
            <CardTitle className="truncate text-xl tracking-tight">
              {selection.title}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Announced by {selection.selectedBy || "association management"}
            </p>
          </div>

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-lg opacity-70 transition-opacity hover:bg-destructive/10 hover:opacity-100"
              onClick={() => onDelete(selection.id)}
              disabled={deleting}
              aria-label={`Delete ${selection.title}`}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 text-destructive" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {intraMatch && selection.matchStatus === "completed" ? (
          <ScoreSummary scorecard={selection.scorecard} selectionId={selection.id} compact returnToPortal />
        ) : intraMatch ? (
          <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                label: "Team A",
                captainId: selection.teamACaptain?.id,
                members: selection.teamA,
              },
              {
                label: "Team B",
                captainId: selection.teamBCaptain?.id,
                members: selection.teamB,
              },
            ].map((team) => (
              <div
                key={team.label}
                className="rounded-2xl border border-border/70 bg-muted/[0.12] p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">{team.label}</h3>
                  <span className="rounded-full border bg-background px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                    {team.members?.length || 0} players
                  </span>
                </div>
                <MemberList
                  members={team.members}
                  emptyLabel="No players selected"
                  captainId={team.captainId}
                />
              </div>
            ))}
          </div>
          <ScoreSummary scorecard={selection.scorecard} selectionId={selection.id} compact returnToPortal />
          {canDelete && <Button asChild variant="outline" className="rounded-xl"><Link href={`/portal/match-scorer/${selection.id}`}><ClipboardList className="h-4 w-4" />Open Match Scorer</Link></Button>}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-muted/[0.12] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Playing XI</h3>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary">
                  {selection.playingXI?.length || 0}/11
                </span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Captain:{" "}
                <span className="font-medium text-foreground">
                  {selection.captain?.name || "Not assigned"}
                </span>
              </p>
              <MemberList
                members={selection.playingXI}
                emptyLabel="No players selected"
              />
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/[0.12] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Substitutes</h3>
                <span className="rounded-full border bg-background px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                  {selection.substitutes?.length || 0}
                </span>
              </div>
              <MemberList
                members={selection.substitutes}
                emptyLabel="No substitutes selected"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


export default function TeamSelectionPage() {
  const { user } = useAuthStore();
  const [members, setMembers] = useState([]);
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [playersResponse, selectionsResponse] = await Promise.all([
          playersAPI.getAll(),
          teamSelectionsAPI.getAll(),
        ]);
        setMembers((playersResponse.data.players || []).filter((player) => player.status === "active"));
        setSelections(selectionsResponse.data.selections || []);
      } catch (requestError) {
        setMembers([]);
        setSelections([]);
        toast.error(requestError.message || "Unable to load team selections.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const updateMembers = (field, memberId, maxSelections) => {
    setForm((current) => {
      const selected = current[field];
      const next = selected.includes(memberId)
        ? selected.filter((id) => id !== memberId)
        : selected.length < maxSelections
          ? [...selected, memberId]
          : selected;
      const captainField = {
        playingXI: "captain",
        teamA: "teamACaptain",
        teamB: "teamBCaptain",
      }[field];
      return {
        ...current,
        [field]: next,
        ...(captainField && !next.includes(current[captainField]) ? { [captainField]: "" } : {}),
      };
    });
  };

  const requestDeleteSelection = (selectionId) => {
    const selection = selections.find((item) => item.id === selectionId);
    if (selection) setPendingDelete(selection);
  };

  const deleteSelection = async () => {
    if (!pendingDelete) return;
    const selection = pendingDelete;
    setDeletingId(selection.id);
    try {
      await teamSelectionsAPI.delete(selection.id);
      setSelections((current) => current.filter((item) => item.id !== selection.id));
      setPendingDelete(null);
      toast.success("Team selection deleted.");
    } catch (requestError) {
      toast.error(requestError.message || "Unable to delete this team selection.");
    } finally {
      setDeletingId(null);
    }
  };

  const submitSelection = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const { data } = await teamSelectionsAPI.create({
        ...form,
        teamSize: Number(form.teamSize),
      });
      setSelections((current) => [data.selection, ...current]);
      setForm(initialForm);
      setShowComposer(false);
      toast.success("Team selection announced.");
    } catch (requestError) {
      toast.error(requestError.message || "Unable to announce this selection.");
    } finally {
      setSubmitting(false);
    }
  };

  const manager = canManageSelection(user?.role);
  const intraMatch = form.type === "intra";
  const teamSize = Math.max(2, Number(form.teamSize) || 2);
  const orderedSelections = sortSelections(selections);
  const myMatches = orderedSelections
    .map((selection) => ({ ...selection, assignments: getMemberAssignments(selection, user?.id) }))
    .filter((selection) => selection.assignments.length > 0);
  const upcomingMyMatches = myMatches.filter((selection) => !isMatchOver(selection));
  const completedMyMatches = myMatches.filter((selection) => isMatchOver(selection));
  const upcomingSelections = orderedSelections.filter((selection) => !isMatchOver(selection));
  const completedSelections = orderedSelections.filter((selection) => isMatchOver(selection));

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Users className="h-4 w-4" />
            Match Management
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Team Selection
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Build squads, select captains, and announce teams to the association.
          </p>
        </div>

        {manager && (
          <Button
            onClick={() => setShowComposer((isOpen) => !isOpen)}
            className="h-11 rounded-xl px-5 font-semibold shadow-sm"
          >
            <Users className="h-4 w-4" />
            {showComposer ? "Close Selection" : "Announce Team"}
          </Button>
        )}
      </div>

      {myMatches.length > 0 && (
        <Card className="overflow-hidden rounded-2xl border-primary/20 shadow-sm">
          <CardHeader className="border-b bg-primary/[0.04] px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Your match schedule</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  You are selected for {myMatches.length} {myMatches.length === 1 ? "match" : "matches"} total, ordered by date.
                </p>
              </div>
              <span className="rounded-full border bg-background px-3 py-1.5 text-xs font-semibold">
                {upcomingMyMatches.length} upcoming · {completedMyMatches.length} completed
              </span>
            </div>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {upcomingMyMatches.map((selection) => (
              <div key={selection.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <p className="font-semibold">{selection.title}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4 text-primary" />{formatDate(selection.matchDate)} · {selection.type === "intra" ? "Intra match" : "Match squad"}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selection.assignments.map((assignment) => <Badge key={assignment} variant="outline">{assignment}</Badge>)}
                </div>
              </div>
            ))}
            {completedMyMatches.map((selection) => (
              <div key={selection.id} className="flex flex-col gap-2 bg-muted/20 px-5 py-4 text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{selection.title}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm"><CalendarDays className="h-4 w-4" />{formatDate(selection.matchDate)} · {selection.type === "intra" ? "Intra match" : "Match squad"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary">Match over</Badge>
                  {selection.assignments.map((assignment) => <Badge key={assignment} variant="outline">{assignment}</Badge>)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Composer */}
      {manager && showComposer && (
        <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="border-b bg-muted/[0.15] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Create team selection</CardTitle>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Choose a standard playing squad or split the members into two
                  internal teams.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <form onSubmit={submitSelection} className="space-y-7">
              {/* Match details */}
              <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
                <div className="space-y-2">
                  <Label htmlFor="selection-title" className="text-sm font-semibold">
                    Match title
                  </Label>
                  <Input
                    id="selection-title"
                    value={form.title}
                    onChange={(event) =>
                      setForm({ ...form, title: event.target.value })
                    }
                    placeholder="e.g. Sunday practice match"
                    required
                    className="h-11 rounded-xl shadow-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="selection-date" className="text-sm font-semibold">
                    Match date
                  </Label>
                  <Input
                    id="selection-date"
                    type="date"
                    value={form.matchDate}
                    onChange={(event) =>
                      setForm({ ...form, matchDate: event.target.value })
                    }
                    required
                    className="h-11 rounded-xl shadow-none"
                  />
                </div>
              </div>

              {/* Selection type */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-semibold">Selection format</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Decide how the players will be divided for this announcement.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    ["match", "Match squad", "Playing XI + substitutes"],
                    ["intra", "Intra match", "Two internal teams"],
                  ].map(([type, label, description]) => {
                    const active = form.type === type;

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({ ...form, type })}
                        className={`flex min-h-[78px] items-center gap-4 rounded-2xl border p-4 text-left transition-all ${active
                            ? "border-primary bg-primary/[0.07] shadow-sm"
                            : "border-border/70 hover:border-primary/35 hover:bg-muted/[0.25]"
                          }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                            }`}
                        >
                          <Users className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold">{label}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {description}
                          </span>
                        </span>
                        {active && (
                          <Check className="ml-auto h-5 w-5 shrink-0 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {intraMatch && (
                <div className="max-w-xs space-y-2">
                  <Label htmlFor="team-size" className="text-sm font-semibold">
                    Players per team
                  </Label>
                  <Input
                    id="team-size"
                    type="number"
                    min="2"
                    max="25"
                    value={form.teamSize}
                    onChange={(event) =>
                      setForm({ ...form, teamSize: event.target.value })
                    }
                    required
                    className="h-11 rounded-xl shadow-none"
                  />
                </div>
              )}

              {/* Player selection */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Select players</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Click a player to add or remove them from the squad.
                  </p>
                </div>

                {intraMatch ? (
                  <>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <MemberPicker
                        members={members}
                        title="Team A"
                        selectedIds={form.teamA}
                        onToggle={(id) => updateMembers("teamA", id, teamSize)}
                        maxSelections={teamSize}
                      />
                      <MemberPicker
                        members={members}
                        title="Team B"
                        selectedIds={form.teamB}
                        onToggle={(id) => updateMembers("teamB", id, teamSize)}
                        maxSelections={teamSize}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-border/70 bg-muted/[0.12] p-4">
                        <CaptainSelect
                          id="team-a-captain"
                          label="Team A captain"
                          members={members.filter((member) =>
                            form.teamA.includes(member.id)
                          )}
                          value={form.teamACaptain}
                          onChange={(teamACaptain) =>
                            setForm({ ...form, teamACaptain })
                          }
                        />
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/[0.12] p-4">
                        <CaptainSelect
                          id="team-b-captain"
                          label="Team B captain"
                          members={members.filter((member) =>
                            form.teamB.includes(member.id)
                          )}
                          value={form.teamBCaptain}
                          onChange={(teamBCaptain) =>
                            setForm({ ...form, teamBCaptain })
                          }
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <MemberPicker
                        members={members}
                        title="Playing XI"
                        selectedIds={form.playingXI}
                        onToggle={(id) => updateMembers("playingXI", id, 11)}
                        maxSelections={11}
                        blockedIds={form.substitutes}
                      />
                      <MemberPicker
                        members={members}
                        title="Substitutes"
                        selectedIds={form.substitutes}
                        onToggle={(id) =>
                          updateMembers("substitutes", id, members.length)
                        }
                        maxSelections={members.length}
                        blockedIds={form.playingXI}
                      />
                    </div>

                    <div className="max-w-md rounded-2xl border border-border/70 bg-muted/[0.12] p-4">
                      <CaptainSelect
                        id="match-captain"
                        label="Match captain"
                        members={members.filter((member) =>
                          form.playingXI.includes(member.id)
                        )}
                        value={form.captain}
                        onChange={(captain) => setForm({ ...form, captain })}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 border-t pt-5">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-11 rounded-xl px-5 font-semibold"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Announce Team
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl"
                  onClick={() => setShowComposer(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>

                <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
                  Announcement will be visible to the association.
                </span>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Announcements */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Announced Teams</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upcoming matches are ordered by date. Completed squads are marked and listed last.
            </p>
          </div>
          {selections.length > 0 && (
            <span className="rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
              {upcomingSelections.length} upcoming · {completedSelections.length} completed
            </span>
          )}
        </div>

        {loading ? (
          <LoadingSpinner label="Loading team selections..." />
        ) : selections.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {[...upcomingSelections, ...completedSelections].map((selection) => (
              <SelectionCard
                key={selection.id}
                selection={selection}
                canDelete={manager}
                deleting={deletingId === selection.id}
                onDelete={requestDeleteSelection}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No team selections announced"
            description="New team announcements will appear here for the whole association."
          />
        )}
      </section>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => { if (!open && !deletingId) setPendingDelete(null); }}
        title="Delete team selection?"
        description={pendingDelete ? `Delete the team selection for “${pendingDelete.title}”? This cannot be undone.` : ""}
        confirmLabel="Delete selection"
        onConfirm={deleteSelection}
        loading={Boolean(deletingId)}
      />
    </div>
  )
}
