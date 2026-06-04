import { ImageResponse } from "next/og";
import { getSettingsCached, getVideoBySlugCached } from "@/lib/catalog";

export const alt = "Video";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function muxPoster(
  playbackId: string | null,
  time?: number | null,
): string | null {
  if (!playbackId) return null;
  const params = new URLSearchParams({ width: "1200" });
  if (time != null) params.set("time", String(time));
  return `https://image.mux.com/${playbackId}/thumbnail.png?${params.toString()}`;
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [video, settings] = await Promise.all([
    getVideoBySlugCached(slug),
    getSettingsCached(),
  ]);

  const title = video?.title ?? settings.siteName;
  const poster =
    video?.customPosterUrl ??
    (video?.playbackPolicy === "signed"
      ? null
      : muxPoster(video?.playbackId ?? null, video?.thumbnailTime));

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        background: "#0a0a0f",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            objectFit: "cover",
            opacity: 0.5,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.2))",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 64,
          gap: 16,
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 28,
            opacity: 0.85,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
              display: "flex",
            }}
          />
          {settings.siteName}
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 1000,
          }}
        >
          {title.slice(0, 90)}
        </div>
      </div>
    </div>,
    size,
  );
}
