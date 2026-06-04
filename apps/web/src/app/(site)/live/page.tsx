import { MuxPlayer } from "@btc/ui/components/mux-player";
import type { Metadata } from "next";
import { getSettingsCached } from "@/lib/catalog";

export const metadata: Metadata = { title: "Live" };

export default async function LivePage() {
  const settings = await getSettingsCached();
  const playbackId = settings.livePlaybackId?.trim();
  const title = settings.liveTitle?.trim() || `${settings.siteName} — Live`;
  const isLive = Boolean(playbackId);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pb-28 pt-12 sm:px-10 sm:pt-20">
      <div className="flex flex-col items-center gap-8">
        {isLive ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
            <MuxPlayer
              className="size-full"
              streamType="live"
              playbackId={playbackId as string}
              title={title}
              accentColor="#ffffff"
              autoPlay
              muted
            />
            <span className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-white backdrop-blur-md">
              <span className="size-2 rounded-full bg-btc-error shadow-[0_0_8px_2px_rgba(236,39,41,0.7)]" />
              Live
            </span>
          </div>
        ) : (
          <div className="grid aspect-video w-full place-items-center rounded-2xl border border-btc-border bg-btc-surface">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="flex items-center gap-2 rounded-full border border-btc-border px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-btc-muted">
                <span className="size-2 rounded-full bg-btc-muted" />
                Offline
              </span>
              <p className="max-w-sm text-[15px] leading-normal text-btc-muted">
                No live stream right now. Check back soon — or follow along on
                the channel for the next broadcast.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
