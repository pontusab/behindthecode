import { getDb } from "../client";

/**
 * Full-text search is handled by a generated `tsvector` column + GIN index on
 * the videos table, so indexing/removal happen automatically on write.
 * These remain as no-ops for API compatibility.
 */
export async function indexVideoSearch(): Promise<void> {}
export async function removeVideoSearch(): Promise<void> {}

/** Return published video ids matching the query (Postgres FTS). */
export async function searchVideoIds(query: string): Promise<string[]> {
  const q = query.trim();
  if (!q) return [];
  const { data } = await getDb()
    .from("videos")
    .select("id")
    .eq("publish_status", "published")
    .eq("visibility", "public")
    .textSearch("search", q, { type: "websearch", config: "simple" })
    .order("view_count", { ascending: false })
    .limit(50);
  return (data ?? []).map((r) => r.id);
}
