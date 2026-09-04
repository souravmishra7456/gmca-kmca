import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { capitalizeRole } from "@/lib/utils";

export default function WelcomeCard({ user }) {
  if (!user) return null;

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Welcome back</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{user.name}</h2>
            <p className="mt-2 text-muted-foreground">
              Member ID: <span className="font-medium text-foreground">{user.memberId}</span>
            </p>
          </div>
          <Badge className="w-fit px-4 py-1.5 text-sm">
            {capitalizeRole(user.role)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
