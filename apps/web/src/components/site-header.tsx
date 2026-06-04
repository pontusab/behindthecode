import { Logo } from "@btc/ui/components/logo";
import { ThemeToggle } from "@btc/ui/components/theme-toggle";
import Link from "next/link";
import { Suspense } from "react";
import { AccountMenu } from "@/components/account-menu";
import { SearchBar } from "@/components/search-bar";
import { getCategoriesCached, getSettingsCached } from "@/lib/catalog";

export async function SiteHeader() {
  const [settings, categories] = await Promise.all([
    getSettingsCached(),
    getCategoriesCached(),
  ]);

  return (
    <header className="sticky top-0 z-50 border-b border-glass-border">
      <div className="glass-panel">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="shrink-0">
            <Logo label={settings.siteName} logoUrl={settings.logoUrl} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            >
              Home
            </Link>
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden flex-1 justify-center px-4 sm:flex">
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            <ThemeToggle />
            <Suspense
              fallback={
                <div className="size-9 animate-pulse rounded-full bg-muted" />
              }
            >
              <AccountMenu />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
}
