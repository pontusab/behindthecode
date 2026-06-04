import { cn } from "@btc/ui";
import Link from "next/link";

const SORTS = [
  { key: "popular", label: "Popular" },
  { key: "recent", label: "Newest" },
  { key: "liked", label: "Most liked" },
] as const;

export function SortTabs({
  basePath,
  current,
  extraParams,
}: {
  basePath: string;
  current: string;
  extraParams?: Record<string, string>;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-glass-border bg-secondary/40 p-1">
      {SORTS.map((s) => {
        const params = new URLSearchParams({ ...extraParams, sort: s.key });
        const active = current === s.key;
        return (
          <Link
            key={s.key}
            href={`${basePath}?${params.toString()}`}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}
