import { getDb } from "../client";
import type { Database } from "../database.types";
import { slugify } from "../id";
import { rowToVideo } from "../mappers";
import type { Page, Video, VideoSort, VideoWithStats } from "../types";

type VideoUpdate = Database["public"]["Tables"]["videos"]["Update"];

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const db = getDb();
  const root = slugify(base) || "video";
  let slug = root;
  let n = 1;
  for (;;) {
    const { data } = await db
      .from("videos")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data || data.id === excludeId) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

export async function getVideo(id: string): Promise<Video | null> {
  const { data } = await getDb()
    .from("videos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? rowToVideo(data) : null;
}

export async function getVideoBySlug(slug: string): Promise<Video | null> {
  const { data } = await getDb()
    .from("videos")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ? rowToVideo(data) : null;
}

export async function getVideos(ids: string[]): Promise<Video[]> {
  if (ids.length === 0) return [];
  const { data } = await getDb().from("videos").select("*").in("id", ids);
  const byId = new Map((data ?? []).map((r) => [r.id, rowToVideo(r)]));
  return ids
    .map((id) => byId.get(id))
    .filter((v): v is VideoWithStats => Boolean(v));
}

export async function getEngagement(
  videoId: string,
): Promise<{ views: number; likes: number }> {
  const { data } = await getDb()
    .from("videos")
    .select("view_count, like_count")
    .eq("id", videoId)
    .maybeSingle();
  return {
    views: Number(data?.view_count ?? 0),
    likes: Number(data?.like_count ?? 0),
  };
}

/** Rows already carry counts; kept for API compatibility. */
export async function attachStats(videos: Video[]): Promise<VideoWithStats[]> {
  return videos.map((v) => ({
    ...v,
    views: (v as VideoWithStats).views ?? 0,
    likes: (v as VideoWithStats).likes ?? 0,
  }));
}

export type CreateVideoInput = {
  title: string;
  description?: string;
  categoryId?: string | null;
  tags?: string[];
  access?: Video["access"];
  visibility?: Video["visibility"];
  muxUploadId?: string | null;
  playbackPolicy?: Video["playbackPolicy"];
};

export async function createVideo(input: CreateVideoInput): Promise<Video> {
  const db = getDb();
  const slug = await uniqueSlug(input.title || "video");
  const { data, error } = await db
    .from("videos")
    .insert({
      title: input.title,
      slug,
      description: input.description ?? "",
      processing_status: "uploading",
      publish_status: "draft",
      mux_upload_id: input.muxUploadId ?? null,
      playback_policy: input.playbackPolicy ?? "public",
      category_id: input.categoryId ?? null,
      tags: input.tags ?? [],
      access: input.access ?? "free",
      visibility: input.visibility ?? "public",
    })
    .select("*")
    .single();
  if (error || !data)
    throw new Error(error?.message ?? "Failed to create video");
  return rowToVideo(data);
}

export type UpdateVideoInput = Partial<
  Pick<
    Video,
    | "title"
    | "description"
    | "categoryId"
    | "tags"
    | "access"
    | "requiredPlanIds"
    | "polarProductId"
    | "priceAmount"
    | "visibility"
    | "thumbnailTime"
    | "customPosterUrl"
    | "playbackPolicy"
    | "slug"
  >
>;

export async function updateVideo(
  id: string,
  patch: UpdateVideoInput,
): Promise<Video | null> {
  const db = getDb();
  const existing = await getVideo(id);
  if (!existing) return null;

  let slug = existing.slug;
  if (patch.slug && patch.slug !== existing.slug) {
    slug = await uniqueSlug(patch.slug, id);
  }

  const update: VideoUpdate = { slug };
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.categoryId !== undefined) update.category_id = patch.categoryId;
  if (patch.tags !== undefined) update.tags = patch.tags;
  if (patch.access !== undefined) update.access = patch.access;
  if (patch.requiredPlanIds !== undefined)
    update.required_plan_ids = patch.requiredPlanIds;
  if (patch.polarProductId !== undefined)
    update.polar_product_id = patch.polarProductId;
  if (patch.priceAmount !== undefined) update.price_amount = patch.priceAmount;
  if (patch.visibility !== undefined) update.visibility = patch.visibility;
  if (patch.thumbnailTime !== undefined)
    update.thumbnail_time = patch.thumbnailTime;
  if (patch.customPosterUrl !== undefined)
    update.custom_poster_url = patch.customPosterUrl;
  if (patch.playbackPolicy !== undefined)
    update.playback_policy = patch.playbackPolicy;

  const { data } = await db
    .from("videos")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  return data ? rowToVideo(data) : null;
}

/** Called by the Mux webhook when an asset is ready. */
export async function markVideoReady(
  id: string,
  data: {
    muxAssetId: string;
    playbackId: string;
    playbackPolicy: Video["playbackPolicy"];
    duration: number | null;
    aspectRatio: string | null;
  },
): Promise<Video | null> {
  const existing = await getVideo(id);
  if (!existing) return null;
  const thumbnailTime =
    existing.thumbnailTime ??
    (data.duration ? Math.min(data.duration / 2, 5) : null);
  const { data: row } = await getDb()
    .from("videos")
    .update({
      processing_status: "ready",
      mux_asset_id: data.muxAssetId,
      playback_id: data.playbackId,
      playback_policy: data.playbackPolicy,
      duration: data.duration,
      aspect_ratio: data.aspectRatio,
      thumbnail_time: thumbnailTime,
    })
    .eq("id", id)
    .select("*")
    .single();
  return row ? rowToVideo(row) : null;
}

export async function findVideoByUploadId(
  uploadId: string,
): Promise<Video | null> {
  const { data } = await getDb()
    .from("videos")
    .select("*")
    .eq("mux_upload_id", uploadId)
    .limit(1)
    .maybeSingle();
  return data ? rowToVideo(data) : null;
}

export async function findVideoByAssetId(
  assetId: string,
): Promise<Video | null> {
  const { data } = await getDb()
    .from("videos")
    .select("*")
    .eq("mux_asset_id", assetId)
    .limit(1)
    .maybeSingle();
  return data ? rowToVideo(data) : null;
}

export async function publishVideo(id: string): Promise<Video | null> {
  const db = getDb();
  const video = await getVideo(id);
  if (!video) return null;
  const publishedAt = video.publishedAt ?? Date.now();
  const { data } = await db
    .from("videos")
    .update({
      publish_status: "published",
      published_at: new Date(publishedAt).toISOString(),
      publish_at: null,
    })
    .eq("id", id)
    .select("*")
    .single();
  return data ? rowToVideo(data) : null;
}

export async function unpublishVideo(id: string): Promise<Video | null> {
  const { data } = await getDb()
    .from("videos")
    .update({ publish_status: "draft", publish_at: null })
    .eq("id", id)
    .select("*")
    .single();
  return data ? rowToVideo(data) : null;
}

export async function scheduleVideo(
  id: string,
  publishAt: number,
): Promise<Video | null> {
  const { data } = await getDb()
    .from("videos")
    .update({
      publish_status: "scheduled",
      publish_at: new Date(publishAt).toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  return data ? rowToVideo(data) : null;
}

/** Returns ids of scheduled videos whose publishAt is due (<= now). */
export async function getDueScheduled(now = Date.now()): Promise<string[]> {
  const { data } = await getDb()
    .from("videos")
    .select("id")
    .eq("publish_status", "scheduled")
    .lte("publish_at", new Date(now).toISOString());
  return (data ?? []).map((r) => r.id);
}

export async function deleteVideo(id: string): Promise<Video | null> {
  const video = await getVideo(id);
  if (!video) return null;
  await getDb().from("videos").delete().eq("id", id);
  return video;
}

export type ListPublishedOptions = {
  sort?: VideoSort;
  offset?: number;
  limit?: number;
  categoryId?: string;
  tag?: string;
};

export async function listPublished(
  opts: ListPublishedOptions = {},
): Promise<Page<VideoWithStats>> {
  const { sort = "popular", offset = 0, limit = 24, categoryId, tag } = opts;
  let query = getDb()
    .from("videos")
    .select("*", { count: "exact" })
    .eq("publish_status", "published")
    .eq("visibility", "public");

  if (categoryId) query = query.eq("category_id", categoryId);
  if (tag) query = query.contains("tags", [tag]);

  const sortCol =
    sort === "recent"
      ? "published_at"
      : sort === "liked"
        ? "like_count"
        : "view_count";
  query = query
    .order(sortCol, { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  const { data, count } = await query;
  const total = count ?? 0;
  return {
    items: (data ?? []).map(rowToVideo),
    total,
    hasMore: offset + limit < total,
    nextOffset: offset + limit,
  };
}

export async function listPublishedByIds(
  ids: string[],
): Promise<VideoWithStats[]> {
  if (ids.length === 0) return [];
  const { data } = await getDb()
    .from("videos")
    .select("*")
    .in("id", ids)
    .eq("publish_status", "published");
  const byId = new Map((data ?? []).map((r) => [r.id, rowToVideo(r)]));
  return ids
    .map((id) => byId.get(id))
    .filter((v): v is VideoWithStats => Boolean(v));
}

export type ListAdminOptions = {
  offset?: number;
  limit?: number;
  status?: Video["publishStatus"];
  query?: string;
};

export async function listAdminVideos(
  opts: ListAdminOptions = {},
): Promise<Page<VideoWithStats>> {
  const { offset = 0, limit = 20, status, query } = opts;
  let q = getDb().from("videos").select("*", { count: "exact" });
  if (status) q = q.eq("publish_status", status);
  if (query) q = q.or(`title.ilike.%${query}%,slug.ilike.%${query}%`);
  q = q
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, count } = await q;
  const total = count ?? 0;
  return {
    items: (data ?? []).map(rowToVideo),
    total,
    hasMore: offset + limit < total,
    nextOffset: offset + limit,
  };
}

export async function getRelatedVideos(
  video: Video,
  limit = 8,
): Promise<VideoWithStats[]> {
  const db = getDb();
  let rows: VideoWithStats[] = [];
  if (video.categoryId) {
    const { data } = await db
      .from("videos")
      .select("*")
      .eq("publish_status", "published")
      .eq("visibility", "public")
      .eq("category_id", video.categoryId)
      .neq("id", video.id)
      .order("view_count", { ascending: false })
      .limit(limit);
    rows = (data ?? []).map(rowToVideo);
  }
  if (rows.length === 0) {
    const { data } = await db
      .from("videos")
      .select("*")
      .eq("publish_status", "published")
      .eq("visibility", "public")
      .neq("id", video.id)
      .order("view_count", { ascending: false })
      .limit(limit);
    rows = (data ?? []).map(rowToVideo);
  }
  return rows.slice(0, limit);
}
