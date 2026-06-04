import { engagementRepo, type Video } from "@btc/db";
import {
  fetchTranscript,
  getReadyTextTrackId,
  hasSigningKey,
  signPlaybackToken,
} from "@btc/mux";
import { formatCompact, formatRelativeTime, posterFor } from "@btc/ui";
import { mdxComponents, Prose } from "@btc/ui/components/mdx";
import { MuxPlayer } from "@btc/ui/components/mux-player";
import { Eye } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Suspense } from "react";
import { Comments } from "@/components/watch/comments";
import { LikeButton } from "@/components/watch/like-button";
import { Paywall } from "@/components/watch/paywall";
import { Transcript } from "@/components/watch/transcript";
import { ViewBeacon } from "@/components/watch/view-beacon";
import {
  getRelatedCached,
  getSettingsCached,
  getVideoBySlugCached,
  toMediaItem,
} from "@/lib/catalog";
import { resolveWatchAccess } from "@/lib/entitlements";
import { getCurrentUser } from "@/lib/session";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideoBySlugCached(slug);
  if (!video || video.publishStatus !== "published") return {};
  const settings = await getSettingsCached();
  const ogImage = `/watch/${slug}/opengraph-image`;
  const description =
    video.description.slice(0, 200) || settings.defaultDescription;
  return {
    title: video.title,
    description,
    openGraph: {
      title: video.title,
      description,
      type: "video.other",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: video.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const video = await getVideoBySlugCached(slug);
  if (!video || video.publishStatus !== "published") notFound();

  const settings = await getSettingsCached();

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0 space-y-5">
        <Suspense
          fallback={
            <div className="aspect-video w-full animate-pulse rounded-2xl bg-muted" />
          }
        >
          <PlayerArea video={video} accent={settings.accentColor} />
        </Suspense>

        <div className="space-y-3">
          <h1 className="text-balance text-2xl font-bold tracking-tight">
            {video.title}
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Suspense
              fallback={
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              }
            >
              <ViewStats video={video} />
            </Suspense>
            <Suspense fallback={null}>
              <LikeArea video={video} />
            </Suspense>
          </div>
          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {video.tags.map((t) => (
                <Link
                  key={t}
                  href={`/tag/${t}`}
                  className="rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>

        {video.description && (
          <div className="glass rounded-2xl p-5">
            <Prose>
              <MDXRemote
                source={video.description}
                components={mdxComponents}
              />
            </Prose>
          </div>
        )}

        <Suspense fallback={null}>
          <TranscriptArea video={video} />
        </Suspense>

        <Suspense
          fallback={<div className="h-40 animate-pulse rounded-2xl bg-muted" />}
        >
          <Comments videoId={video.id} />
        </Suspense>
      </div>

      <aside className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Up next
        </h2>
        <Suspense fallback={null}>
          <Related video={video} />
        </Suspense>
      </aside>
    </div>
  );
}

async function PlayerArea({ video, accent }: { video: Video; accent: string }) {
  const user = await getCurrentUser();
  const access = await resolveWatchAccess(video, user);
  const item = toMediaItem({ ...video, views: 0, likes: 0 });

  if (!access.allowed) {
    return <Paywall item={item} access={access} />;
  }

  if (!video.playbackId) {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-2xl bg-muted text-muted-foreground">
        This video is still processing.
      </div>
    );
  }

  const signed = video.playbackPolicy === "signed" && hasSigningKey();
  let tokens:
    | { playback?: string; thumbnail?: string; storyboard?: string }
    | undefined;
  if (signed) {
    const [playback, thumbnail, storyboard] = await Promise.all([
      signPlaybackToken(video.playbackId, "video"),
      signPlaybackToken(video.playbackId, "thumbnail"),
      signPlaybackToken(video.playbackId, "storyboard"),
    ]);
    tokens = { playback, thumbnail, storyboard };
  }

  return (
    <>
      <MuxPlayer
        playbackId={video.playbackId}
        title={video.title}
        accentColor={accent}
        poster={video.customPosterUrl ?? undefined}
        tokens={tokens}
        metadata={{
          video_id: video.id,
          video_title: video.title,
          viewer_user_id: user?.id,
        }}
      />
      <ViewBeacon videoId={video.id} />
    </>
  );
}

async function ViewStats({ video }: { video: Video }) {
  const views = await engagementRepo.getViews(video.id);
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <Eye className="size-4" /> {formatCompact(views)} views
      </span>
      {video.publishedAt && (
        <span>· {formatRelativeTime(video.publishedAt)}</span>
      )}
    </div>
  );
}

async function LikeArea({ video }: { video: Video }) {
  const user = await getCurrentUser();
  const state = await engagementRepo.getLikeState(video.id, user?.id ?? null);
  return (
    <LikeButton
      videoId={video.id}
      initialLikes={state.likes}
      initialLiked={state.liked}
      isSignedIn={Boolean(user)}
    />
  );
}

async function TranscriptArea({ video }: { video: Video }) {
  if (!video.muxAssetId || !video.playbackId) return null;
  try {
    const trackId = await getReadyTextTrackId(video.muxAssetId);
    if (!trackId) return null;
    let token: string | undefined;
    if (video.playbackPolicy === "signed" && hasSigningKey()) {
      token = await signPlaybackToken(video.playbackId, "video");
    }
    const text = await fetchTranscript(video.playbackId, trackId, token);
    if (!text) return null;
    return <Transcript text={text} />;
  } catch {
    return null;
  }
}

async function Related({ video }: { video: Video }) {
  const items = await getRelatedCached(video);
  if (items.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/watch/${item.slug}`}
          className="group flex gap-3"
        >
          <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-muted">
            {posterFor(item) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={posterFor(item)!}
                alt={item.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            )}
          </div>
          <div className="min-w-0 space-y-1">
            <h3 className="line-clamp-2 text-sm font-medium group-hover:text-primary">
              {item.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatCompact(item.views ?? 0)} views
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
