"use client";

import { cn, formatCompact } from "@btc/ui";
import { Button } from "@btc/ui/components/button";
import { toast } from "@btc/ui/components/toaster";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

export function LikeButton({
  videoId,
  initialLikes,
  initialLiked,
  isSignedIn,
}: {
  videoId: string;
  initialLikes: number;
  initialLiked: boolean;
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [likes, setLikes] = React.useState(initialLikes);
  const [liked, setLiked] = React.useState(initialLiked);
  const [pending, setPending] = React.useState(false);

  async function toggle() {
    if (!isSignedIn) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }
    if (pending) return;
    setPending(true);
    const optimisticLiked = !liked;
    setLiked(optimisticLiked);
    setLikes((n) => n + (optimisticLiked ? 1 : -1));
    try {
      const res = await fetch(`/api/videos/${videoId}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { likes: number; liked: boolean };
      setLikes(data.likes);
      setLiked(data.liked);
    } catch {
      setLiked(!optimisticLiked);
      setLikes((n) => n + (optimisticLiked ? -1 : 1));
      toast.error("Could not update like");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant={liked ? "default" : "secondary"}
      size="sm"
      onClick={toggle}
      disabled={pending}
      className="rounded-full"
    >
      <Heart className={cn("size-4", liked && "fill-current")} />
      {formatCompact(likes)}
    </Button>
  );
}
