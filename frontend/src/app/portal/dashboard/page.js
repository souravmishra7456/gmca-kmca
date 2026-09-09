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
  const [upcomingSelection, setUpcomingSelection] = useState(null);
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
          const selections = data.selections || [];
          const memberId = String(user?.id || "");
          const selection = selections.find((item) => {
            const assignedTo = [
              ["Playing XI", item.playingXI],
              ["Substitute", item.substitutes],
              ["Team A", item.teamA],
              ["Team B", item.teamB],
            ].filter(([, members]) => members?.some((member) => String(member.id) === memberId));

            if (!assignedTo.length) {
              return false;
            }

            item.assignments = assignedTo.map(([assignment]) => assignment);
            return true;
          });
          setUpcomingSelection(selection || null);

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          setUpcomingMatches(
            selections
              .filter((item) => item.announced && new Date(item.matchDate) >= today)
              .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate))
              .slice(0, 3)
          );
        } catch {
          setUpcomingSelection(null);
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
      ) : upcomingSelection && (
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-5">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Congratulations — you&apos;ve been selected!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                You are in <span className="font-medium text-foreground">{upcomingSelection.title}</span> on {formatDate(upcomingSelection.matchDate)}
                {upcomingSelection.assignments?.length ? ` as ${upcomingSelection.assignments.join(" & ")}` : ""}.
              </p>
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
