import { getMux, hasSigningKey, Mux } from "./client";

export { getMux, hasSigningKey, Mux };

export type PlaybackPolicy = "public" | "signed";
export type TokenType = "video" | "thumbnail" | "gif" | "storyboard";

const IMAGE_HOST = "https://image.mux.com";
const STREAM_HOST = "https://stream.mux.com";

/* ───────────────────────── Uploads ───────────────────────── */

export type CreateUploadOptions = {
  corsOrigin: string;
  /** "public" for free videos, "signed" for gated content. */
  policy?: PlaybackPolicy;
  /** Auto-generate English captions for accessibility + SEO. */
  generateCaptions?: boolean;
};

export async function createDirectUpload(opts: CreateUploadOptions): Promise<{
  id: string;
  url: string;
}> {
  const mux = getMux();
  const policy: PlaybackPolicy = opts.policy ?? "public";
  const upload = await mux.video.uploads.create({
    cors_origin: opts.corsOrigin,
    new_asset_settings: {
      playback_policies: [policy],
      mp4_support: "none",
      ...(opts.generateCaptions !== false
        ? {
            inputs: [
              {
                generated_subtitles: [{ language_code: "en", name: "English" }],
              },
            ],
          }
        : {}),
    },
  });
  if (!upload.url) throw new Error("Mux did not return an upload URL.");
  return { id: upload.id, url: upload.url };
}

export async function getUpload(uploadId: string) {
  return getMux().video.uploads.retrieve(uploadId);
}

/* ───────────────────────── Assets ───────────────────────── */

export async function getAsset(assetId: string) {
  return getMux().video.assets.retrieve(assetId);
}

export async function deleteAsset(assetId: string): Promise<void> {
  try {
    await getMux().video.assets.delete(assetId);
  } catch {
    // ignore — asset may already be gone
  }
}

/** Add a playback ID with a given policy to an existing asset. */
export async function addPlaybackId(
  assetId: string,
  policy: PlaybackPolicy,
): Promise<string> {
  const pb = await getMux().video.assets.createPlaybackId(assetId, { policy });
  return pb.id;
}

/** Returns the id of the first ready text (caption) track, if any. */
export async function getReadyTextTrackId(
  assetId: string,
): Promise<string | null> {
  try {
    const asset = await getAsset(assetId);
    const track = asset.tracks?.find(
      (t) => t.type === "text" && t.status === "ready",
    );
    return track?.id ?? null;
  } catch {
    return null;
  }
}

/* ───────────────────────── Webhooks ───────────────────────── */

export async function unwrapWebhook(body: string, headers: Headers) {
  return getMux().webhooks.unwrap(body, headers);
}

/* ───────────────────────── Signed playback ───────────────────────── */

export async function signPlaybackToken(
  playbackId: string,
  type: TokenType,
  params: Record<string, string> = {},
  expiration = "12h",
): Promise<string> {
  return getMux().jwt.signPlaybackId(playbackId, {
    type,
    expiration,
    params,
  });
}

/**
 * For a signed video, returns the tokens Mux Player needs
 * (playback + thumbnail + storyboard).
 */
export async function signPlaybackTokens(
  playbackId: string,
  expiration = "12h",
) {
  const mux = getMux();
  const tokens = await mux.jwt.signPlaybackId(playbackId, {
    type: ["video", "thumbnail", "storyboard"],
    expiration,
  });
  return tokens;
}

/* ───────────────────────── Image / preview URLs ───────────────────────── */

export function thumbnailUrl(
  playbackId: string,
  opts: {
    time?: number;
    width?: number;
    height?: number;
    fitMode?: string;
    token?: string;
  } = {},
): string {
  const params = new URLSearchParams();
  if (opts.time != null) params.set("time", String(opts.time));
  if (opts.width) params.set("width", String(opts.width));
  if (opts.height) params.set("height", String(opts.height));
  if (opts.fitMode) params.set("fit_mode", opts.fitMode);
  if (opts.token) params.set("token", opts.token);
  const qs = params.toString();
  return `${IMAGE_HOST}/${playbackId}/thumbnail.jpg${qs ? `?${qs}` : ""}`;
}

export function animatedPreviewUrl(
  playbackId: string,
  opts: { width?: number; start?: number; end?: number; token?: string } = {},
): string {
  const params = new URLSearchParams();
  params.set("width", String(opts.width ?? 320));
  if (opts.start != null) params.set("start", String(opts.start));
  if (opts.end != null) params.set("end", String(opts.end));
  if (opts.token) params.set("token", opts.token);
  return `${IMAGE_HOST}/${playbackId}/animated.webp?${params.toString()}`;
}

export function storyboardUrl(playbackId: string, token?: string): string {
  return `${IMAGE_HOST}/${playbackId}/storyboard.vtt${token ? `?token=${token}` : ""}`;
}

export function captionsVttUrl(
  playbackId: string,
  trackId: string,
  token?: string,
): string {
  return `${STREAM_HOST}/${playbackId}/text/${trackId}.vtt${token ? `?token=${token}` : ""}`;
}

/* ───────────────────────── Transcript ───────────────────────── */

/** Fetch a caption VTT and strip it down to plain text. */
export async function fetchTranscript(
  playbackId: string,
  trackId: string,
  token?: string,
): Promise<string | null> {
  try {
    const res = await fetch(captionsVttUrl(playbackId, trackId, token));
    if (!res.ok) return null;
    const vtt = await res.text();
    return vttToText(vtt);
  } catch {
    return null;
  }
}

function vttToText(vtt: string): string {
  const lines = vtt.split(/\r?\n/);
  const out: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed === "WEBVTT") continue;
    if (/^\d+$/.test(trimmed)) continue; // cue number
    if (trimmed.includes("-->")) continue; // timestamp
    if (trimmed.startsWith("NOTE")) continue;
    out.push(trimmed.replace(/<[^>]+>/g, ""));
  }
  // Collapse consecutive duplicate lines (common in rolling captions).
  const deduped: string[] = [];
  for (const l of out) {
    if (deduped[deduped.length - 1] !== l) deduped.push(l);
  }
  return deduped.join(" ");
}

/* ───────────────────────── Mux Data (analytics) ───────────────────────── */

export type MuxDataMetric =
  | "views"
  | "unique_viewers"
  | "playing_time"
  | "video_startup_time"
  | "playback_failure_percentage";

/** Overall value for a Mux Data metric. Returns null on error/no data. */
export async function getMuxDataOverall(
  metric: MuxDataMetric,
  opts: { days?: number } = {},
): Promise<{ value: number | null; totalViews: number | null }> {
  try {
    const mux = getMux();
    const days = opts.days ?? 30;
    const res = await mux.data.metrics.getOverallValues(metric, {
      timeframe: [`${days}:days`],
    });
    return {
      value: res.data?.value ?? null,
      totalViews: res.data?.total_views ?? null,
    };
  } catch {
    return { value: null, totalViews: null };
  }
}
