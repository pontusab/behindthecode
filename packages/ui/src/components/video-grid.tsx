import * as React from "react";
import { VideoCard, VideoCardSkeleton } from "#components/video-card";
import { type MediaItem } from "#lib/media";
import { cn } from "#lib/utils";

export function VideoGrid({
  items,
  className,
  priorityCount = 0,
}: {
  items: MediaItem[];
  className?: string;
  priorityCount?: number;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {items.map((item, i) => (
        <VideoCard key={item.id} item={item} priority={i < priorityCount} />
      ))}
    </div>
  );
}

export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}
