import NoticesList from "@/components/notices/NoticesList";
import { latestNotices } from "@/lib/mockData";

export default function NoticesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Notices</h1>
        <p className="mt-1 text-muted-foreground">
          Official announcements and updates from the association
        </p>
      </div>

      <NoticesList notices={latestNotices} />
    </div>
  );
}
