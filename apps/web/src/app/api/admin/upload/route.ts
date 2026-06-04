import { type AccessLevel, cacheTags, rateLimiters, videoRepo } from "@btc/db";
import { createDirectUpload } from "@btc/mux";
import { bust, json, requireApiAdmin } from "@/lib/api";

export async function POST(req: Request) {
  const auth = await requireApiAdmin();
  if ("response" in auth) return auth.response;

  const { success } = await rateLimiters
    .upload()
    .limit(`upload:${auth.user.id}`);
  if (!success) return json({ error: "Too many uploads" }, 429);

  let title = "Untitled video";
  let access: AccessLevel = "free";
  try {
    const data = (await req.json()) as { title?: string; access?: AccessLevel };
    if (data.title?.trim()) title = data.title.trim();
    if (data.access) access = data.access;
  } catch {
    // allow empty body — defaults apply
  }

  const policy = access === "free" ? "public" : "signed";
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

  const upload = await createDirectUpload({
    corsOrigin: origin,
    policy,
    generateCaptions: true,
  });

  const video = await videoRepo.createVideo({
    title,
    access,
    playbackPolicy: policy,
    muxUploadId: upload.id,
  });

  bust(cacheTags.videos);

  return json({
    uploadUrl: upload.url,
    uploadId: upload.id,
    videoId: video.id,
  });
}
