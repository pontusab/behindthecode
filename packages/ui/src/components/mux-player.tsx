"use client";

import MuxPlayerReact from "@mux/mux-player-react";
import * as React from "react";
import { cn } from "#lib/utils";

export const SEEK_EVENT = "behindthecode:seek";

/** Dispatch a seek to the active player (used by transcript + MDX timestamps). */
export function dispatchSeek(seconds: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SEEK_EVENT, { detail: { seconds } }));
}

export type MuxPlayerProps = {
  playbackId: string;
  title?: string;
  poster?: string;
  accentColor?: string;
  startTime?: number;
  tokens?: { playback?: string; thumbnail?: string; storyboard?: string };
  metadata?: {
    video_id?: string;
    video_title?: string;
    viewer_user_id?: string;
  };
  autoPlay?: boolean;
  muted?: boolean;
  streamType?: "on-demand" | "live";
  className?: string;
};

export function MuxPlayer({
  playbackId,
  title,
  poster,
  accentColor = "#8b5cf6",
  startTime,
  tokens,
  metadata,
  autoPlay,
  muted,
  streamType = "on-demand",
  className,
}: MuxPlayerProps) {
  const ref = React.useRef<React.ComponentRef<typeof MuxPlayerReact> | null>(
    null,
  );

  React.useEffect(() => {
    function onSeek(e: Event) {
      const detail = (e as CustomEvent<{ seconds: number }>).detail;
      const el = ref.current;
      if (!el || !detail) return;
      el.currentTime = detail.seconds;
      void el.play?.();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    window.addEventListener(SEEK_EVENT, onSeek);
    return () => window.removeEventListener(SEEK_EVENT, onSeek);
  }, []);

  return (
    <MuxPlayerReact
      ref={ref}
      playbackId={playbackId}
      tokens={tokens}
      metadata={metadata}
      startTime={startTime}
      poster={poster}
      title={title}
      autoPlay={autoPlay}
      muted={muted}
      accentColor={accentColor}
      streamType={streamType}
      className={cn(
        "aspect-video w-full overflow-hidden rounded-2xl",
        className,
      )}
    />
  );
}
