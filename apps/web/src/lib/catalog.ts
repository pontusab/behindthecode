import {
  cacheTags,
  categoryRepo,
  defaultSettings,
  isDbConfigured,
  settingsRepo,
  type Video,
  type VideoSort,
  type VideoWithStats,
  videoRepo,
} from "@btc/db";
import type { MediaItem } from "@btc/ui";
import { cacheLife, cacheTag } from "next/cache";

export function toMediaItem(
  v: VideoWithStats,
  categoryName?: string | null,
): MediaItem {
  return {
    id: v.id,
    title: v.title,
    slug: v.slug,
    playbackId: v.playbackId,
    thumbnailTime: v.thumbnailTime,
    customPosterUrl: v.customPosterUrl,
    duration: v.duration,
    views: v.views,
    likes: v.likes,
    access: v.access,
    categoryName: categoryName ?? null,
    createdAt: v.publishedAt ?? v.createdAt,
  };
}

export async function getSettingsCached() {
  "use cache";
  cacheTag(cacheTags.settings);
  cacheLife("hours");
  if (!isDbConfigured()) return defaultSettings;
  return settingsRepo.getSettings();
}

export async function getCategoriesCached() {
  "use cache";
  cacheTag(cacheTags.categories);
  cacheLife("hours");
  if (!isDbConfigured()) return [];
  return categoryRepo.listCategories();
}

export async function getCategoryBySlugCached(slug: string) {
  "use cache";
  cacheTag(cacheTags.categories);
  cacheLife("hours");
  if (!isDbConfigured()) return null;
  return categoryRepo.getCategoryBySlug(slug);
}

export async function getCategoryMap(): Promise<Record<string, string>> {
  const cats = await getCategoriesCached();
  return Object.fromEntries(cats.map((c) => [c.id, c.name]));
}

export async function getCategoryByIdCached(id: string) {
  const cats = await getCategoriesCached();
  return cats.find((c) => c.id === id) ?? null;
}

async function withCategoryNames(
  videos: VideoWithStats[],
): Promise<MediaItem[]> {
  const map = await getCategoryMap();
  return videos.map((v) =>
    toMediaItem(v, v.categoryId ? map[v.categoryId] : null),
  );
}

export type FeedResult = {
  items: MediaItem[];
  total: number;
  hasMore: boolean;
  nextOffset: number;
};

export async function getFeed(opts: {
  sort?: VideoSort;
  offset?: number;
  limit?: number;
  categoryId?: string;
  tag?: string;
}): Promise<FeedResult> {
  "use cache";
  cacheTag(cacheTags.videos);
  if (opts.categoryId) cacheTag(cacheTags.category(opts.categoryId));
  if (opts.tag) cacheTag(cacheTags.tag(opts.tag));
  cacheLife("minutes");

  if (!isDbConfigured()) {
    return { items: [], total: 0, hasMore: false, nextOffset: 0 };
  }

  const page = await videoRepo.listPublished(opts);
  const items = await withCategoryNames(page.items);
  return {
    items,
    total: page.total,
    hasMore: page.hasMore,
    nextOffset: page.nextOffset,
  };
}

export async function getVideoBySlugCached(
  slug: string,
): Promise<Video | null> {
  "use cache";
  cacheTag(cacheTags.videoSlug(slug));
  cacheLife("hours");
  if (!isDbConfigured()) return null;
  return videoRepo.getVideoBySlug(slug);
}

/** Slugs for published videos — used by generateStaticParams at build time. */
export async function getPublishedVideoSlugsCached(): Promise<string[]> {
  "use cache";
  cacheTag(cacheTags.videos);
  cacheLife("hours");
  if (!isDbConfigured()) return [];
  const page = await videoRepo.listPublished({ limit: 500, sort: "recent" });
  return page.items.map((v) => v.slug);
}

/** Category slugs — used by generateStaticParams at build time. */
export async function getCategorySlugsCached(): Promise<string[]> {
  const categories = await getCategoriesCached();
  return categories.map((c) => c.slug);
}
