"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@btc/ui/components/avatar";
import { Button } from "@btc/ui/components/button";
import { Textarea } from "@btc/ui/components/textarea";
import { toast } from "@btc/ui/components/toaster";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

export function CommentComposer({
  videoId,
  user,
}: {
  videoId: string;
  user: { name: string; image?: string | null };
}) {
  const router = useRouter();
  const [body, setBody] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || pending) return;
    setPending(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Could not post comment");
      }
      const data = (await res.json()) as { status: "published" | "flagged" };
      setBody("");
      if (data.status === "flagged") {
        toast.info("Your comment was submitted for review.");
      } else {
        toast.success("Comment posted");
        router.refresh();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not post comment",
      );
    } finally {
      setPending(false);
    }
  }

  const initials = (user.name || "?").slice(0, 2).toUpperCase();

  return (
    <form onSubmit={submit} className="flex gap-3">
      <Avatar className="mt-1 size-9 shrink-0">
        {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
        <AvatarFallback className="bg-primary/15 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          rows={3}
          maxLength={2000}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="gradient"
            size="sm"
            disabled={!body.trim() || pending}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Comment
          </Button>
        </div>
      </div>
    </form>
  );
}
