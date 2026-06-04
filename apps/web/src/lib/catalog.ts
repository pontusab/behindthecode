import {
  cacheTags,
  categoryRepo,
  searchRepo,
  settingsRepo,
  tagRepo,
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
  return settingsRepo.getSettings();
}

export async function getCategoriesCached() {
  "use cache";
  cacheTag(cacheTags.categories);
  cacheLife("hours");
  return categoryRepo.listCategories();
}

export async function getCategoryMap(): Promise<Record<string, string>> {
  const cats = await getCategoriesCached();
  return Object.fromEntries(cats.map((c) => [c.id, c.name]));
}

export async function getTagsCached() {
  "use cache";
  cacheTag(cacheTags.tags);
  cacheLife("hours");
  return tagRepo.listTags();
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

  const page = await videoRepo.listPublished(opts);
  const items = await withCategoryNames(page.items);
  return {
    items,
    total: page.total,
    hasMore: page.hasMore,
    nextOffset: page.nextOffset,
  };
}

export async function getCarousel(
  source: "popular" | "latest",
  featuredIds: string[],
  limit = 8,
): Promise<MediaItem[]> {
  "use cache";
  cacheTag(cacheTags.videos);
  cacheLife("minutes");

  if (featuredIds.length > 0) {
    const vids = await videoRepo.listPublishedByIds(featuredIds);
    if (vids.length > 0) return withCategoryNames(vids);
  }
  const page = await videoRepo.listPublished({
    sort: source === "latest" ? "recent" : "popular",
    limit,
  });
  return withCategoryNames(page.items);
}

export async function getVideoBySlugCached(
  slug: string,
): Promise<Video | null> {
  "use cache";
  cacheTag(cacheTags.videoSlug(slug));
  cacheLife("hours");
  return videoRepo.getVideoBySlug(slug);
}

export async function getRelatedCached(video: Video): Promise<MediaItem[]> {
  "use cache";
  cacheTag(cacheTags.videos);
  cacheTag(cacheTags.video(video.id));
  cacheLife("minutes");
  const related = await videoRepo.getRelatedVideos(video);
  return withCategoryNames(related);
}

export async function searchVideos(query: string): Promise<MediaItem[]> {
  const ids = await searchRepo.searchVideoIds(query);
  if (ids.length === 0) return [];
  const videos = await videoRepo.listPublishedByIds(ids);
  return withCategoryNames(videos);
}
