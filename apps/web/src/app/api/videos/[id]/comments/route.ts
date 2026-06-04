import { commentRepo, rateLimiters, settingsRepo, videoRepo } from "@btc/db";
import { json, requireApiUser } from "@/lib/api";
import { moderateComment } from "@/lib/moderation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  const settings = await settingsRepo.getSettings();
  if (!settings.commentsEnabled) {
    return json({ error: "Comments are disabled" }, 403);
  }

  let body: string;
  try {
    const data = (await req.json()) as { body?: unknown };
    body = typeof data.body === "string" ? data.body.trim() : "";
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  if (!body) return json({ error: "Comment cannot be empty" }, 400);
  if (body.length > 2000) return json({ error: "Comment is too long" }, 400);

  const video = await videoRepo.getVideo(id);
  if (!video || video.publishStatus !== "published") {
    return json({ error: "Video not found" }, 404);
  }

  const { success } = await rateLimiters
    .comment()
    .limit(`comment:${auth.user.id}`);
  if (!success) return json({ error: "You're commenting too fast" }, 429);

  let status: "published" | "flagged" = "published";
  let aiReason: string | null = null;
  if (settings.aiModeration) {
    const moderation = await moderateComment(body);
    if (moderation.flagged) {
      status = "flagged";
      aiReason = moderation.reason;
    }
  }

  const comment = await commentRepo.createComment({
    videoId: id,
    userId: auth.user.id,
    authorName: auth.user.name,
    authorImage: auth.user.image ?? null,
    body,
    status,
    aiReason,
  });

  return json({ id: comment.id, status });
}
