import { type MediaItem, posterFor } from "@btc/ui";
import Image from "next/image";
import Link from "next/link";
import { LockIcon, PlayArrowIcon } from "@/components/home/icons";

function minuteLabel(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m} min` : `${h}h`;
}

export function LandingVideoCard({
  item,
  siteName,
}: {
  item: MediaItem;
  siteName: string;
}) {
  const poster = posterFor(item, 720);
  const gated = item.access && item.access !== "free";
  const href = `/v/${item.slug}`;

  return (
    <Link href={href} className="group flex flex-col gap-4">
      <div className="relative aspect-5/4 w-full overflow-hidden bg-black">
        {poster ? (
          <Image
            src={poster}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 80vw, 409px"
            className="object-cover opacity-90 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-btc-faint">
            <PlayArrowIcon className="size-9" />
          </div>
        )}

        <span className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-[999px] border border-white/15 bg-black/45 text-white backdrop-blur-md transition-colors group-hover:bg-black/70">
          {gated ? (
            <LockIcon className="size-[18px]" />
          ) : (
            <PlayArrowIcon className="size-5" />
          )}
        </span>
      </div>

      <div className="flex items-start justify-between gap-3 font-mono text-[12px] leading-[1.4]">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-btc-muted">{item.title}</span>
          <span className="truncate text-btc-text">{siteName}</span>
        </div>
        {item.duration ? (
          <span className="shrink-0 text-right text-btc-muted">
            {minuteLabel(item.duration)}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
