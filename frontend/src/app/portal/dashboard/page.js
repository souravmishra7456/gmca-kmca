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
import { latestNotices, upcomingMatches } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";
import { dashboardAPI, teamSelectionsAPI } from "@/services/api";
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

  useEffect(() => {
    const loadDashboard = async () => {
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
          const memberId = String(user?.id || "");
          const selection = (data.selections || []).find((item) => {
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
        } catch {
          setUpcomingSelection(null);
        }
      };

      try {
        await Promise.all([loadStats(), loadUpcomingSelection()]);
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

      {upcomingSelection && (
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
        {associationStats.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={loadingStats ? "—" : formatCount(stat.value)}
            icon={stat.icon}
          />
        ))}
      </div>

      <RecentNotices notices={latestNotices} />
      <UpcomingMatches matches={upcomingMatches} />
    </div>
  );
}
