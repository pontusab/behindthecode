"use client";

import { formatRelativeTime } from "@btc/ui";
import { Badge } from "@btc/ui/components/badge";
import { Button } from "@btc/ui/components/button";
import { toast } from "@btc/ui/components/toaster";
import { Check, EyeOff, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  deleteCommentAction,
  setCommentStatusAction,
} from "@/app/admin/actions";

export type ModComment = {
  id: string;
  body: string;
  authorName: string;
  createdAt: number;
  status: string;
  aiReason: string | null;
};

export function CommentModeration({ comments }: { comments: ModComment[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  async function act(id: string, fn: () => Promise<unknown>, msg: string) {
    setBusy(id);
    try {
      await fn();
      toast.success(msg);
      router.refresh();
    } catch {
      toast.error("Action failed");
    } finally {
      setBusy(null);
    }
  }

  if (comments.length === 0) {
    return (
      <div className="glass rounded-xl py-12 text-center text-sm text-muted-foreground">
        Nothing to review. 🎉
      </div>
    );
  }

  return (
    <div className="glass divide-y divide-border rounded-xl">
      {comments.map((c) => (
        <div
          key={c.id}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start"
        >
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{c.authorName}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(c.createdAt)}
              </span>
              {c.aiReason && (
                <Badge variant="outline" className="text-xs capitalize">
                  {c.aiReason}
                </Badge>
              )}
            </div>
            <p className="whitespace-pre-wrap text-sm text-foreground/90">
              {c.body}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={busy === c.id}
              onClick={() =>
                act(
                  c.id,
                  () => setCommentStatusAction(c.id, "published"),
                  "Approved",
                )
              }
            >
              <Check className="size-4" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy === c.id}
              onClick={() =>
                act(
                  c.id,
                  () => setCommentStatusAction(c.id, "removed"),
                  "Removed",
                )
              }
            >
              <EyeOff className="size-4" /> Hide
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-destructive"
              disabled={busy === c.id}
              onClick={() =>
                act(c.id, () => deleteCommentAction(c.id), "Deleted")
              }
            >
              {busy === c.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
