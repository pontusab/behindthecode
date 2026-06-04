import { tagRepo, type VideoSort } from "@btc/db";
import { VideoGrid, VideoGridSkeleton } from "@btc/ui/components/video-grid";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SortTabs } from "@/components/sort-tabs";
import { getFeed } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await tagRepo.getTag(slug);
  if (!tag) return {};
  return { title: `#${tag.name}`, description: `Videos tagged ${tag.name}` };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const tag = await tagRepo.getTag(slug);
  if (!tag) notFound();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">Tag</p>
        <h1 className="text-3xl font-bold tracking-tight">#{tag.name}</h1>
      </div>
      <Suspense fallback={null}>
        <TagSort slug={slug} searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<VideoGridSkeleton />}>
        <TagGrid slug={slug} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function TagSort({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort = "recent" } = await searchParams;
  return <SortTabs basePath={`/tag/${slug}`} current={sort} />;
}

async function TagGrid({
  slug,
  searchParams,
}: {
  slug: string;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort = "recent" } = await searchParams;
  const feed = await getFeed({ sort: sort as VideoSort, tag: slug, limit: 24 });
  if (feed.items.length === 0) {
    return (
      <div className="glass rounded-2xl py-16 text-center text-muted-foreground">
        No videos here yet.
      </div>
    );
  }
  return <VideoGrid items={feed.items} priorityCount={4} />;
}
