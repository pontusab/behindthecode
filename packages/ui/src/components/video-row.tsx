"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { Button } from "#components/button";
import { VideoCard } from "#components/video-card";
import { type MediaItem } from "#lib/media";
import { cn } from "#lib/utils";

export function VideoRow({
  title,
  href,
  items,
  className,
}: {
  title?: string;
  href?: string;
  items: MediaItem[];
  className?: string;
}) {
  const scroller = React.useRef<HTMLDivElement>(null);

  function scrollBy(dir: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <section className={cn("space-y-3", className)}>
      {(title || href) && (
        <div className="flex items-end justify-between gap-4">
          {title && (
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
      <div
        ref={scroller}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2"
      >
        {items.map((item) => (
          <div key={item.id} className="w-64 shrink-0 snap-start sm:w-72">
            <VideoCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
