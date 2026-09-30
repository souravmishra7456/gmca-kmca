"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Send } from "lucide-react";
import NoticesList from "@/components/notices/NoticesList";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { noticesAPI } from "@/services/api";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";

const canSendNotices = (role) => ["chairman", "director"].includes(role);

export default function NoticesPage() {
  const { user } = useAuthStore();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const { data } = await noticesAPI.getAll();
        setNotices(data.notices || []);
      } catch {
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);

    try {
      const { data } = await noticesAPI.create({ title, description });
      setNotices((current) => [data.notice, ...current]);
      setTitle("");
      setDescription("");
      setShowComposer(false);
      toast.success("Notice sent to members.");
    } catch (requestError) {
      toast.error(requestError.message || "Unable to send notice. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const canSend = canSendNotices(user?.role);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Notices</h1>
          <p className="mt-1 text-muted-foreground">
            Official announcements and updates from the association
          </p>
        </div>
        {canSend && (
          <Button onClick={() => setShowComposer((isOpen) => !isOpen)}>
            <Plus className="h-4 w-4" />
            Send Notice
          </Button>
        )}
      </div>

      {canSend && showComposer && (
        <Card>
          <CardHeader>
            <CardTitle>Send notice to all members</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notice-title">Title</Label>
                <Input
                  id="notice-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={140}
                  placeholder="e.g. Practice schedule update"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notice-description">Message</Label>
                <textarea
                  id="notice-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={2000}
                  placeholder="Write the notice for the team..."
                  required
                  rows={5}
                  className="flex w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send to Team
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowComposer(false)} disabled={sending}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? <LoadingSpinner label="Loading notices..." /> : <NoticesList notices={notices} />}
    </div>
  );
}
