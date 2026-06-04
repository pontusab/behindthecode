"use client";

import { Lock, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Badge } from "#components/badge";
import { animatedFor, type MediaItem, posterFor } from "#lib/media";
import {
  cn,
  formatCompact,
  formatDuration,
  formatRelativeTime,
} from "#lib/utils";

export function VideoCard({
  item,
  className,
  priority,
}: {
  item: MediaItem;
  className?: string;
  priority?: boolean;
}) {
  const [hovered, setHovered] = React.useState(false);
  const poster = posterFor(item);
  const animated = animatedFor(item);
  const gated = item.access && item.access !== "free";

  return (
    <Link
      href={`/watch/${item.slug}`}
      className={cn("group block", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-video w-full overflow-hidden border border-border bg-muted">
        {poster ? (
          <Image
            src={poster}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            className="object-cover transition-opacity duration-300 group-hover:opacity-90"
          />
        ) : null}

        {hovered && animated && (
          <img
            src={animated}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 [animation:fade-in_.3s_forwards] group-hover:opacity-100"
          />
        )}

        {gated && (
          <Badge className="absolute left-2 top-2 gap-1 bg-foreground text-background">
            <Lock className="size-3" />
            {item.access === "purchase" ? "Buy" : "Members"}
          </Badge>
        )}

        {item.duration ? (
          <span className="absolute bottom-2 right-2 bg-foreground px-1.5 py-0.5 text-xs font-medium text-background tabular-nums">
            {formatDuration(item.duration)}
          </span>
        ) : null}

        <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="grid size-11 place-items-center bg-background text-foreground">
            <Play className="size-5 translate-x-0.5 fill-current" />
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-balance group-hover:underline">
          {item.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {item.categoryName ? `${item.categoryName} · ` : ""}
          {formatCompact(item.views ?? 0)} views
          {item.createdAt ? ` · ${formatRelativeTime(item.createdAt)}` : ""}
        </p>
      </div>
    </Link>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="block">
      <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
