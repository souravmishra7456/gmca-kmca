import Link from "next/link";
import { Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default function UpcomingMatches({ matches }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Upcoming Matches</CardTitle>
          <Button variant="ghost" size="sm" asChild><Link href="/portal/team-selection">View squads</Link></Button>
        </div>
      </CardHeader>
      <CardContent>
        {matches.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
          <div
            key={match.id}
            className="rounded-xl border bg-background p-5 transition-shadow hover:shadow-md"
          >
            <h3 className="font-semibold">{match.title}</h3>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formatDate(match.matchDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>
                  {match.type === "intra"
                    ? `Intra match · ${match.teamA.length + match.teamB.length} players selected`
                    : `Match squad · ${match.playingXI.length} players selected`}
                </span>
              </div>
            </div>
          </div>
          ))}
        </div> : <p className="py-4 text-sm text-muted-foreground">No upcoming squads have been announced yet.</p>}
      </CardContent>
    </Card>
  );
}
