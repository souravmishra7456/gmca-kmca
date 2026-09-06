"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Send, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import { playersAPI, teamSelectionsAPI } from "@/services/api";
import useAuthStore from "@/store/authStore";

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

function MemberPicker({ members, selectedIds, onToggle, title, maxSelections, blockedIds = [] }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary">{selectedIds.length}/{maxSelections}</Badge>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {members.map((member) => {
          const selected = selectedIds.includes(member.id);
          const blocked = blockedIds.includes(member.id);
          const atLimit = !selected && selectedIds.length >= maxSelections;
          const disabled = blocked || atLimit;

          return (
            <label
              key={member.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                selected ? "border-primary bg-primary/10" : "bg-card"
              } ${disabled ? "cursor-not-allowed opacity-45" : "hover:border-primary/50"}`}
            >
              <input
                type="checkbox"
                checked={selected}
                disabled={disabled}
                onChange={() => onToggle(member.id)}
                className="h-4 w-4 accent-primary"
              />
              <span className="min-w-0 flex-1 truncate">{member.name}</span>
              {selected && <Check className="h-4 w-4 text-primary" />}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function MemberList({ members, emptyLabel }) {
  if (!members?.length) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-1.5 text-sm">
      {members.map((member) => <li key={member.id}>{member.name}</li>)}
    </ul>
  );
}

function CaptainSelect({ id, label, members, value, onChange }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Select captain</option>
        {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
      </select>
    </div>
  );
}

function SelectionCard({ selection, canDelete, deleting, onDelete }) {
  const intraMatch = selection.type === "intra";

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge>{intraMatch ? "Intra Match" : "Match Squad"}</Badge>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{formatDate(selection.matchDate)}</span>
            {canDelete && (
              <Button variant="ghost" size="icon" onClick={() => onDelete(selection.id)} disabled={deleting} aria-label={`Delete ${selection.title}`}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
              </Button>
            )}
          </div>
        </div>
        <CardTitle>{selection.title}</CardTitle>
        <p className="text-xs text-muted-foreground">Announced by {selection.selectedBy || "association management"}</p>
      </CardHeader>
      <CardContent>
        {intraMatch ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Team A ({selection.teamSize})</h3>
              <p className="mb-2 text-xs text-muted-foreground">Captain: {selection.teamACaptain?.name || "Not assigned"}</p>
              <MemberList members={selection.teamA} emptyLabel="No players selected" />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Team B ({selection.teamSize})</h3>
              <p className="mb-2 text-xs text-muted-foreground">Captain: {selection.teamBCaptain?.name || "Not assigned"}</p>
              <MemberList members={selection.teamB} emptyLabel="No players selected" />
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold">Playing XI</h3>
              <p className="mb-2 text-xs text-muted-foreground">Captain: {selection.captain?.name || "Not assigned"}</p>
              <MemberList members={selection.playingXI} emptyLabel="No players selected" />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Substitutes</h3>
              <MemberList members={selection.substitutes} emptyLabel="No substitutes selected" />
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
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [playersResponse, selectionsResponse] = await Promise.all([
          playersAPI.getAll(),
          teamSelectionsAPI.getAll(),
        ]);
        setMembers((playersResponse.data.players || []).filter((player) => player.status === "active"));
        setSelections(selectionsResponse.data.selections || []);
      } catch {
        setMembers([]);
        setSelections([]);
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

  const deleteSelection = async (selectionId) => {
    const selection = selections.find((item) => item.id === selectionId);
    if (!window.confirm(`Delete the team selection for ${selection?.title || "this match"}?`)) {
      return;
    }

    setDeletingId(selectionId);
    try {
      await teamSelectionsAPI.delete(selectionId);
      setSelections((current) => current.filter((item) => item.id !== selectionId));
    } catch (requestError) {
      setError(requestError.message || "Unable to delete this team selection.");
    } finally {
      setDeletingId(null);
    }
  };

  const submitSelection = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data } = await teamSelectionsAPI.create({
        ...form,
        teamSize: Number(form.teamSize),
      });
      setSelections((current) => [data.selection, ...current]);
      setForm(initialForm);
      setShowComposer(false);
    } catch (requestError) {
      setError(requestError.message || "Unable to announce this selection.");
    } finally {
      setSubmitting(false);
    }
  };

  const manager = canManageSelection(user?.role);
  const intraMatch = form.type === "intra";
  const teamSize = Math.max(2, Number(form.teamSize) || 2);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Team Selection</h1>
          <p className="mt-1 text-muted-foreground">View announced squads and intra-match teams.</p>
        </div>
        {manager && (
          <Button onClick={() => setShowComposer((isOpen) => !isOpen)}>
            <Users className="h-4 w-4" />
            Announce Team
          </Button>
        )}
      </div>

      {manager && showComposer && (
        <Card>
          <CardHeader>
            <CardTitle>Create team selection</CardTitle>
            <p className="text-sm text-muted-foreground">Choose an intra match for two internal teams, or a match for a standard playing XI and substitutes.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitSelection} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="selection-title">Match title</Label>
                  <Input id="selection-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Sunday practice match" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selection-date">Match date</Label>
                  <Input id="selection-date" type="date" value={form.matchDate} onChange={(event) => setForm({ ...form, matchDate: event.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Selection type</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["match", "Match squad", "Playing XI with substitutes"],
                    ["intra", "Intra match", "Two internal teams; a member may play for both"],
                  ].map(([type, label, description]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, type })}
                      className={`rounded-xl border p-4 text-left transition-colors ${form.type === type ? "border-primary bg-primary/10" : "hover:border-primary/50"}`}
                    >
                      <span className="block font-semibold">{label}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {intraMatch && (
                <div className="max-w-xs space-y-2">
                  <Label htmlFor="team-size">Players per team</Label>
                  <Input id="team-size" type="number" min="2" max="25" value={form.teamSize} onChange={(event) => setForm({ ...form, teamSize: event.target.value })} required />
                </div>
              )}

              {intraMatch ? (
                <>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <MemberPicker members={members} title="Team A" selectedIds={form.teamA} onToggle={(id) => updateMembers("teamA", id, teamSize)} maxSelections={teamSize} />
                    <MemberPicker members={members} title="Team B" selectedIds={form.teamB} onToggle={(id) => updateMembers("teamB", id, teamSize)} maxSelections={teamSize} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <CaptainSelect id="team-a-captain" label="Team A captain" members={members.filter((member) => form.teamA.includes(member.id))} value={form.teamACaptain} onChange={(teamACaptain) => setForm({ ...form, teamACaptain })} />
                    <CaptainSelect id="team-b-captain" label="Team B captain" members={members.filter((member) => form.teamB.includes(member.id))} value={form.teamBCaptain} onChange={(teamBCaptain) => setForm({ ...form, teamBCaptain })} />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <MemberPicker members={members} title="Playing XI" selectedIds={form.playingXI} onToggle={(id) => updateMembers("playingXI", id, 11)} maxSelections={11} blockedIds={form.substitutes} />
                    <MemberPicker members={members} title="Substitutes" selectedIds={form.substitutes} onToggle={(id) => updateMembers("substitutes", id, members.length)} maxSelections={members.length} blockedIds={form.playingXI} />
                  </div>
                  <div className="max-w-sm">
                    <CaptainSelect id="match-captain" label="Match captain" members={members.filter((member) => form.playingXI.includes(member.id))} value={form.captain} onChange={(captain) => setForm({ ...form, captain })} />
                  </div>
                </>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Announce Team
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowComposer(false)} disabled={submitting}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? <LoadingSpinner label="Loading team selections..." /> : selections.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {selections.map((selection) => <SelectionCard key={selection.id} selection={selection} canDelete={manager} deleting={deletingId === selection.id} onDelete={deleteSelection} />)}
        </div>
      ) : (
        <EmptyState title="No team selections announced" description="New team announcements will appear here for the whole association." />
      )}
    </div>
  );
}
