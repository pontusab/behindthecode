"use client";

import type { Category } from "@btc/db";
import type { MediaItem } from "@btc/ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CategoryRow } from "@/components/home/category-row";
import { SearchIcon } from "@/components/home/icons";
import { LandingVideoCard } from "@/components/home/landing-video-card";

export type BrowserSection = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  items: MediaItem[];
  total: number;
};

function tabClass(active: boolean): string {
  return active
    ? "border-b border-btc-text pb-0.5 text-[14px] font-medium text-btc-text"
    : "pb-0.5 text-[14px] text-btc-muted transition-colors hover:text-btc-text";
}

export function VideoBrowser({
  categories,
  sections,
  siteName,
}: {
  categories: Category[];
  sections: BrowserSection[];
  siteName: string;
}) {
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category") ?? "all";
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const filtering = q.length > 0 || activeSlug !== "all";

  const filtered = useMemo(() => {
    const base =
      activeSlug === "all"
        ? sections.flatMap((s) => s.items)
        : (sections.find((s) => s.slug === activeSlug)?.items ?? []);
    if (!q) return base;
    return base.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.categoryName ?? "").toLowerCase().includes(q),
    );
  }, [sections, activeSlug, q]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <h2 className="hidden text-[32px] font-medium leading-none text-btc-text sm:block">
          Videos
        </h2>

        <div className="flex flex-1 flex-wrap items-center gap-4 sm:flex-none sm:justify-center sm:gap-6">
          <Link
            href="/"
            scroll={false}
            className={tabClass(activeSlug === "all")}
          >
            All
          </Link>
          {categories.slice(0, 4).map((c) => (
            <Link
              key={c.id}
              href={`/?category=${c.slug}`}
              scroll={false}
              className={tabClass(activeSlug === c.slug)}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="shrink-0 sm:justify-self-end">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search videos"
            aria-expanded={searchOpen}
            className={`grid size-10 place-items-center rounded-[140px] border border-btc-border bg-btc-surface text-btc-muted transition-colors hover:text-btc-text sm:hidden ${
              searchOpen ? "hidden" : ""
            }`}
          >
            <SearchIcon className="size-4" />
          </button>

          <label
            className={`h-10 w-[200px] items-center gap-2.5 rounded-[140px] border border-btc-border bg-btc-surface px-4 text-btc-muted transition-colors focus-within:border-btc-faint sm:flex sm:w-[240px] ${
              searchOpen ? "flex" : "hidden"
            }`}
          >
            <SearchIcon className="size-4" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => {
                if (!query.trim()) setSearchOpen(false);
              }}
              placeholder="Search videos"
              aria-label="Search videos"
              className="w-full bg-transparent text-[14px] text-btc-text outline-none placeholder:text-btc-muted"
            />
          </label>
        </div>
      </div>

      <div className="mt-12">
        {filtering ? (
          filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item) => (
                <LandingVideoCard
                  key={item.id}
                  item={item}
                  siteName={siteName}
                />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center font-mono text-[14px] text-btc-muted">
              {q ? `No videos match “${query.trim()}”.` : "No videos here yet."}
            </p>
          )
        ) : (
          <div className="flex flex-col gap-16">
            {sections.map((section) => (
              <CategoryRow
                key={section.id}
                name={section.name}
                slug={section.slug}
                description={section.description}
                items={section.items}
                total={section.total}
                siteName={siteName}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
