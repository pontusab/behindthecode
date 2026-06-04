import { Suspense } from "react";
import { LandingFooter, LandingHero } from "@/components/home/landing";
import { VideoBrowser } from "@/components/home/video-browser";
import { getHomeCatalogCached, getSettingsCached } from "@/lib/catalog";

export default async function HomePage() {
  const [settings, catalog] = await Promise.all([
    getSettingsCached(),
    getHomeCatalogCached(),
  ]);

  return (
    <div className="min-h-screen bg-btc-bg font-sans text-btc-text antialiased">
      <LandingHero tagline={settings.tagline} />

      <section className="mx-auto w-full max-w-[1728px] px-4 py-16 sm:px-10">
        <Suspense fallback={null}>
          <VideoBrowser
            categories={catalog.categories}
            sections={catalog.sections}
            siteName={settings.siteName}
          />
        </Suspense>
      </section>

      <LandingFooter siteName={settings.siteName} />
    </div>
  );
}
