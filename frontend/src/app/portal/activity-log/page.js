"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, CheckSquare, History, RefreshCw, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/shared/EmptyState";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { ROLE_LABELS, ROLES } from "@/lib/constants";
import { activityAPI } from "@/services/api";
import useAuthStore from "@/store/authStore";

const formatDate = (value) => new Date(value).toLocaleString(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function ActivityLogPage() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");
  const isChairman = user?.role === ROLES.CHAIRMAN;

  const loadEntries = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const { data } = await activityAPI.getAll();
      setEntries(data.entries || []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load portal activity.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const deleteEntry = async (entry) => {
    setDeletingId(entry.id);
    setError("");
    try {
      await activityAPI.delete(entry.id);
      setEntries((current) => current.filter((item) => item.id !== entry.id));
      setSelectedIds((current) => current.filter((id) => id !== entry.id));
      setDeleteTarget(null);
    } catch (requestError) {
      setError(requestError.message || "Unable to delete this activity entry.");
    } finally {
      setDeletingId("");
    }
  };

  const selectVisibleEntries = (checked) => {
    const visibleIds = filteredEntries.map((entry) => entry.id);
    setSelectedIds((current) => checked
      ? Array.from(new Set([...current, ...visibleIds]))
      : current.filter((id) => !visibleIds.includes(id))
    );
  };

  const deleteSelectedEntries = async () => {
    if (!selectedIds.length) return;

    setBulkDeleting(true);
    setError("");
    try {
      await activityAPI.deleteMany(selectedIds);
      const removedIds = new Set(selectedIds);
      setEntries((current) => current.filter((entry) => !removedIds.has(entry.id)));
      setSelectedIds([]);
      setSelectionMode(false);
      setConfirmBulkDelete(false);
    } catch (requestError) {
      setError(requestError.message || "Unable to delete the selected activity entries.");
    } finally {
      setBulkDeleting(false);
    }
  };

  useEffect(() => {
    if (!isChairman) {
      setLoading(false);
      return undefined;
    }

    loadEntries();
    const refreshInterval = window.setInterval(() => loadEntries(true), 60_000);
    return () => window.clearInterval(refreshInterval);
  }, [isChairman, loadEntries]);

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter((entry) => [
      entry.actorName,
      entry.actorRole,
      entry.action,
      entry.target,
      entry.details,
    ].join(" ").toLowerCase().includes(query));
  }, [entries, search]);

  if (!isChairman) {
    return (
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        Portal activity is only available to the chairman.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <History className="h-4 w-4" /> Chairman tools
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">Portal Activity</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See who made changes across members, statistics, notices, and team selections.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectionMode((enabled) => !enabled);
              setSelectedIds([]);
              setConfirmBulkDelete(false);
              setDeleteTarget(null);
            }}
            disabled={loading || bulkDeleting}
          >
            <CheckSquare className="h-4 w-4" />
            {selectionMode ? "Cancel selection" : "Select multiple"}
          </Button>
          <Button variant="outline" onClick={() => loadEntries(true)} disabled={loading || refreshing || bulkDeleting}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {selectionMode && filteredEntries.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={filteredEntries.every((entry) => selectedIds.includes(entry.id))}
              onChange={(event) => selectVisibleEntries(event.target.checked)}
              aria-label="Select all visible activity entries"
            />
            Select all shown
            <span className="text-muted-foreground">· {selectedIds.length} selected</span>
          </label>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search activity"
            aria-label="Search portal activity"
            className="pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Showing {filteredEntries.length} of {entries.length} recent activities. Keeps the newest 200; older entries are cleaned up in batches.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading portal activity..." />
      ) : filteredEntries.length ? (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="overflow-hidden border-border/70 shadow-sm">
              <CardContent className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                {selectionMode && (
                  <label className="mt-1 shrink-0">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={selectedIds.includes(entry.id)}
                      onChange={(event) => setSelectedIds((current) => event.target.checked
                        ? [...current, entry.id]
                        : current.filter((id) => id !== entry.id))}
                      aria-label={`Select activity: ${entry.action} — ${entry.target}`}
                      disabled={bulkDeleting}
                    />
                  </label>
                )}
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold">{entry.action}</p>
                      <p className="mt-0.5 break-words text-sm text-muted-foreground">{entry.target}</p>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                      <time dateTime={entry.createdAt} className="text-xs text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </time>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setError(""); setDeleteTarget(entry); }}
                        disabled={Boolean(deletingId) || bulkDeleting}
                        aria-label={`Delete activity: ${entry.action} — ${entry.target}`}
                        title="Delete activity entry"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  {entry.details && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{entry.details}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3 text-xs">
                    <span className="font-medium text-foreground">{entry.actorName}</span>
                    <Badge variant="secondary">{ROLE_LABELS[entry.actorRole] || entry.actorRole}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title={search ? "No matching activity" : "No activity recorded yet"}
          description={search ? "Try a different name, action, or target." : "Successful portal actions will appear here."}
        />
      )}

      {selectionMode && selectedIds.length > 0 && !loading && (
        <div className="sticky bottom-3 z-20 flex items-center justify-between gap-3 rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur sm:p-4">
          <p className="text-sm font-medium">{selectedIds.length} selected</p>
          <Button variant="destructive" onClick={() => { setError(""); setConfirmBulkDelete(true); }} disabled={bulkDeleting}>
            <Trash2 className="h-4 w-4" />
            Delete selected
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget) || confirmBulkDelete}
        onOpenChange={(open) => {
          if (open || deletingId || bulkDeleting) return;
          setDeleteTarget(null);
          setConfirmBulkDelete(false);
        }}
        title={deleteTarget ? "Delete activity entry?" : "Delete selected activity?"}
        description={deleteTarget
          ? <>Delete “{deleteTarget.action} — {deleteTarget.target}”? This cannot be undone.</>
          : `Delete ${selectedIds.length} selected activity ${selectedIds.length === 1 ? "entry" : "entries"}? This cannot be undone.`}
        confirmLabel="Confirm delete"
        onConfirm={() => deleteTarget ? deleteEntry(deleteTarget) : deleteSelectedEntries()}
        loading={Boolean(deletingId) || bulkDeleting}
        error={error}
      />
    </div>
  );
}
