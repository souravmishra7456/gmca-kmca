import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bell,
  Calendar,
  Flame,
  Shield,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import PublicHeader from "@/components/layout/PublicHeader";
import LatestNotices from "@/components/notices/LatestNotices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, APP_FULL_NAME } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { isMatchOver, sortSelections } from "@/lib/teamSelections";

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

async function getPublicSquadAnnouncements() {
  try {
    const response = await fetch(`${API_URL}/api/team-selections/public`, { cache: "no-store" });
    if (!response.ok) return [];
    const { selections } = await response.json();
    // The public endpoint already returns announced selections only.
    return sortSelections(selections || []);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [stats, squadAnnouncements] = await Promise.all([
    getAssociationStats(),
    getPublicSquadAnnouncements(),
  ]);
  const upcomingSquadAnnouncements = squadAnnouncements
    .filter((match) => !isMatchOver(match.matchDate))
    .slice(0, 3);
  const associationStats = [
    { label: "Active Members", value: stats.totalMembers, icon: "Users", desc: "Players and association staff" },
    { label: "Matches Contested", value: stats.matchesPlayed, icon: "Trophy", desc: "Competitive fixtures" },
    { label: "Total Runs Scored", value: stats.totalRuns, icon: "TrendingUp", desc: "Across recorded matches" },
    { label: "Wickets Claimed", value: stats.totalWickets, icon: "Target", desc: "Bowling milestones" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <section className="relative isolate overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/10 via-background to-background">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[38rem] w-[38rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-5 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-8 lg:py-20">
          <div className="order-2 pb-2 text-center lg:order-1 lg:py-10 lg:text-left">
            <p lang="or" className="text-sm font-bold tracking-[0.08em] text-primary sm:text-base">ପରମ୍ପରା • ମର୍ଯ୍ୟାଦା • ନିଷ୍ଠା</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-sm">Tradition. Character. Commitment.</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">{APP_NAME}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0 lg:mt-5 lg:text-xl">
              Bringing players together through organized leagues, member development, and a shared love of the game.
            </p>
            <blockquote className="mx-auto mt-8 max-w-xl text-center sm:mt-9 lg:mx-0 lg:text-left">
              <p lang="sa" className="font-serif text-base font-bold leading-[1.9] text-foreground sm:text-lg lg:text-xl" style={{ fontFamily: "'Noto Serif Devanagari', 'Nirmala UI', 'Kohinoor Devanagari', serif" }}>
                कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।<br />मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥
              </p>
              <p className="mt-3 text-xs italic leading-relaxed text-muted-foreground sm:text-sm">“Act without attachment to rewards; do not become attached to inaction.” <cite className="not-italic">~ Shri Krishna · Bhagavad Gita 2.47</cite></p>
            </blockquote>
          </div>
          <div className="order-1 flex justify-center lg:order-2">
            <div className="relative flex h-44 w-44 items-center justify-center sm:h-56 sm:w-56 lg:h-72 lg:w-72">
              <div aria-hidden="true" className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
              <div aria-hidden="true" className="absolute inset-2 rounded-full border border-primary/15" />
              <div aria-hidden="true" className="absolute inset-7 rounded-full border border-primary/10" />
              <div className="relative h-32 w-32 overflow-hidden rounded-full border border-primary/15 bg-white p-2.5 shadow-[0_18px_55px_rgba(22,101,52,0.2)] sm:h-40 sm:w-40 sm:p-3 lg:h-52 lg:w-52 lg:p-4">
                <Image src="/images/gmca-logo.jpg" alt="GMCA and KMCA association crest" fill preload sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 208px" className="object-contain p-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/50 bg-muted/20 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">By the numbers</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Association Highlights</h2></div>
            <p className="text-sm text-muted-foreground">A snapshot of our growing cricket community</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {associationStats.map((stat) => {
              const Icon = iconMap[stat.icon];
              return <article key={stat.label} className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg sm:p-6"><div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-muted-foreground">{stat.label}</span><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="h-5 w-5" /></span></div><p className="mt-4 text-3xl font-black tracking-tight">{formatCount(stat.value)}</p><p className="mt-1 text-xs text-muted-foreground">{stat.desc}</p><span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" /></article>;
            })}
          </div>
        </div>
      </section>

      <section id="squad" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our team</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Meet the Squad</h2><p className="mt-2 max-w-xl text-sm text-muted-foreground">The players who represent our association on and off the field.</p></div>
            <Link href="/about" className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors hover:border-primary/40 hover:text-primary">About the Association <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:gap-6">
            {squadPlaceholders.map((member) => (
              <article
                key={member.id}
                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-card to-muted/30 p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl sm:p-3.5"
              >
                <span className="absolute right-5 top-5 z-10 rounded-full border border-border/60 bg-background/90 px-2 py-1 text-[10px] font-black tracking-tight text-primary shadow-sm backdrop-blur">#{member.number}</span>
                <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-xl bg-muted/50 text-primary">
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
                <h3 className="mt-3 line-clamp-1 text-sm font-bold transition-colors group-hover:text-primary">{member.name}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="notices" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Official dispatches</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Latest Notices</h2>
              <p className="mt-2 text-sm text-muted-foreground">Stay current with association announcements and updates.</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Bell className="h-6 w-6" /></div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-6"><LatestNotices /></div>
        </div>
      </section>

      <section className="border-y border-border/50 bg-muted/20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Matchday center</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Upcoming Matches</h2><p className="mt-2 text-sm text-muted-foreground">The next three announced association fixtures.</p></div>
            <span className="inline-flex w-fit items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground"><Calendar className="h-4 w-4 text-primary" /> Confirmed fixtures</span>
          </div>

          {upcomingSquadAnnouncements.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSquadAnnouncements.map((match) => {
                const isIntra = match.type === "intra";
                return (
                  <Card key={match.id} className="overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                    <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-5 py-3 text-xs font-semibold"><span className="inline-flex items-center gap-1.5 text-primary"><Flame className="h-3.5 w-3.5" />{isIntra ? "Intra-club fixture" : "Match squad"}</span><span className="text-muted-foreground">{formatDate(match.matchDate)}</span></div>
                    <CardHeader className="p-5 pb-3">
                      <CardTitle className="text-base font-bold">{match.title}</CardTitle>
                      {isIntra ? (
                        <p className="text-sm text-muted-foreground">
                          {match.teamACaptain?.name || "Team A"} vs {match.teamBCaptain?.name || "Team B"}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Captain: {match.captain?.name || "Not assigned"}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> Official selection</span><span className="font-medium">{isIntra ? `${(match.teamA || []).length + (match.teamB || []).length} selected` : `${(match.playingXI || []).length} in squad`}</span></div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
          <Card className="border-dashed bg-card/60"><CardContent className="flex flex-col items-center p-10 text-center"><Calendar className="mb-3 h-10 w-10 text-muted-foreground/40" /><p className="font-semibold">No fixtures scheduled right now</p><p className="mt-1 text-sm text-muted-foreground">Check back soon for the next team announcement.</p></CardContent></Card>
          )}
        </div>
      </section>

      <footer className="border-t border-border/50 bg-card py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 text-center sm:px-6 lg:px-8">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-primary/20 bg-background p-1"><Image src="/images/gmca-logo.jpg" alt="GMCA crest" fill sizes="40px" className="object-contain p-1" /></div>
          <p className="text-sm font-semibold text-foreground">{APP_FULL_NAME}</p>
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {APP_FULL_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
