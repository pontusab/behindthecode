import { getDb } from "../client";

const VIEW_DEDUPE_SECONDS = 60 * 60 * 12; // 12h

async function currentViews(videoId: string): Promise<number> {
  const { data } = await getDb()
    .from("videos")
    .select("view_count")
    .eq("id", videoId)
    .maybeSingle();
  return Number(data?.view_count ?? 0);
}

/**
 * Increment a video's view count, deduped per session fingerprint for a window.
 * Returns the new total.
 */
export async function incrementView(
  videoId: string,
  fingerprint: string,
): Promise<number> {
  const db = getDb();
  const { data: allowed } = await db.rpc("check_rate_limit", {
    p_key: `view:${videoId}:${fingerprint}`,
    p_max: 1,
    p_window_seconds: VIEW_DEDUPE_SECONDS,
  });
  if (allowed === false) return currentViews(videoId);

  const { data } = await db.rpc("increment_view", { p_video_id: videoId });
  return Number(data ?? 0);
}

export async function getViews(videoId: string): Promise<number> {
  return currentViews(videoId);
}

export async function getLikes(videoId: string): Promise<number> {
  const { data } = await getDb()
    .from("videos")
    .select("like_count")
    .eq("id", videoId)
    .maybeSingle();
  return Number(data?.like_count ?? 0);
}

export async function hasLiked(
  videoId: string,
  userId: string,
): Promise<boolean> {
  const { data } = await getDb()
    .from("likes")
    .select("video_id")
    .eq("video_id", videoId)
    .eq("user_id", userId)
    .maybeSingle();
  return data != null;
}

export async function getLikeState(
  videoId: string,
  userId: string | null,
): Promise<{ likes: number; liked: boolean }> {
  const likes = await getLikes(videoId);
  if (!userId) return { likes, liked: false };
  const liked = await hasLiked(videoId, userId);
  return { likes, liked };
}

/** Toggle a user's like; returns the new like count and state. */
export async function toggleLike(
  videoId: string,
  userId: string,
): Promise<{ likes: number; liked: boolean }> {
  const db = getDb();
  const already = await hasLiked(videoId, userId);
  if (already) {
    await db
      .from("likes")
      .delete()
      .eq("video_id", videoId)
      .eq("user_id", userId);
  } else {
    await db.from("likes").insert({ video_id: videoId, user_id: userId });
  }
  const likes = await getLikes(videoId);
  return { likes, liked: !already };
}
