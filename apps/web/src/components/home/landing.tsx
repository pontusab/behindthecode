import Link from "next/link";
import { BuyNow } from "@/components/home/buy-now";
import { CurrentYear } from "@/components/home/current-year";
import { ArrowForwardIcon } from "@/components/home/icons";
import { MobileMenu } from "@/components/home/mobile-menu";
import { ThemeToggle } from "@/components/home/theme-toggle";

const CONTAINER = "mx-auto w-full max-w-[1728px] px-4 sm:px-10";

/* ── Brand wordmark ────────────────────────────────────────── */
export function BrandWordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`text-[24px] font-bold uppercase leading-none tracking-[-0.02em] text-btc-text ${className ?? ""}`}
    >
      Behind the code
    </Link>
  );
}

/* ── The floating nav pill (shared by hero + watch header) ──── */
export function PillNav() {
  return (
    <div className="hidden items-center gap-5 rounded-[140px] border border-btc-border bg-btc-surface/80 py-3 pl-8 pr-4 backdrop-blur-md sm:flex">
      <Link
        href="/live"
        className="flex items-center gap-2 text-[14px] font-medium text-btc-text transition-opacity hover:opacity-80"
      >
        <span className="size-1.5 rounded-[999px] bg-btc-error shadow-[0_0_8px_2px_rgba(236,39,41,0.6)]" />
        Live
      </Link>
      <Link
        href="/login"
        className="border-r border-btc-border pr-5 text-[14px] font-medium text-btc-text/90 transition-colors hover:text-btc-text"
      >
        Sign in
      </Link>
      <MetallicButton href="/login" />
    </div>
  );
}

/* ── Hero nav (absolute overlay; mirrors BrandHeader exactly so the
 *    header sits in the same place on every page) ───────────────── */
export function LandingNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 pt-6 sm:pt-10">
      <div className={`flex items-center justify-end gap-4 ${CONTAINER}`}>
        <PillNav />
        <MobileMenu />
      </div>
    </header>
  );
}

/* ── Page header (brand left, pill right) ──────────────────── */
export function BrandHeader() {
  return (
    <header className="relative z-30 pt-6 sm:pt-10">
      <div className={`flex items-center justify-between gap-4 ${CONTAINER}`}>
        <BrandWordmark />
        <PillNav />
        <MobileMenu />
      </div>
    </header>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Brushed-metal surface. This is the exact skewed radial gradient from the
 * Figma "Growth Hacks" spec (node 152:223). A CSS gradient can't reproduce it
 * because the sweep is rotated/skewed via a matrix, so it's drawn as an inline
 * SVG that stretches to fill its rounded parent (preserveAspectRatio="none").
 * ────────────────────────────────────────────────────────────── */
const METAL_STOPS: Array<[number, string, number]> = [
  [0.025, "89,96,106", 0.81],
  [0.0606, "85,91,105", 0.81],
  [0.0879, "131,134,141", 0.815],
  [0.1151, "176,176,176", 0.82],
  [0.145, "136,139,146", 0.73],
  [0.175, "95,101,115", 0.64],
  [0.2029, "132,136,147", 0.75],
  [0.2307, "169,171,179", 0.86],
  [0.3345, "182,185,192", 0.83],
  [0.4371, "140,146,154", 0.795],
  [0.5396, "98,107,116", 0.76],
  [0.6, "114,122,130", 0.765],
  [0.6079, "142,149,157", 0.87],
  [0.6413, "192,196,201", 0.84],
  [0.6747, "242,243,245", 0.81],
  [0.6808, "239,239,241", 0.85],
  [0.7145, "172,176,182", 0.795],
  [0.7314, "139,144,152", 0.7675],
  [0.7482, "105,112,122", 0.74],
  [0.7881, "87,93,107", 0.83],
  [0.8361, "99,106,116", 0.8],
  [0.8611, "135,140,148", 0.795],
  [0.8862, "170,174,180", 0.79],
  [0.9112, "206,207,211", 0.785],
  [0.9362, "241,241,243", 0.78],
  [0.9533, "196,198,203", 0.755],
  [0.9703, "151,154,163", 0.73],
  [0.9883, "177,179,185", 0.79],
];

function MetallicSurface() {
  return (
    <svg
      aria-hidden
      preserveAspectRatio="none"
      viewBox="0 0 91 32"
      className="absolute inset-0 size-full"
    >
      <defs>
        <radialGradient
          id="btcMetal"
          gradientUnits="userSpaceOnUse"
          cx="0"
          cy="0"
          r="10"
          gradientTransform="matrix(48.034 48.034 -150.83 70.138 -234.5 -344.34)"
        >
          {METAL_STOPS.map(([offset, rgb, opacity]) => (
            <stop
              key={offset}
              offset={offset}
              stopColor={`rgb(${rgb})`}
              stopOpacity={opacity}
            />
          ))}
        </radialGradient>
      </defs>
      <rect width="91" height="32" fill="url(#btcMetal)" />
    </svg>
  );
}

/* ── Metallic "Buy now" pill button ────────────────────────── */
export function MetallicButton({ href }: { href: string }) {
  return (
    <BuyNow
      fallbackHref={href}
      className="metallic-pill relative flex h-8 items-center gap-1 overflow-hidden rounded-[80px] px-3.5 text-[13px] font-medium transition-transform hover:scale-[1.02]"
    >
      <MetallicSurface />
      <span className="relative z-10 text-[#121212]/55 [text-shadow:0_0.5px_0_rgba(255,255,255,0.5)]">
        Buy now
      </span>
      <ArrowForwardIcon className="relative z-10 size-3.5 text-[#121212]/55" />
    </BuyNow>
  );
}

/* ── Metallic circular knob (hero offer card) ──────────────── */
export function MetallicKnob({ href }: { href: string }) {
  return (
    <BuyNow
      fallbackHref={href}
      ariaLabel="Buy now"
      className="metallic-knob relative grid size-[100px] shrink-0 place-items-center rounded-[999px] transition-transform hover:scale-[1.03]"
    >
      <span className="absolute inset-0 rounded-[999px] bg-[url('/metallic/knob-disc.png')] bg-cover bg-center dark:bg-[url('/metallic/knob-disc-dark.png')]" />
      <span className="pointer-events-none absolute inset-0 rounded-[999px] bg-[url('/metallic/knob-top.png')] bg-cover bg-center opacity-70" />
      <span className="relative z-10 text-[13px] font-medium text-[#121212]/60 [text-shadow:0_0.5px_0_rgba(255,255,255,0.6)]">
        Buy now
      </span>
    </BuyNow>
  );
}

/* ── Hero ──────────────────────────────────────────────────── */
export function LandingHero({ tagline }: { tagline: string }) {
  return (
    <section className="relative overflow-hidden border-b border-btc-border pb-12 pt-28 sm:pb-16">
      <div className="hero-grid pointer-events-none absolute inset-x-0 top-0 h-[720px]" />
      <LandingNav />

      <div className={`relative ${CONTAINER}`}>
        <h1 className="hero-title text-left font-bold uppercase leading-[0.86] tracking-[-0.02em] text-btc-text">
          Behind the code
        </h1>

        <p className="mt-3.5 max-w-[655px] text-[18px] leading-[1.3] text-btc-text/90">
          {tagline}
        </p>

        <div className="mt-16 flex flex-wrap items-end justify-between gap-x-8 gap-y-10">
          <div
            id="offer"
            className="flex h-[120px] scroll-mt-24 items-center gap-8 rounded-[120px] border border-btc-border bg-btc-surface pl-[10px] pr-14"
          >
            <MetallicKnob href="/login" />
            <div className="flex flex-col gap-2">
              <div className="flex items-end gap-2 border-b border-btc-border pb-2">
                <span className="font-mono text-[20px] font-medium leading-none text-btc-text">
                  $149
                </span>
                <span className="font-mono text-[13px] leading-none text-btc-faint">
                  One time payment
                </span>
              </div>
              <div className="text-[14px] leading-[1.3] text-btc-text">
                <p>Watch everything.</p>
                <p>Forever.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ────────────────────────────────────────────────── */
function XLink({ handle }: { handle: string }) {
  return (
    <a
      href={`https://x.com/${handle}`}
      target="_blank"
      rel="noreferrer"
      className="text-btc-text underline-offset-4 transition-colors hover:underline"
    >
      @{handle}
    </a>
  );
}

export function LandingFooter({ siteName }: { siteName: string }) {
  return (
    <footer className="border-t border-btc-border py-12">
      <div className={CONTAINER}>
        <div className="flex flex-col gap-8 border-b border-btc-border pb-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md space-y-3">
            <p className="text-[16px] font-medium text-btc-text">{siteName}</p>
            <p className="text-[14px] leading-normal text-btc-muted">
              An open-source, single-publisher video platform for selling your
              own videos and courses. Self-hosted and fully yours — built on
              Next.js, Mux, and Supabase, with subscriptions and one-time
              purchases via Polar. Deploy your own in minutes.
            </p>
          </div>
          <p className="text-[14px] leading-normal text-btc-muted">
            Made by <XLink handle="pontusab" /> and{" "}
            <XLink handle="viktorhofte" />
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-8">
          <p className="font-mono text-[13px] text-btc-faint">
            © <CurrentYear /> {siteName}
          </p>
          <div className="flex items-center gap-6 text-[13px] text-btc-muted">
            <Link
              href="/about"
              className="transition-colors hover:text-btc-text"
            >
              About
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-btc-text"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-btc-text"
            >
              Privacy
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
