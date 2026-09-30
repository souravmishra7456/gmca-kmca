import NoticeCard from "@/components/shared/NoticeCard";
import EmptyState from "@/components/shared/EmptyState";

export default function NoticesList({
  notices,
  canDelete = false,
  deletingId,
  onDelete,
}) {
  if (!notices?.length) {
    return (
      <EmptyState
        title="No notices available"
        description="Check back later for association updates and announcements."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notices.map((notice) => (
        <NoticeCard
          key={notice.id}
          {...notice}
          canDelete={canDelete}
          deleting={deletingId === notice.id}
          onDelete={() => onDelete?.(notice)}
        />
      ))}
    </div>
  );
}
