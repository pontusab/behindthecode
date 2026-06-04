import type { Video } from "@btc/db";
import { hasSigningKey, signPlaybackToken } from "@btc/mux";
import type { MediaItem } from "@btc/ui";
import { mdxComponents, Prose } from "@btc/ui/components/mdx";
import { MuxPlayer } from "@btc/ui/components/mux-player";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { type ReactNode, Suspense } from "react";
import {
  BrowserUpdatedIcon,
  LockIcon,
  PlayArrowIcon,
  SubtitlesIcon,
} from "@/components/home/icons";
import { BrandHeader, LandingFooter } from "@/components/home/landing";
import { Paywall } from "@/components/watch/paywall";
import { ViewBeacon } from "@/components/watch/view-beacon";
import {
  getCategoryByIdCached,
  getFeed,
  getSettingsCached,
  getVideoBySlugCached,
  toMediaItem,
} from "@/lib/catalog";
import { resolveWatchAccess } from "@/lib/entitlements";
import { getCurrentUser } from "@/lib/session";

const PLAYER_SKELETON = (
  <div className="aspect-video w-full animate-pulse rounded-lg bg-btc-surface" />
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const video = await getVideoBySlugCached(slug);
  if (!video || video.publishStatus !== "published") return {};
  const settings = await getSettingsCached();
  const ogImage = `/v/${slug}/opengraph-image`;
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

export default function VideoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="min-h-screen bg-btc-bg font-sans text-btc-text antialiased">
      <BrandHeader />

      <main className="mx-auto w-full max-w-[1728px] px-4 pb-24 pt-8 sm:px-10">
        <Suspense fallback={PLAYER_SKELETON}>
          <VideoContent params={params} />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
    </div>
  );
}

async function SiteFooter() {
  const settings = await getSettingsCached();
  return <LandingFooter siteName={settings.siteName} />;
}

async function VideoContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return videoContent(slug);
}

async function videoContent(slug: string) {
  const video = await getVideoBySlugCached(slug);
  if (!video || video.publishStatus !== "published") notFound();

  const category = video.categoryId
    ? await getCategoryByIdCached(video.categoryId)
    : null;

  let chapters: MediaItem[] = [];
  if (video.categoryId) {
    const feed = await getFeed({
      categoryId: video.categoryId,
      sort: "recent",
      limit: 50,
    });
    // Read the series in chronological order so chapter numbers follow the
    // natural course order.
    chapters = [...feed.items].sort(
      (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0),
    );
  }
  if (chapters.length === 0) {
    chapters = [toMediaItem({ ...video, views: 0, likes: 0 })];
  }

  return (
    <WatchLayout
      player={
        <Suspense fallback={PLAYER_SKELETON}>
          <PlayerArea video={video} />
        </Suspense>
      }
      title={video.title}
      body={
        video.description ? (
          <Prose>
            <MDXRemote source={video.description} components={mdxComponents} />
          </Prose>
        ) : null
      }
      seriesName={category?.name ?? "More videos"}
      chapters={chapters}
      activeSlug={video.slug}
    />
  );
}

function WatchLayout({
  player,
  title,
  body,
  seriesName,
  chapters,
  activeSlug,
}: {
  player: ReactNode;
  title: string;
  body: ReactNode;
  seriesName: string;
  chapters: MediaItem[];
  activeSlug: string;
}) {
  return (
    <>
      {player}

      <div className="mt-12 flex flex-col gap-12 lg:flex-row lg:gap-0">
        <article className="min-w-0 flex-1 lg:pr-12">
          <h1 className="max-w-[655px] text-[32px] font-medium leading-tight text-btc-text">
            {title}
          </h1>
          {body && <div className="mt-6">{body}</div>}
        </article>

        <aside className="w-full shrink-0 lg:w-[500px] lg:border-l lg:border-btc-border lg:pl-8">
          <SeriesSidebar
            seriesName={seriesName}
            chapters={chapters}
            activeSlug={activeSlug}
          />
        </aside>
      </div>
    </>
  );
}

async function PlayerArea({ video }: { video: Video }) {
  const user = await getCurrentUser();
  const access = await resolveWatchAccess(video, user);
  const item = toMediaItem({ ...video, views: 0, likes: 0 });

  if (!access.allowed) {
    return <Paywall item={item} access={access} />;
  }

  if (!video.playbackId) {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-lg bg-btc-surface text-btc-muted">
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
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <MuxPlayer
          className="size-full"
          playbackId={video.playbackId}
          title={video.title}
          accentColor="#ffffff"
          poster={video.customPosterUrl ?? undefined}
          tokens={tokens}
          metadata={{
            video_id: video.id,
            video_title: video.title,
            viewer_user_id: user?.id,
          }}
        />
      </div>
      <ViewBeacon videoId={video.id} />
    </>
  );
}

function durationLabel(seconds: number): string {
  if (seconds <= 0) return "—";
  const mins = Math.round(seconds / 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m} min`;
  return m ? `${h}h ${m} min` : `${h}h`;
}

function SeriesSidebar({
  seriesName,
  chapters,
  activeSlug,
}: {
  seriesName: string;
  chapters: MediaItem[];
  activeSlug: string;
}) {
  const totalSeconds = chapters.reduce((sum, c) => sum + (c.duration ?? 0), 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Series header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 border-b border-btc-border pb-4">
          <h2 className="text-[20px] font-medium leading-none text-btc-text">
            {seriesName}
          </h2>
          <div className="flex items-center gap-6 pt-1">
            <span className="flex items-center gap-2 font-mono text-[13px] text-btc-muted">
              <PlayArrowIcon className="size-4" />
              {chapters.length} {chapters.length === 1 ? "video" : "videos"}
            </span>
            <span className="flex items-center gap-2 font-mono text-[13px] text-btc-muted">
              <SubtitlesIcon className="size-4" />
              {durationLabel(totalSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[20px] font-medium leading-none text-btc-text">
          Chapters
        </h3>
        <ol className="flex flex-col gap-2">
          {chapters.map((chapter, i) => {
            const active = chapter.slug === activeSlug;
            const gated = chapter.access && chapter.access !== "free";
            if (active) {
              return (
                <li key={chapter.id}>
                  <div className="flex items-center gap-2.5 rounded-[100px] border border-btc-border bg-btc-surface px-4 py-2 text-[14px] font-medium text-btc-text">
                    <span>{i + 1}.</span>
                    <span className="truncate">{chapter.title}</span>
                  </div>
                </li>
              );
            }
            return (
              <li key={chapter.id}>
                <Link
                  href={`/v/${chapter.slug}`}
                  className="flex items-center gap-2.5 rounded-[4px] px-4 py-2 text-[14px] text-btc-text transition-colors hover:bg-btc-surface"
                >
                  {gated ? (
                    <LockIcon className="size-4 shrink-0 text-btc-muted" />
                  ) : (
                    <PlayArrowIcon className="size-4 shrink-0 text-btc-muted" />
                  )}
                  <span className="truncate">{chapter.title}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Video resources */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[20px] font-medium leading-none text-btc-text">
          Video resources
        </h3>
        <div className="flex flex-col gap-2">
          <ResourceRow icon={<BrowserUpdatedIcon className="size-4" />}>
            Download video
          </ResourceRow>
          <ResourceRow icon={<SubtitlesIcon className="size-4" />}>
            Repository
          </ResourceRow>
        </div>
      </div>
    </div>
  );
}

function ResourceRow({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="flex items-center gap-2.5 rounded-[4px] px-4 py-2 text-[14px] text-btc-text">
      <span className="shrink-0 text-btc-muted">{icon}</span>
      {children}
    </span>
  );
}
