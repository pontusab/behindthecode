/** Minimal shape the UI needs to render a video — decoupled from the db package. */
export type MediaItem = {
  id: string;
  title: string;
  slug: string;
  playbackId: string | null;
  thumbnailTime?: number | null;
  customPosterUrl?: string | null;
  duration?: number | null;
  views?: number;
  likes?: number;
  categoryName?: string | null;
  access?: "free" | "subscribers" | "purchase";
  createdAt?: number;
};

const IMAGE_HOST = "https://image.mux.com";

export function posterFor(item: MediaItem, width = 640): string | null {
  if (item.customPosterUrl) return item.customPosterUrl;
  if (!item.playbackId) return null;
  const params = new URLSearchParams({ width: String(width) });
  if (item.thumbnailTime != null)
    params.set("time", String(item.thumbnailTime));
  return `${IMAGE_HOST}/${item.playbackId}/thumbnail.webp?${params.toString()}`;
}

export function animatedFor(item: MediaItem, width = 480): string | null {
  if (!item.playbackId) return null;
  return `${IMAGE_HOST}/${item.playbackId}/animated.webp?width=${width}`;
}
