import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/constants";
import { capitalizeRole, getInitials } from "@/lib/utils";

export default function UserCard({ name, memberId, role, status = "active", onSelect }) {
  return (
    <button type="button" className="w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" onClick={onSelect} aria-label={`View ${name}'s profile`}>
      <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="flex flex-col items-center p-6 text-center">
        <Avatar className="mb-4 h-16 w-16">
          <AvatarFallback className="text-lg">{getInitials(name)}</AvatarFallback>
        </Avatar>
        <h3 className="w-full min-w-0 whitespace-normal break-words text-lg font-semibold [overflow-wrap:anywhere]">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{memberId}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary">{ROLE_LABELS[role] || capitalizeRole(role)}</Badge>
          <Badge variant={status === "active" ? "success" : "warning"}>
            {status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Click to view profile</p>
        </CardContent>
      </Card>
    </button>
  );
}
