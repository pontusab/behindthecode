import { Suspense } from "react";
import { LandingFooter, LandingHero } from "@/components/home/landing";
import { VideoBrowser } from "@/components/home/video-browser";
import { getCategoriesCached, getFeed, getSettingsCached } from "@/lib/catalog";

type Section = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  items: Awaited<ReturnType<typeof getFeed>>["items"];
  total: number;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const settings = await getSettingsCached();

  return (
    <div className="min-h-screen bg-btc-bg font-sans text-btc-text antialiased">
      <LandingHero tagline={settings.tagline} />

      <section className="mx-auto w-full max-w-[1728px] px-4 py-16 sm:px-10">
        <Suspense fallback={null}>
          <VideoSection searchParams={searchParams} siteName={settings.siteName} />
        </Suspense>
      </section>

      <LandingFooter siteName={settings.siteName} />
    </div>
  );
}

async function VideoSection({
  searchParams,
  siteName,
}: {
  searchParams: Promise<{ category?: string }>;
  siteName: string;
}) {
  const [{ category }, categories] = await Promise.all([
    searchParams,
    getCategoriesCached(),
  ]);

  const allSections = await Promise.all(
    categories.slice(0, 6).map(async (cat): Promise<Section> => {
      const feed = await getFeed({
        categoryId: cat.id,
        sort: "recent",
        limit: 8,
      });
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        items: feed.items,
        total: feed.total,
      };
    }),
  );

  // Only show categories that actually have published videos.
  const sections = allSections.filter((s) => s.items.length > 0);

  return (
    <VideoBrowser
      categories={categories}
      sections={sections}
      siteName={siteName}
      activeSlug={category ?? "all"}
    />
  );
}
