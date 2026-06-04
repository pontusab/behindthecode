import { bustCatalog, json } from "@/lib/api";

/**
 * Busts catalog cache tags and revalidates the homepage.
 * Use after seeding or bulk DB changes. Protected by CRON_SECRET.
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

  bustCatalog();

  return json({ revalidated: true });
}
