import Image from "next/image";
import { Building2, MapPin, Quote, Users } from "lucide-react";
import PublicHeader from "@/components/layout/PublicHeader";
import { Card, CardContent } from "@/components/ui/card";
import { APP_FULL_NAME, APP_NAME, ROLE_LABELS, ROLES } from "@/lib/constants";

const API_URL = process.env.API_URL || "http://localhost:5000";

async function getLeadership() {
  try {
    const response = await fetch(`${API_URL}/api/players`, { next: { revalidate: 300 } });
    if (!response.ok) return [];
    const { players } = await response.json();
    return (players || []).filter((member) => [ROLES.CHAIRMAN, ROLES.DIRECTOR].includes(member.role));
  } catch {
    return [];
  }
}

const messages = {
  [ROLES.CHAIRMAN]: "Our association is built on discipline, respect, and the joy of cricket. We are committed to giving every member the opportunity to grow on and off the field.",
  [ROLES.DIRECTOR]: "Every practice, match, and team announcement is a chance to improve together. Let us bring energy, teamwork, and sportsmanship to every game.",
};

const stadiumSlots = ["Main Ground", "Practice Nets", "Match-Day Pavilion"];

export default async function AboutPage() {
  const leadership = await getLeadership();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <section className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-24">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">About the association</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">More than a cricket team.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{APP_FULL_NAME} brings members together through competitive cricket, practice, and a shared commitment to sportsmanship.</p>
            </div>
            <div className="relative overflow-hidden rounded-3xl border bg-card p-2 shadow-xl">
              <Image src="/images/gmca-members-hero.jpg" alt="GMCA and KMCA members together" width={1280} height={819} className="aspect-[16/10] w-full rounded-2xl object-cover" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Leadership</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Messages from our leadership</h2><p className="mt-2 text-muted-foreground">The people guiding the association and its members.</p></div>
          {leadership.length ? <div className="grid gap-6 md:grid-cols-2">{leadership.map((leader) => <Card key={leader.id} className="overflow-hidden"><CardContent className="p-6"><Quote className="h-8 w-8 text-primary/50" /><p className="mt-4 leading-relaxed text-muted-foreground">“{messages[leader.role]}”</p><div className="mt-6 border-t pt-4"><p className="font-semibold">{leader.name}</p><p className="text-sm text-primary">{ROLE_LABELS[leader.role]}</p></div></CardContent></Card>)}</div> : <Card><CardContent className="flex items-center gap-3 p-6 text-muted-foreground"><Users className="h-5 w-5 text-primary" />Leadership details will be added shortly.</CardContent></Card>}
        </section>

        <section className="border-y bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Our grounds</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Stadium gallery</h2><p className="mt-2 text-muted-foreground">A home for practice, match days, and our cricket community.</p></div>
            <div className="grid gap-5 md:grid-cols-3">{stadiumSlots.map((name) => <Card key={name} className="overflow-hidden"><div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-muted"><div className="text-center"><Building2 className="mx-auto h-10 w-10 text-primary" /><p className="mt-3 text-sm font-medium text-primary">Stadium photo coming soon</p></div></div><CardContent className="flex items-center gap-2 p-4"><MapPin className="h-4 w-4 text-primary" /><span className="font-medium">{name}</span></CardContent></Card>)}</div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-card py-8"><div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</div></footer>
    </div>
  );
}
