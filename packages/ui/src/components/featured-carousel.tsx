"use client";

import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import * as React from "react";
import { Button } from "#components/button";
import { animatedFor, type MediaItem, posterFor } from "#lib/media";
import { cn, formatCompact, formatDuration } from "#lib/utils";

export function FeaturedCarousel({
  items,
  sourceLabel,
  className,
  autoAdvanceMs = 7000,
}: {
  items: MediaItem[];
  sourceLabel?: string;
  className?: string;
  autoAdvanceMs?: number;
}) {
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const count = items.length;

  const go = React.useCallback(
    (dir: 1 | -1) => setActive((a) => (a + dir + count) % count),
    [count],
  );

  React.useEffect(() => {
    if (paused || count <= 1 || !autoAdvanceMs) return;
    const t = setInterval(
      () => setActive((a) => (a + 1) % count),
      autoAdvanceMs,
    );
    return () => clearInterval(t);
  }, [paused, count, autoAdvanceMs]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (count === 0) return null;

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative mx-auto flex h-[clamp(260px,46vw,560px)] max-w-6xl items-center justify-center overflow-hidden">
        {items.map((item, i) => {
          let offset = i - active;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          const abs = Math.abs(offset);
          if (abs > 2) return null;

          const isActive = offset === 0;
          return (
            <motion.div
              key={item.id}
              className="absolute"
              initial={false}
              animate={{
                x: `${offset * 54}%`,
                scale: isActive ? 1 : 0.78 - (abs - 1) * 0.08,
                opacity: isActive ? 1 : 0.45 - (abs - 1) * 0.18,
                filter: isActive ? "blur(0px)" : "blur(2px)",
                zIndex: 10 - abs,
              }}
              transition={{ type: "spring", stiffness: 220, damping: 30 }}
              style={{ width: "min(70%, 760px)" }}
            >
              <FeaturedCard
                item={item}
                active={isActive}
                onClick={() => !isActive && setActive(i)}
                sourceLabel={sourceLabel}
              />
            </motion.div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 sm:left-6"
            onClick={() => go(-1)}
            aria-label="Previous"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 sm:right-6"
            onClick={() => go(1)}
            aria-label="Next"
          >
            <ChevronRight className="size-5" />
          </Button>

          <div className="mt-5 flex items-center justify-center gap-2">
            {items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setActive(i)}
                aria-label={`Go to ${item.title}`}
                className={cn(
                  "h-1.5 transition-all",
                  i === active
                    ? "w-7 bg-foreground"
                    : "w-1.5 bg-border hover:bg-muted-foreground",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FeaturedCard({
  item,
  active,
  onClick,
  sourceLabel,
}: {
  item: MediaItem;
  active: boolean;
  onClick: () => void;
  sourceLabel?: string;
}) {
  const poster = posterFor(item, 1280);
  const animated = animatedFor(item, 960);

  const inner = (
    <div className="group relative aspect-video w-full overflow-hidden border border-border bg-muted">
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {active && animated && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={animated}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-5 sm:p-8">
        {sourceLabel && active && (
          <span className="w-fit bg-background px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-foreground">
            {sourceLabel}
          </span>
        )}
        <h2 className="max-w-2xl text-balance text-xl font-semibold leading-tight text-white sm:text-3xl">
          {item.title}
        </h2>
        <div className="flex items-center gap-3 text-sm text-white/85">
          {item.categoryName && <span>{item.categoryName}</span>}
          <span>{formatCompact(item.views ?? 0)} views</span>
          {item.duration ? <span>{formatDuration(item.duration)}</span> : null}
        </div>
        {active && (
          <Button
            asChild
            size="lg"
            className="mt-1 w-fit bg-background text-foreground hover:bg-background hover:opacity-90"
          >
            <Link href={`/watch/${item.slug}`}>
              <Play className="size-5 fill-current" /> Play now
            </Link>
          </Button>
        )}
      </div>
    </div>
  );

  if (active) return inner;
  return (
    <button
      onClick={onClick}
      className="block w-full text-left"
      aria-label={`Show ${item.title}`}
    >
      {inner}
    </button>
  );
}
