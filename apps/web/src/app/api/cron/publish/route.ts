import { cacheTags, videoRepo } from "@btc/db";
import { bust, bustCatalog, json } from "@/lib/api";

/**
 * Publishes scheduled videos whose time has arrived.
 * Triggered by Vercel Cron. Protected by CRON_SECRET.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const url = new URL(req.url);
    const provided =
      auth?.replace(/^Bearer\s+/i, "") ?? url.searchParams.get("secret");
    if (provided !== secret) return json({ error: "Unauthorized" }, 401);
  }

  const dueIds = await videoRepo.getDueScheduled();
  const published: string[] = [];

  for (const id of dueIds) {
    const video = await videoRepo.publishVideo(id);
    if (video) {
      published.push(video.id);
      bust(cacheTags.videoSlug(video.slug));
      if (video.categoryId) bust(cacheTags.category(video.categoryId));
    }
  }

  if (published.length > 0) {
    bustCatalog();
  }

  return json({ published: published.length, ids: published });
}
