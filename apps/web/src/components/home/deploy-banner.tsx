"use client";

import { usePathname } from "next/navigation";
import { ArrowForwardIcon } from "@/components/home/icons";

const REPO_URL = "https://github.com/pontusab/behindthecode";

/**
 * Vercel "Deploy Button" clone URL — pre-fills the repo to fork and prompts the
 * user for the environment variables the app needs (Supabase, Mux, the initial
 * admin account, etc). Dependencies install automatically from the repo's
 * lockfile during the Vercel build.
 */
const DEPLOY_URL = `https://vercel.com/new/clone?${new URLSearchParams({
  "repository-url": REPO_URL,
  "repository-name": "behindthecode",
  "project-name": "behindthecode",
  env: [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_APP_URL",
    "MUX_TOKEN_ID",
    "MUX_TOKEN_SECRET",
    "MUX_WEBHOOK_SECRET",
    "CRON_SECRET",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "SITE_NAME",
  ].join(","),
  envDescription:
    "Supabase, Mux and initial-admin credentials needed to run your own copy.",
  envLink: `${REPO_URL}/blob/main/README.md`,
}).toString()}`;

// Enough repeats that a single half always exceeds the widest viewport, so the
// -50% loop never reveals a gap.
const HALF = Array.from({ length: 24 }, () => "Deploy your own");

function MarqueeHalf() {
  return (
    <div className="flex shrink-0 items-center">
      {HALF.map((phrase, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: static, fixed-length ticker
          key={i}
          className="flex items-center gap-2.5 px-5"
        >
          <span className="text-[12px] font-medium uppercase tracking-widest whitespace-nowrap">
            {phrase}
          </span>
          <ArrowForwardIcon className="size-3 opacity-50" />
        </span>
      ))}
    </div>
  );
}

export function DeployBanner() {
  const pathname = usePathname();
  // Keep the auth and admin pages clean — no marquee banner.
  if (
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <a
      href={DEPLOY_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Deploy your own copy on Vercel — pre-configured with dependencies and environment variables"
      className="group relative z-40 block w-full overflow-hidden border-b border-btc-border bg-btc-surface py-2.5 text-btc-muted transition-colors hover:text-btc-text"
    >
      <div className="marquee-track" aria-hidden>
        <MarqueeHalf />
        <MarqueeHalf />
      </div>
    </a>
  );
}
