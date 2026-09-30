"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import RecentNotices from "@/components/dashboard/RecentNotices";
import UpcomingMatches from "@/components/dashboard/UpcomingMatches";
import StatsCard from "@/components/shared/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { dashboardAPI, noticesAPI, teamSelectionsAPI } from "@/services/api";
import { getMemberAssignments, isMatchOver, sortSelections } from "@/lib/teamSelections";
import useAuthStore from "@/store/authStore";

const emptyStats = {
  totalMembers: 0,
  matchesPlayed: 0,
  totalRuns: 0,
  totalWickets: 0,
};

const formatCount = (value) => Number(value || 0).toLocaleString("en-IN");

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(emptyStats);
  const [loadingStats, setLoadingStats] = useState(true);
  const [myUpcomingMatches, setMyUpcomingMatches] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoadingStats(true);
      const loadStats = async () => {
        try {
          const statsResponse = await dashboardAPI.getStats();
          setStats({ ...emptyStats, ...statsResponse.data.stats });
        } catch {
          setStats(emptyStats);
        }
      };

      const loadUpcomingSelection = async () => {
        try {
          const { data } = await teamSelectionsAPI.getAll();
          const selections = sortSelections(data.selections || []);
          const memberId = String(user?.id || "");
          setMyUpcomingMatches(
            selections
              .filter((item) => !isMatchOver(item.matchDate))
              .map((item) => ({ ...item, assignments: getMemberAssignments(item, memberId) }))
              .filter((item) => item.assignments.length > 0)
          );
          setUpcomingMatches(
            selections
              .filter((item) => item.announced && !isMatchOver(item.matchDate))
              .slice(0, 3)
          );
        } catch {
          setMyUpcomingMatches([]);
          setUpcomingMatches([]);
        }
      };

      const loadRecentNotices = async () => {
        try {
          const { data } = await noticesAPI.getAll({ limit: 3 });
          setRecentNotices((data.notices || []).slice(0, 3));
        } catch {
          setRecentNotices([]);
        }
      };

      try {
        await Promise.all([loadStats(), loadUpcomingSelection(), loadRecentNotices()]);
      } finally {
        setLoadingStats(false);
      }
    };

    loadDashboard();
  }, [user?.id]);

  const associationStats = [
    { label: "Total Members", value: stats.totalMembers, icon: Users },
    { label: "Matches Played", value: stats.matchesPlayed, icon: Trophy },
    { label: "Total Runs", value: stats.totalRuns, icon: TrendingUp },
    { label: "Total Wickets", value: stats.totalWickets, icon: Target },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Overview of your association activity
        </p>
      </div>

      <WelcomeCard user={user} />

      {loadingStats ? (
        <SelectionBannerSkeleton />
      ) : myUpcomingMatches.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">You&apos;re selected for {myUpcomingMatches.length} upcoming {myUpcomingMatches.length === 1 ? "match" : "matches"}</p>
              <div className="mt-3 divide-y divide-primary/10">
                {myUpcomingMatches.map((match) => (
                  <div key={match.id} className="flex flex-col gap-1 py-2 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-medium text-foreground">{match.title}<span className="font-normal text-muted-foreground"> · {formatDate(match.matchDate)}</span></p>
                    <p className="text-xs text-muted-foreground">{match.assignments.join(" & ")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingStats
          ? Array.from({ length: 4 }, (_, index) => <StatsCardSkeleton key={index} />)
          : associationStats.map((stat) => (
              <StatsCard key={stat.label} label={stat.label} value={formatCount(stat.value)} icon={stat.icon} />
            ))}
      </div>

      {loadingStats ? <DashboardSectionsSkeleton /> : <>
        <RecentNotices notices={recentNotices} />
        <UpcomingMatches matches={upcomingMatches} />
      </>}
    </div>
  );
}

function SelectionBannerSkeleton() {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/10 p-5">
      <div className="flex gap-4"><Skeleton className="h-11 w-11 shrink-0 rounded-full bg-primary/20" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-64 max-w-full" /><Skeleton className="h-4 w-96 max-w-full" /></div></div>
    </div>
  );
}

function StatsCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-6"><Skeleton className="h-12 w-12 shrink-0 rounded-xl" /><div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-7 w-12" /></div></div>
  );
}

function DashboardSectionsSkeleton() {
  return (
    <div className="space-y-8">
      {["notices", "matches"].map((section) => <div key={section} className="rounded-xl border bg-card p-6"><div className="mb-6 flex items-center justify-between"><Skeleton className="h-6 w-36" /><Skeleton className="h-8 w-20" /></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="space-y-4 rounded-xl border p-5"><Skeleton className="h-4 w-24" /><Skeleton className="h-6 w-4/5" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/5" /></div>)}</div></div>)}
    </div>
  );
}
