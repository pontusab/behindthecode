import { type VideoSort } from "@btc/db";
import { VideoGrid, VideoGridSkeleton } from "@btc/ui/components/video-grid";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SortTabs } from "@/components/sort-tabs";
import {
  getCategoryBySlugCached,
  getCategorySlugsCached,
  getFeed,
} from "@/lib/catalog";
import {
  isBuildValidationSlug,
  withBuildValidationSlug,
} from "@/lib/static-params";

export async function generateStaticParams() {
  const slugs = await getCategorySlugsCached();
  return withBuildValidationSlug(slugs);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlugCached(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description || `Videos in ${category.name}`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  if (isBuildValidationSlug(slug)) notFound();
  const category = await getCategoryBySlugCached(slug);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Category</p>
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
      </div>
      <Suspense fallback={null}>
        <CategorySort slug={slug} searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<VideoGridSkeleton />}>
        <CategoryGrid categoryId={category.id} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CategorySort({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort = "recent" } = await searchParams;
  return <SortTabs basePath={`/category/${slug}`} current={sort} />;
}

async function CategoryGrid({
  categoryId,
  searchParams,
}: {
  categoryId: string;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort = "recent" } = await searchParams;
  const feed = await getFeed({
    sort: sort as VideoSort,
    categoryId,
    limit: 24,
  });
  if (feed.items.length === 0) {
    return (
      <div className="glass rounded-2xl py-16 text-center text-muted-foreground">
        No videos here yet.
      </div>
    );
  }
  return <VideoGrid items={feed.items} priorityCount={4} />;
}
