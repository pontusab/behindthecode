import { cacheTags, videoRepo, webhookRepo } from "@btc/db";
import { unwrapWebhook } from "@btc/mux";
import { bust, json } from "@/lib/api";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(req: Request) {
  const body = await req.text();

  let event: any;
  try {
    event = await unwrapWebhook(body, req.headers);
  } catch {
    return json({ error: "Invalid signature" }, 400);
  }

  // Idempotency: skip events we've already processed.
  const eventId: string | undefined = event?.id;
  if (eventId) {
    const fresh = await webhookRepo.markProcessed("mux", eventId);
    if (!fresh) return json({ ok: true, deduped: true });
  }

  const type: string = event?.type ?? "";
  const data: any = event?.data ?? {};

  try {
    switch (type) {
      case "video.asset.ready": {
        const assetId: string = data.id;
        const uploadId: string | undefined = data.upload_id;
        const playback = (data.playback_ids ?? [])[0];
        if (!playback) break;

        let video = uploadId
          ? await videoRepo.findVideoByUploadId(uploadId)
          : null;
        if (!video) video = await videoRepo.findVideoByAssetId(assetId);
        if (!video) break;

        await videoRepo.markVideoReady(video.id, {
          muxAssetId: assetId,
          playbackId: playback.id,
          playbackPolicy: playback.policy === "signed" ? "signed" : "public",
          duration:
            typeof data.duration === "number"
              ? Math.round(data.duration)
              : null,
          aspectRatio: data.aspect_ratio ?? null,
        });

        bust(
          cacheTags.video(video.id),
          cacheTags.videoSlug(video.slug),
          cacheTags.videos,
        );
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[mux webhook] handler error:", err);
    return json({ error: "Handler error" }, 500);
  }

  return json({ ok: true });
}
