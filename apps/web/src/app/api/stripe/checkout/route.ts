import { planRepo, settingsRepo, videoRepo } from "@btc/db";
import { json, requireApiUser } from "@/lib/api";
import { getBilling, setBilling } from "@/lib/billing";
import { monetizationEnabled } from "@/lib/entitlements";
import { appUrl, getStripe } from "@/lib/stripe";

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

  const stripe = getStripe();

  // Ensure a Stripe customer exists for this user.
  let billing = await getBilling(user.id);
  let customerId = billing?.stripeCustomerId ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    billing = {
      userId: user.id,
      stripeCustomerId: customerId,
      status: billing?.status ?? null,
      planId: billing?.planId ?? null,
      currentPeriodEnd: billing?.currentPeriodEnd ?? null,
      updatedAt: Date.now(),
    };
    await setBilling(billing);
  }

  try {
    if (payload.mode === "subscription") {
      const plans = await planRepo.listPlans();
      const plan = payload.planId
        ? await planRepo.getPlan(payload.planId)
        : plans[0];
      if (!plan?.stripePriceId)
        return json({ error: "Plan not available" }, 400);

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: plan.stripePriceId, quantity: 1 }],
        success_url: `${appUrl()}/account?checkout=success`,
        cancel_url: `${appUrl()}/account?checkout=cancelled`,
        metadata: { userId: user.id, planId: plan.id, kind: "subscription" },
        subscription_data: { metadata: { userId: user.id, planId: plan.id } },
        allow_promotion_codes: true,
      });
      return json({ url: session.url });
    }

    if (payload.mode === "purchase" && payload.videoId) {
      const video = await videoRepo.getVideo(payload.videoId);
      if (!video) return json({ error: "Video not found" }, 404);
      const settings = await settingsRepo.getSettings();

      const lineItem = video.stripePriceId
        ? { price: video.stripePriceId, quantity: 1 }
        : {
            quantity: 1,
            price_data: {
              currency: settings.currency || "usd",
              unit_amount: video.priceAmount ?? 500,
              product_data: { name: video.title },
            },
          };

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId,
        line_items: [lineItem],
        success_url: `${appUrl()}/watch/${video.slug}?purchase=success`,
        cancel_url: `${appUrl()}/watch/${video.slug}?purchase=cancelled`,
        metadata: { userId: user.id, videoId: video.id, kind: "purchase" },
        payment_intent_data: {
          metadata: { userId: user.id, videoId: video.id },
        },
      });
      return json({ url: session.url });
    }

    return json({ error: "Invalid checkout mode" }, 400);
  } catch (err) {
    console.error("[stripe checkout]", err);
    return json({ error: "Could not start checkout" }, 500);
  }
}
