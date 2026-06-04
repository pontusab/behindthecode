import { engagementRepo, rateLimiters } from "@btc/db";
import { clientFingerprint, clientIp, json } from "@/lib/api";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { success } = await rateLimiters.view().limit(`view:${clientIp(req)}`);
  if (!success) return json({ error: "Too many requests" }, 429);

  const views = await engagementRepo.incrementView(id, clientFingerprint(req));
  return json({ views });
}
