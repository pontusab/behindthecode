import { planRepo, purchaseRepo, webhookRepo } from "@btc/db";
import type Stripe from "stripe";
import { json } from "@/lib/api";
import { getUserIdByCustomer, setBilling } from "@/lib/billing";
import { getStripe } from "@/lib/stripe";

async function alreadyProcessed(eventId: string): Promise<boolean> {
  const fresh = await webhookRepo.markProcessed("stripe", eventId);
  return !fresh;
}

async function syncSubscription(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const userId =
    (sub.metadata?.userId as string | undefined) ??
    (await getUserIdByCustomer(customerId));
  if (!userId) return;

  const priceId = sub.items.data[0]?.price?.id;
  const plan = priceId ? await planRepo.findPlanByPriceId(priceId) : null;
  const periodEnd =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    null;

  await setBilling({
    userId,
    stripeCustomerId: customerId,
    status: sub.status,
    planId: plan?.id ?? (sub.metadata?.planId as string | undefined) ?? null,
    currentPeriodEnd: periodEnd,
    updatedAt: Date.now(),
  });
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return json({ error: "Webhook not configured" }, 501);

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return json({ error: "Missing signature" }, 400);

  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(body, sig, secret);
  } catch {
    return json({ error: "Invalid signature" }, 400);
  }

  if (await alreadyProcessed(event.id))
    return json({ ok: true, deduped: true });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = session.metadata ?? {};
        if (meta.kind === "purchase" && meta.userId && meta.videoId) {
          await purchaseRepo.recordPurchase({
            userId: meta.userId,
            videoId: meta.videoId,
            stripePaymentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            amount: session.amount_total ?? 0,
            currency: session.currency ?? "usd",
          });
        } else if (session.mode === "subscription" && session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const sub = await getStripe().subscriptions.retrieve(subId);
          await syncSubscription(sub);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error:", err);
    return json({ error: "Handler error" }, 500);
  }

  return json({ ok: true });
}
