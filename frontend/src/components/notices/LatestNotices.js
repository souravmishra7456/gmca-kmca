"use client";

import { useEffect, useState } from "react";
import NoticeCard from "@/components/shared/NoticeCard";
import { noticesAPI } from "@/services/api";

export default function LatestNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLatestNotices = async () => {
      try {
        const { data } = await noticesAPI.getAll({ limit: 3 });
        setNotices((data.notices || []).slice(0, 3));
      } catch {
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    loadLatestNotices();
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading notices...</p>;
  }

  if (!notices.length) {
    return <p className="text-sm text-muted-foreground">No notices have been posted yet.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notices.map((notice) => (
        <NoticeCard key={notice.id} {...notice} />
      ))}
    </div>
  );
}
