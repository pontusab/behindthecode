import type { VideoSort } from "@btc/db";
import { Button } from "@btc/ui/components/button";
import { FeaturedCarousel } from "@btc/ui/components/featured-carousel";
import { VideoGrid, VideoGridSkeleton } from "@btc/ui/components/video-grid";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SortTabs } from "@/components/sort-tabs";
import { getCarousel, getFeed, getSettingsCached } from "@/lib/catalog";

const PAGE_SIZE = 12;

export default function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6">
      <Suspense
        fallback={
          <div className="h-[clamp(260px,46vw,560px)] animate-pulse rounded-3xl bg-muted" />
        }
      >
        <Hero />
      </Suspense>

      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight">Browse all</h2>
          <Suspense fallback={null}>
            <SortControl searchParams={searchParams} />
          </Suspense>
        </div>
        <Suspense fallback={<VideoGridSkeleton count={PAGE_SIZE} />}>
          <Grid searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}

async function Hero() {
  const settings = await getSettingsCached();
  const items = await getCarousel(
    settings.carouselSource,
    settings.featuredVideoIds,
  );
  if (items.length === 0) {
    return (
      <div className="grid h-[clamp(220px,36vw,420px)] place-items-center border border-border text-center">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
            {settings.siteName}
          </h1>
          <p className="text-muted-foreground">{settings.tagline}</p>
        </div>
      </div>
    );
  }
  return (
    <FeaturedCarousel
      items={items}
      sourceLabel={settings.carouselSource === "latest" ? "Latest" : "Popular"}
    />
  );
}

async function SortControl({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  const { sort = "popular" } = await searchParams;
  return <SortTabs basePath="/" current={sort} />;
}

async function Grid({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  const { sort = "popular", page = "1" } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;
  const feed = await getFeed({
    sort: sort as VideoSort,
    offset,
    limit: PAGE_SIZE,
  });

  if (feed.items.length === 0) {
    return (
      <div className="glass rounded-2xl py-16 text-center text-muted-foreground">
        No videos published yet.
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(feed.total / PAGE_SIZE));

  return (
    <div className="space-y-8">
      <VideoGrid items={feed.items} priorityCount={4} />
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button asChild variant="outline" size="sm" disabled={pageNum <= 1}>
            <Link
              href={`/?sort=${sort}&page=${pageNum - 1}`}
              aria-disabled={pageNum <= 1}
            >
              <ChevronLeft className="size-4" /> Prev
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pageNum} of {totalPages}
          </span>
          <Button asChild variant="outline" size="sm" disabled={!feed.hasMore}>
            <Link
              href={`/?sort=${sort}&page=${pageNum + 1}`}
              aria-disabled={!feed.hasMore}
            >
              Next <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
