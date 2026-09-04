"use client";

import { useEffect, useState } from "react";
import {
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
import { dashboardAPI } from "@/services/api";
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

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await dashboardAPI.getStats();
        setStats({ ...emptyStats, ...data.stats });
      } catch {
        setStats(emptyStats);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, []);

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
