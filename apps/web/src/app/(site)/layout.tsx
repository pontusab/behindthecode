import { Suspense } from "react";
import { BrandHeader, LandingFooter } from "@/components/home/landing";
import { getSettingsCached } from "@/lib/catalog";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-btc-bg font-sans text-btc-text antialiased">
      <BrandHeader />
      <main className="flex-1">{children}</main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
    </div>
  );
}

async function SiteFooter() {
  const settings = await getSettingsCached();
  return <LandingFooter siteName={settings.siteName} />;
}
