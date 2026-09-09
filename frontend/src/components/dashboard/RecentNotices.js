import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import NoticeCard from "@/components/shared/NoticeCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecentNotices({ notices }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Notices</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portal/notices">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {notices.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notices.slice(0, 3).map((notice) => (
              <NoticeCard key={notice.id} {...notice} />
            ))}
          </div>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">No notices have been posted yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
