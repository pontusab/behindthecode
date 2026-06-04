"use client";

import * as React from "react";

export function ViewBeacon({ videoId }: { videoId: string }) {
  React.useEffect(() => {
    const key = `ot:viewed:${videoId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const timer = setTimeout(() => {
      fetch(`/api/videos/${videoId}/view`, {
        method: "POST",
        keepalive: true,
      }).catch(() => {});
    }, 4000);
    return () => clearTimeout(timer);
  }, [videoId]);

  return null;
}
