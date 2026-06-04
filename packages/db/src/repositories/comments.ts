import { getDb } from "../client";
import { rowToComment } from "../mappers";
import type { Comment, CommentStatus } from "../types";

export async function createComment(input: {
  videoId: string;
  userId: string;
  authorName: string;
  authorImage?: string | null;
  body: string;
  status?: CommentStatus;
  aiReason?: string | null;
}): Promise<Comment> {
  const { data, error } = await getDb()
    .from("comments")
    .insert({
      video_id: input.videoId,
      user_id: input.userId,
      author_name: input.authorName,
      author_image: input.authorImage ?? null,
      body: input.body,
      status: input.status ?? "published",
      ai_reason: input.aiReason ?? null,
    })
    .select("*")
    .single();
  if (error || !data)
    throw new Error(error?.message ?? "Failed to create comment");
  return rowToComment(data);
}

export async function getComment(id: string): Promise<Comment | null> {
  const { data } = await getDb()
    .from("comments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? rowToComment(data) : null;
}

export type CommentPage = {
  items: Comment[];
  total: number;
  hasMore: boolean;
  nextOffset: number;
};

/** Public, published comments for a video (newest first). */
export async function listPublishedComments(
  videoId: string,
  offset = 0,
  limit = 20,
): Promise<CommentPage> {
  const { data, count } = await getDb()
    .from("comments")
    .select("*", { count: "exact" })
    .eq("video_id", videoId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  const total = count ?? 0;
  return {
    items: (data ?? []).map(rowToComment),
    total,
    hasMore: offset + limit < total,
    nextOffset: offset + limit,
  };
}

export async function countComments(videoId: string): Promise<number> {
  const { count } = await getDb()
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("video_id", videoId)
    .eq("status", "published");
  return count ?? 0;
}

export async function listFlaggedComments(
  offset = 0,
  limit = 50,
): Promise<Comment[]> {
  const { data } = await getDb()
    .from("comments")
    .select("*")
    .eq("status", "flagged")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return (data ?? []).map(rowToComment);
}

export async function countFlaggedComments(): Promise<number> {
  const { count } = await getDb()
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("status", "flagged");
  return count ?? 0;
}

export async function setCommentStatus(
  id: string,
  status: CommentStatus,
): Promise<Comment | null> {
  const { data } = await getDb()
    .from("comments")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();
  return data ? rowToComment(data) : null;
}

export async function deleteComment(id: string): Promise<void> {
  await getDb().from("comments").delete().eq("id", id);
}
