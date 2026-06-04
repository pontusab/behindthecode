"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BuyNow } from "@/components/home/buy-now";
import { ArrowForwardIcon, CloseIcon, MenuIcon } from "@/components/home/icons";
import { ThemeToggle } from "@/components/home/theme-toggle";

const LINKS = [{ href: "/login", label: "Sign in" }];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // The overlay is portaled to <body> so it escapes the header's stacking
  // context (z-30) and any backdrop-filter ancestor, letting it cover the
  // whole viewport above every other element.
  const overlay =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-100 flex flex-col bg-btc-bg/95 backdrop-blur-md sm:hidden">
            <div className="flex items-center justify-between px-4 pt-6">
              <Link
                href="/live"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-[14px] font-medium text-btc-text"
              >
                <span className="size-1.5 rounded-[999px] bg-btc-error shadow-[0_0_8px_2px_rgba(236,39,41,0.6)]" />
                Live
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-11 place-items-center rounded-[999px] border border-btc-border bg-btc-surface/80 text-btc-text"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-center gap-2 px-6 pb-24">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b border-btc-border py-5 text-[28px] font-medium tracking-[-0.01em] text-btc-text"
                >
                  {link.label}
                  <ArrowForwardIcon className="size-6 text-btc-muted" />
                </Link>
              ))}

              <BuyNow
                onStart={() => setOpen(false)}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-[80px] bg-btc-text py-4 text-[16px] font-medium text-btc-bg"
              >
                Demo
                <ArrowForwardIcon className="size-4" />
              </BuyNow>

              <div className="mt-6 text-center text-[14px] text-btc-muted">
                <ThemeToggle />
              </div>
            </nav>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="grid size-11 place-items-center rounded-[999px] border border-btc-border bg-btc-surface/80 text-btc-text backdrop-blur-md"
      >
        <MenuIcon className="size-5" />
      </button>
      {overlay}
    </div>
  );
}
