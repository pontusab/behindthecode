import { getDb } from "../client";
import type { Database } from "../database.types";
import { slugify } from "../id";
import { rowToCategory } from "../mappers";
import type { Category } from "../types";

type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export async function getCategory(id: string): Promise<Category | null> {
  const { data } = await getDb()
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? rowToCategory(data) : null;
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const { data } = await getDb()
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ? rowToCategory(data) : null;
}

export async function listCategories(): Promise<Category[]> {
  const { data } = await getDb()
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  return (data ?? []).map(rowToCategory);
}

async function uniqueCategorySlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  const db = getDb();
  const root = slugify(base) || "category";
  let slug = root;
  let n = 1;
  for (;;) {
    const { data } = await db
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data || data.id === excludeId) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
}

export async function createCategory(input: {
  name: string;
  description?: string;
}): Promise<Category> {
  const slug = await uniqueCategorySlug(input.name);
  const { data, error } = await getDb()
    .from("categories")
    .insert({ name: input.name, slug, description: input.description ?? "" })
    .select("*")
    .single();
  if (error || !data)
    throw new Error(error?.message ?? "Failed to create category");
  return rowToCategory(data);
}

export async function updateCategory(
  id: string,
  patch: { name?: string; description?: string },
): Promise<Category | null> {
  const existing = await getCategory(id);
  if (!existing) return null;
  let slug = existing.slug;
  if (patch.name && patch.name !== existing.name) {
    slug = await uniqueCategorySlug(patch.name, id);
  }
  const update: CategoryUpdate = { slug };
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.description !== undefined) update.description = patch.description;
  const { data } = await getDb()
    .from("categories")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  return data ? rowToCategory(data) : null;
}

export async function deleteCategory(id: string): Promise<void> {
  await getDb().from("categories").delete().eq("id", id);
}

export async function countCategoryVideos(id: string): Promise<number> {
  const { count } = await getDb()
    .from("videos")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)
    .eq("publish_status", "published");
  return count ?? 0;
}
