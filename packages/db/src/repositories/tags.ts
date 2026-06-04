import { getDb } from "../client";
import { slugify } from "../id";
import { rowToTag } from "../mappers";
import type { Tag } from "../types";

export async function getTag(slug: string): Promise<Tag | null> {
  const { data } = await getDb()
    .from("tags")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ? rowToTag(data) : null;
}

export async function listTags(): Promise<Tag[]> {
  const { data } = await getDb()
    .from("tags")
    .select("*")
    .order("name", { ascending: true });
  return (data ?? []).map(rowToTag);
}

/** Ensure tags exist for the given names; returns their slugs. */
export async function ensureTags(names: string[]): Promise<string[]> {
  const rows = names
    .map((name) => ({ slug: slugify(name), name: name.trim() }))
    .filter((t) => t.slug.length > 0);
  if (rows.length === 0) return [];
  await getDb()
    .from("tags")
    .upsert(rows, { onConflict: "slug", ignoreDuplicates: true });
  return Array.from(new Set(rows.map((r) => r.slug)));
}

export async function deleteTag(slug: string): Promise<void> {
  await getDb().from("tags").delete().eq("slug", slug);
}

export async function countTagVideos(slug: string): Promise<number> {
  const { count } = await getDb()
    .from("videos")
    .select("id", { count: "exact", head: true })
    .contains("tags", [slug])
    .eq("publish_status", "published");
  return count ?? 0;
}
