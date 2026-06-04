import { EmptyState } from "@btc/ui/components/empty-state";
import { VideoGrid, VideoGridSkeleton } from "@btc/ui/components/video-grid";
import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { searchVideos } from "@/lib/catalog";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <Suspense fallback={<VideoGridSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? await searchVideos(query) : [];

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {query ? `Results for “${query}”` : "Search"}
        </h1>
        {query && (
          <p className="text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
        )}
      </div>
      {query && results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No results found"
          description={`We couldn't find anything matching “${query}”. Try a different search.`}
        />
      ) : (
        <VideoGrid items={results} />
      )}
    </>
  );
}
