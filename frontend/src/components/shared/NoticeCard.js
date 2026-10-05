import { Calendar, FileText, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default function NoticeCard({
  title,
  description,
  date,
  canDelete = false,
  deleting = false,
  onOpen,
  onDelete,
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(date)}</span>
          </div>
          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              aria-label={`Delete notice: ${title}`}
              title="Delete notice"
              disabled={deleting}
              onClick={onDelete}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {onOpen && (
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onOpen}>
            <FileText className="h-4 w-4" />
            Open notice
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
