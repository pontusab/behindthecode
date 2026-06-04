"use client";

import { Clock } from "lucide-react";
import * as React from "react";
import { dispatchSeek } from "#components/mux-player";
import { cn, formatDuration } from "#lib/utils";

export function SeekButton({
  seconds,
  label,
  className,
}: {
  seconds: number;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => dispatchSeek(seconds)}
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 align-baseline font-medium text-primary tabular-nums transition-colors hover:bg-primary/20",
        className,
      )}
    >
      <Clock className="size-3" />
      {label ?? formatDuration(seconds)}
    </button>
  );
}

/** Parse `#t=83` or `#t=1:23` style hrefs into seconds. */
export function parseTimestampHref(href?: string): number | null {
  if (!href) return null;
  const m = href.match(/^#t=(.+)$/);
  if (!m) return null;
  const raw = m[1]!;
  if (/^\d+(\.\d+)?$/.test(raw)) return Number(raw);
  const parts = raw.split(":").map(Number);
  if (parts.some((n) => Number.isNaN(n))) return null;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}
