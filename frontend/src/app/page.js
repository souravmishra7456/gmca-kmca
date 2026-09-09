import Link from "next/link";
import Image from "next/image";
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
import LatestNotices from "@/components/notices/LatestNotices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, APP_FULL_NAME } from "@/lib/constants";
import {
  upcomingMatches,
} from "@/lib/mockData";
import { formatDate } from "@/lib/utils";

const iconMap = {
  Users,
  Trophy,
  TrendingUp,
  Target,
};

const squadPlaceholders = [
  {
    id: 1,
    name: "Aditya Kiran Das",
    number: "17",
    photo: "/images/players/aditya.png",
  },
  {
    id: 2,
    name: "Amlan Anupam Rautaray",
    number: "18",
    photo: "/images/players/amlan1.jpeg",
  },
  {
    id: 3,
    name: "Anshuman Jena",
    number: "9",
    photo: "/images/players/anshuman.jpeg",
  },
  {
    id: 4,
    name: "Bikram Dangua",
    number: "29",
    photo: "/images/players/bikram1.png",
  },
  {
    id: 5,
    name: "Biswajeet Champati",
    number: "95",
    photo: "/images/players/biswa.png"
  },
  {
    id: 6,
    name: "Omm Prasad",
    number: "49",
    photo: "/images/players/omm.png",
  },
  {
    id: 7,
    name: "Priyansu Samantsinghar",
    number: "10",
    photo: "/images/players/priyanshu.png",
  },
  {
    id: 8,
    name: "Nagadhiraj Pattanaik",
    number: "69",
    photo: "/images/players/naga.jpeg",
  },
  {
    id: 9,
    name: "Sourav Mishra",
    number: "7",
    photo: "/images/players/sourav.jpg",
  },
  {
    id: 10,
    name: "Subhamshree Pradhan",
    number: "1",
    photo: "/images/players/subham.png",
  }
];

const emptyStats = {
  totalMembers: 0,
  matchesPlayed: 0,
  totalRuns: 0,
  totalWickets: 0,
};

const formatCount = (value) => Number(value || 0).toLocaleString("en-IN");
const API_URL = process.env.API_URL || "http://localhost:5000";

async function getAssociationStats() {
  try {
    const response = await fetch(`${API_URL}/api/dashboard/stats`, {
      // These totals change whenever a manager saves player statistics, so the
      // landing page must read the current values instead of serving a cached
      // five-minute snapshot.
      cache: "no-store",
    });

    if (!response.ok) {
      return emptyStats;
    }

    const { stats } = await response.json();
    return { ...emptyStats, ...stats };
  } catch {
    return emptyStats;
  }
}

export default async function HomePage() {
  const stats = await getAssociationStats();
  const associationStats = [
    { label: "Total Members", value: stats.totalMembers, icon: "Users" },
    { label: "Matches Played", value: stats.matchesPlayed, icon: "Trophy" },
    { label: "Total Runs", value: stats.totalRuns, icon: "TrendingUp" },
    { label: "Total Wickets", value: stats.totalWickets, icon: "Target" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <section className="overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              Official Cricket Association Portal
            </p>
            <Image
              src="/images/gmca-logo.jpg"
              alt="Gayatri Mandir Cricket Association crest"
              width={112}
              height={112}
              className="mb-6 rounded-full bg-white p-2 shadow-lg"
            />
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {APP_NAME}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {APP_FULL_NAME} — fostering cricket excellence through organized
              leagues, member development, and community engagement.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/login">
                  Member Portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
              >
                <Link href="#notices">Latest Notices</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">About the Association</Link>
              </Button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border bg-card p-2 shadow-2xl">
            <Image
              src="/images/gmca-members-hero.jpg"
              alt="Members of Gayatri Mandir Cricket Association together"
              width={1280}
              height={819}
              preload
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="aspect-[16/10] w-full rounded-2xl object-cover"
            />
          </div>
        </div>
      </section>

      <section id="squad" className="border-b bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Our Team
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Meet the Squad</h2>
            <p className="mt-2 text-muted-foreground">
              The players who represent our association on and off the field.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:gap-6">
            {squadPlaceholders.map((member) => (
              <article
                key={member.id}
                className="group rounded-2xl border bg-card p-4 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative mx-auto flex aspect-square w-full max-w-36 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary/30 bg-primary/5 text-primary">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 40vw, (max-width: 768px) 25vw, 15vw"
                      className="object-cover"
                    />
                  ) : (
                    <Users className="h-10 w-10" aria-hidden="true" />
                  )}
                </div>
                <h3 className="mt-4 font-semibold">{member.name}</h3>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Jersey No. {member.number}
                </p>
              </article>
            ))}
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
              value={formatCount(stat.value)}
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
          <LatestNotices />
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
          <p>&copy; {new Date().getFullYear()} {APP_FULL_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
