"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, History, RefreshCw, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    if (!window.confirm(`Delete this activity entry for “${entry.action} — ${entry.target}”?`)) return;

    setDeletingId(entry.id);
    setError("");
    try {
      await activityAPI.delete(entry.id);
      setEntries((current) => current.filter((item) => item.id !== entry.id));
    } catch (requestError) {
      setError(requestError.message || "Unable to delete this activity entry.");
    } finally {
      setDeletingId("");
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
        <Button variant="outline" onClick={() => loadEntries(true)} disabled={loading || refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

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
              <CardContent className="flex gap-4 p-4 sm:p-5">
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
                        onClick={() => deleteEntry(entry)}
                        disabled={Boolean(deletingId)}
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
    </div>
  );
}
