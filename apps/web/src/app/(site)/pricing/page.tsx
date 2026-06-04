import type { Metadata } from "next";
import { CheckIcon } from "@/components/home/icons";
import { MetallicButton, MetallicKnob } from "@/components/home/landing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "One payment. Lifetime access to everything.",
};

const FEATURES = [
  "The entire library of videos and series",
  "Every future upload, included automatically",
  "Full-length, ad-free playback",
  "Watch on desktop, tablet, and mobile",
  "Captions and chapters on every video",
  "No subscription — pay once, keep forever",
];

const FAQ = [
  {
    q: "Is this really a one-time payment?",
    a: "Yes. There are no subscriptions, tiers, or hidden fees. Pay $149 once and keep lifetime access to everything.",
  },
  {
    q: "Do I get new videos too?",
    a: "Every new video and series we publish is added to your access automatically, at no extra cost.",
  },
  {
    q: "Which devices can I watch on?",
    a: "Anything with a modern browser — desktop, tablet, or phone. Your access follows your account wherever you sign in.",
  },
  {
    q: "Can I get a refund?",
    a: "If it's not for you, reach out within 14 days of your purchase and we'll make it right.",
  },
];

export default function PricingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="hero-grid pointer-events-none absolute inset-x-0 top-0 h-[520px]" />

      <div className="relative mx-auto w-full max-w-[1728px] px-4 py-20 sm:px-10 sm:py-28">
        {/* Intro */}
        <p className="font-mono text-[13px] uppercase tracking-[0.08em] text-btc-faint">
          Pricing
        </p>
        <h1 className="mt-4 max-w-[15ch] font-bold uppercase leading-[0.9] tracking-[-0.02em] text-btc-text text-[clamp(2.5rem,6vw,5.5rem)]">
          One payment. Everything.
        </h1>
        <p className="mt-6 max-w-[640px] text-[18px] leading-[1.3] text-btc-text/90">
          No subscriptions and no tiers. Pay once and watch every video and
          series — including everything we publish next — forever.
        </p>

        {/* Offer + features */}
        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* The offer card */}
          <div className="flex flex-col justify-between gap-12 border border-btc-border bg-btc-surface p-8 sm:p-12">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-[999px] bg-btc-error shadow-[0_0_8px_2px_rgba(236,39,41,0.6)]" />
                <span className="font-mono text-[13px] uppercase tracking-[0.08em] text-btc-muted">
                  Lifetime access
                </span>
              </div>
              <div className="mt-7 flex items-end gap-3">
                <span className="font-mono text-[clamp(3.5rem,8vw,4.5rem)] font-medium leading-none text-btc-text">
                  $149
                </span>
                <span className="mb-1.5 font-mono text-[14px] leading-none text-btc-faint">
                  one-time
                </span>
              </div>
              <p className="mt-5 max-w-[36ch] text-[15px] leading-[1.45] text-btc-muted">
                Billed once. Yours forever — no renewals, no surprises.
              </p>
            </div>

            <div className="flex items-center gap-7">
              <MetallicKnob href="/login" />
              <div className="text-[15px] leading-[1.3]">
                <p className="font-medium text-btc-text">Watch everything.</p>
                <p className="text-btc-muted">Forever.</p>
              </div>
            </div>
          </div>

          {/* Features card */}
          <div className="border border-btc-border bg-btc-surface/40 p-8 sm:p-12">
            <h2 className="text-[20px] font-medium text-btc-text">
              Everything included
            </h2>
            <ul className="mt-8 flex flex-col gap-5">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-[999px] border border-btc-border text-btc-text">
                    <CheckIcon className="size-3.5" />
                  </span>
                  <span className="text-[15px] leading-[1.45] text-btc-text">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-[760px]">
          <h2 className="text-[28px] font-medium tracking-[-0.01em] text-btc-text">
            Questions
          </h2>
          <dl className="mt-8 border-t border-btc-border">
            {FAQ.map(({ q, a }) => (
              <div
                key={q}
                className="flex flex-col gap-2 border-b border-btc-border py-6"
              >
                <dt className="text-[16px] font-medium text-btc-text">{q}</dt>
                <dd className="text-[15px] leading-normal text-btc-muted">
                  {a}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Closing CTA */}
        <div className="mt-20 flex flex-wrap items-center justify-between gap-6 border border-btc-border bg-btc-surface px-8 py-7 sm:px-12">
          <p className="text-[18px] font-medium tracking-[-0.01em] text-btc-text">
            Ready to watch everything?
          </p>
          <MetallicButton href="/login" />
        </div>
      </div>
    </div>
  );
}
