"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Calendar,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import PublicHeader from "@/components/layout/PublicHeader";
import StatsCard from "@/components/shared/StatsCard";
import NoticeCard from "@/components/shared/NoticeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, APP_FULL_NAME } from "@/lib/constants";
import {
  associationStats,
  latestNotices,
  upcomingMatches,
} from "@/lib/mockData";
import { formatDate } from "@/lib/utils";

const iconMap = {
  Users,
  Trophy,
  TrendingUp,
  Target,
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(22,101,52,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Official Cricket Association Portal
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {APP_NAME}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {APP_FULL_NAME} — fostering cricket excellence through organized
              leagues, member development, and community engagement across
              Gujarat and Maharashtra.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/login">
                  Member Portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#notices">Latest Notices</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Association at a Glance</h2>
          <p className="mt-2 text-muted-foreground">
            Key statistics from our cricket community
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {associationStats.map((stat) => (
            <StatsCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={iconMap[stat.icon]}
            />
          ))}
        </div>
      </section>

      <section id="notices" className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Latest Notices</h2>
              <p className="mt-2 text-muted-foreground">
                Stay updated with association announcements
              </p>
            </div>
            <Bell className="hidden h-8 w-8 text-primary sm:block" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {latestNotices.map((notice) => (
              <NoticeCard key={notice.id} {...notice} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Upcoming Matches</h2>
          <p className="mt-2 text-muted-foreground">
            Scheduled fixtures and tournaments
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {upcomingMatches.map((match) => (
            <Card key={match.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">{match.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{formatDate(match.date)} at {match.time}</span>
                </div>
                <p>{match.venue}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
