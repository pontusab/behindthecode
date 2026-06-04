import { cacheTags, videoRepo } from "@btc/db";
import { bust, json, requireApiAdmin } from "@/lib/api";
import { uploadPublicFile } from "@/lib/storage";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(req: Request) {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;

  const form = await req.formData();
  const file = form.get("file");
  const videoId = form.get("videoId");

  if (!(file instanceof File)) return json({ error: "No file provided" }, 400);
  if (!ALLOWED.includes(file.type))
    return json({ error: "Unsupported image type" }, 400);
  if (file.size > MAX_BYTES)
    return json({ error: "Image too large (max 8MB)" }, 400);

  const ext = file.type.split("/")[1] ?? "jpg";
  let url: string;
  try {
    url = await uploadPublicFile(
      "thumbnails",
      `${crypto.randomUUID()}.${ext}`,
      file,
      file.type,
    );
  } catch {
    return json({ error: "Upload failed" }, 500);
  }

  if (typeof videoId === "string" && videoId) {
    const video = await videoRepo.updateVideo(videoId, {
      customPosterUrl: url,
    });
    if (video) {
      bust(
        cacheTags.video(video.id),
        cacheTags.videoSlug(video.slug),
        cacheTags.videos,
      );
    }
  }

  return json({ url });
}
