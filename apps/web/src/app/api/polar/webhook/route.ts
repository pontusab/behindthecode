import { planRepo, purchaseRepo, webhookRepo } from "@btc/db";
import {
  validateEvent,
  WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { json } from "@/lib/api";
import { getUserIdByCustomer, setBilling } from "@/lib/billing";

type PolarEvent = ReturnType<typeof validateEvent>;
type SubscriptionData = Extract<
  PolarEvent,
  { type: "subscription.updated" }
>["data"];

async function syncSubscription(sub: SubscriptionData) {
  const customerId = sub.customerId;
  const userId =
    sub.customer?.externalId ??
    (sub.metadata?.userId != null ? String(sub.metadata.userId) : null) ??
    (await getUserIdByCustomer(customerId));
  if (!userId) return;

  const plan = sub.productId
    ? await planRepo.findPlanByProductId(sub.productId)
    : null;
  const periodEnd = sub.currentPeriodEnd
    ? Math.floor(new Date(sub.currentPeriodEnd).getTime() / 1000)
    : null;

  await setBilling({
    userId,
    polarCustomerId: customerId,
    status: sub.status,
    planId:
      plan?.id ??
      (sub.metadata?.planId != null ? String(sub.metadata.planId) : null),
    currentPeriodEnd: periodEnd,
    updatedAt: Date.now(),
  });
}

export async function POST(req: Request) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) return json({ error: "Webhook not configured" }, 501);

  const body = await req.text();
  const headers = {
    "webhook-id": req.headers.get("webhook-id") ?? "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": req.headers.get("webhook-signature") ?? "",
  };

  let event: PolarEvent;
  try {
    event = validateEvent(body, headers, secret);
  } catch (err) {
    if (err instanceof WebhookVerificationError)
      return json({ error: "Invalid signature" }, 403);
    return json({ error: "Invalid payload" }, 400);
  }

  // Standard-webhooks delivery id makes each delivery idempotent.
  const deliveryId =
    headers["webhook-id"] || `${event.type}:${event.data.id ?? ""}`;
  const fresh = await webhookRepo.markProcessed("polar", deliveryId);
  if (!fresh) return json({ ok: true, deduped: true });

  try {
    switch (event.type) {
      case "order.paid": {
        const order = event.data;
        const meta = order.metadata ?? {};
        if (meta.kind === "purchase" && meta.userId && meta.videoId) {
          await purchaseRepo.recordPurchase({
            userId: String(meta.userId),
            videoId: String(meta.videoId),
            polarOrderId: order.id,
            amount: order.totalAmount ?? 0,
            currency: order.currency ?? "usd",
          });
        }
        break;
      }

      case "subscription.created":
      case "subscription.updated":
      case "subscription.active":
      case "subscription.canceled":
      case "subscription.revoked": {
        await syncSubscription(event.data);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[polar webhook] handler error:", err);
    return json({ error: "Handler error" }, 500);
  }

  return json({ ok: true });
}
