import { planRepo, videoRepo } from "@btc/db";
import { json, requireApiUser } from "@/lib/api";
import { monetizationEnabled } from "@/lib/entitlements";
import { appUrl, getPolar } from "@/lib/polar";

export async function POST(req: Request) {
  if (!monetizationEnabled)
    return json({ error: "Monetization is disabled" }, 501);
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;
  const user = auth.user;

  let payload: { mode?: string; planId?: string; videoId?: string };
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const polar = getPolar();

  try {
    if (payload.mode === "subscription") {
      const plans = await planRepo.listPlans();
      const plan = payload.planId
        ? await planRepo.getPlan(payload.planId)
        : plans[0];
      if (!plan?.polarProductId)
        return json({ error: "Plan not available" }, 400);

      // Polar auto-creates (or reuses) a customer keyed by our external id, so
      // we don't have to manage Stripe-style customer records ourselves.
      const checkout = await polar.checkouts.create({
        products: [plan.polarProductId],
        externalCustomerId: user.id,
        customerEmail: user.email,
        successUrl: `${appUrl()}/account?checkout=success`,
        metadata: { userId: user.id, planId: plan.id, kind: "subscription" },
      });
      return json({ url: checkout.url });
    }

    if (payload.mode === "purchase" && payload.videoId) {
      const video = await videoRepo.getVideo(payload.videoId);
      if (!video) return json({ error: "Video not found" }, 404);
      if (!video.polarProductId)
        return json({ error: "This video isn't available for purchase" }, 400);

      const checkout = await polar.checkouts.create({
        products: [video.polarProductId],
        externalCustomerId: user.id,
        customerEmail: user.email,
        successUrl: `${appUrl()}/v/${video.slug}?purchase=success`,
        metadata: { userId: user.id, videoId: video.id, kind: "purchase" },
      });
      return json({ url: checkout.url });
    }

    return json({ error: "Invalid checkout mode" }, 400);
  } catch (err) {
    console.error("[polar checkout]", err);
    return json({ error: "Could not start checkout" }, 500);
  }
}
