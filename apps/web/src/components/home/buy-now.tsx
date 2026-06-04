"use client";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

/**
 * Starts the real Polar subscription checkout. Behaviour:
 *  - signed out (401)            → /login?redirect=<here>
 *  - monetization off / error    → falls back to `fallbackHref` (default /login)
 *  - success                     → redirect to the Polar hosted checkout
 *    (sandbox or production, depending on POLAR_SERVER)
 */
export function BuyNow({
  className,
  children,
  ariaLabel,
  fallbackHref = "/login",
  onStart,
}: {
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  fallbackHref?: string;
  onStart?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, setPending] = React.useState(false);

  async function buy() {
    if (pending) return;
    onStart?.();
    setPending(true);
    try {
      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "subscription" }),
      });

      if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      if (!res.ok) {
        router.push(fallbackHref);
        return;
      }

      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
      else router.push(fallbackHref);
    } catch {
      router.push(fallbackHref);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={buy}
      disabled={pending}
      aria-label={ariaLabel}
      className={`cursor-pointer disabled:cursor-default ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
