import { Logo } from "@btc/ui/components/logo";
import Link from "next/link";
import { getSettingsCached } from "@/lib/catalog";

// Evaluated once at module load (not during render) so it doesn't trip the
// Cache Components "current time during prerender" guard.
const YEAR = new Date().getFullYear();

export async function SiteFooter() {
  const settings = await getSettingsCached();
  return (
    <footer className="mt-20 border-t border-glass-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-2">
          <Logo label={settings.siteName} logoUrl={settings.logoUrl} />
          {settings.tagline && (
            <p className="max-w-sm text-sm text-muted-foreground">
              {settings.tagline}
            </p>
          )}
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </nav>
      </div>
      <div className="border-t border-glass-border py-4 text-center text-xs text-muted-foreground">
        © {YEAR} {settings.siteName}. All rights reserved.
      </div>
    </footer>
  );
}
