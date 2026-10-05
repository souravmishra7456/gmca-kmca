import Image from "next/image";
import { Quote, Users } from "lucide-react";
import PublicHeader from "@/components/layout/PublicHeader";
import AboutGallery from "@/components/about/AboutGallery";
import { Card, CardContent } from "@/components/ui/card";
import { APP_FULL_NAME, ROLE_LABELS, ROLES } from "@/lib/constants";
import { SITE_URL } from "@/lib/site";

export const metadata = {
  title: "About the Association",
  description: `${APP_FULL_NAME} brings members together through competitive cricket, practice, and sportsmanship in Khordha, Odisha. Learn about the association and its leadership.`,
  ...(SITE_URL ? { alternates: { canonical: `${SITE_URL}/about` } } : {}),
  openGraph: {
    title: "About GMCA & KMCA",
    description:
      "Learn about the Gayatri Mandir and Kalyan Mandap Cricket Associations, their members, and leadership in Khordha, Odisha.",
    ...(SITE_URL ? { images: ["/images/gmca-members-hero.jpg"] } : {}),
  },
};

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

export default async function AboutPage() {
  const leadership = await getLeadership();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>
        <section className="border-b bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12 lg:px-8 lg:py-24">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">About the association</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">More than a cricket team.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{APP_FULL_NAME} brings members together through competitive cricket, practice, and a shared commitment to sportsmanship.</p>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-2 shadow-2xl">
              <Image src="/images/gmca-members-hero.jpg" alt="GMCA and KMCA members together" width={1280} height={819} sizes="(max-width: 1024px) 100vw, 60vw" className="aspect-[16/10] w-full rounded-2xl object-cover transition-transform duration-500 hover:scale-[1.02]" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Leadership</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Messages from our leadership</h2><p className="mt-2 text-muted-foreground">The people guiding the association and its members.</p></div>
          {leadership.length ? <div className="grid gap-6 md:grid-cols-2">{leadership.map((leader) => <Card key={leader.id} className="overflow-hidden"><CardContent className="p-6"><Quote className="h-8 w-8 text-primary/50" /><p className="mt-4 leading-relaxed text-muted-foreground">“{messages[leader.role]}”</p><div className="mt-6 border-t pt-4"><p className="font-semibold">{leader.name}</p><p className="text-sm text-primary">{ROLE_LABELS[leader.role]}</p></div></CardContent></Card>)}</div> : <Card><CardContent className="flex items-center gap-3 p-6 text-muted-foreground"><Users className="h-5 w-5 text-primary" />Leadership details will be added shortly.</CardContent></Card>}
        </section>

        <AboutGallery />
      </main>
    </div>
  );
}
