import type { MediaItem } from "@btc/ui";
import Link from "next/link";
import { ArtTrackIcon, PaceIcon } from "@/components/home/icons";
import { LandingVideoCard } from "@/components/home/landing-video-card";

function totalDurationLabel(items: MediaItem[]): string {
  const totalSec = items.reduce((sum, i) => sum + (i.duration ?? 0), 0);
  if (totalSec <= 0) return "—";
  const mins = Math.round(totalSec / 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m} min`;
  return m ? `${h}h ${m} min` : `${h}h`;
}

export function CategoryRow({
  name,
  slug,
  description,
  items,
  total,
  siteName,
}: {
  name: string;
  slug?: string;
  description?: string;
  items: MediaItem[];
  total: number;
  siteName: string;
}) {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
      {/* Left info panel */}
      <div className="flex shrink-0 flex-col gap-4 lg:w-[343px]">
        <h3 className="text-[20px] font-medium leading-none text-btc-text">
          {slug ? (
            <Link href={`/category/${slug}`} className="hover:underline">
              {name}
            </Link>
          ) : (
            name
          )}
        </h3>
        {description ? (
          <p className="max-w-[343px] text-[14px] leading-[1.3] text-btc-faint">
            {description}
          </p>
        ) : null}
        <div className="flex items-center gap-7 border-t border-btc-border pt-4">
          <span className="flex items-center gap-2 font-mono text-[13px] text-btc-text">
            <ArtTrackIcon className="size-4 text-btc-muted" />
            {total} {total === 1 ? "video" : "videos"}
          </span>
          <span className="flex items-center gap-2 font-mono text-[13px] text-btc-text">
            <PaceIcon className="size-4 text-btc-muted" />
            {totalDurationLabel(items)}
          </span>
        </div>
      </div>

      {/* Horizontal card strip */}
      <div className="no-scrollbar -mx-4 flex gap-10 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        {items.map((item) => (
          <div
            key={item.id}
            className="w-[280px] shrink-0 sm:w-[340px] lg:w-[409px]"
          >
            <LandingVideoCard item={item} siteName={siteName} />
          </div>
        ))}
      </div>
    </div>
  );
}
