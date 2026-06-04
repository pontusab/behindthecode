import "server-only";
import { purchaseRepo, type Video } from "@btc/db";
import { getBilling, isActive } from "./billing";
import type { SessionUser } from "./session";

export const monetizationEnabled =
  process.env.STRIPE_ENABLED === "true" &&
  Boolean(process.env.STRIPE_SECRET_KEY);

export type WatchAccess = {
  allowed: boolean;
  gated: boolean;
  reason:
    | "free"
    | "subscriber"
    | "purchased"
    | "needs-subscription"
    | "needs-purchase"
    | "needs-signin";
};

async function hasActiveSubscription(
  user: SessionUser | null,
): Promise<boolean> {
  if (!user) return false;
  return isActive(await getBilling(user.id));
}

export async function resolveWatchAccess(
  video: Pick<Video, "id" | "access">,
  user: SessionUser | null,
): Promise<WatchAccess> {
  if (!monetizationEnabled || video.access === "free") {
    return { allowed: true, gated: false, reason: "free" };
  }

  if (video.access === "subscribers") {
    if (await hasActiveSubscription(user))
      return { allowed: true, gated: true, reason: "subscriber" };
    return {
      allowed: false,
      gated: true,
      reason: user ? "needs-subscription" : "needs-signin",
    };
  }

  // access === "purchase"
  if (await hasActiveSubscription(user))
    return { allowed: true, gated: true, reason: "subscriber" };
  if (user && (await purchaseRepo.hasPurchased(user.id, video.id))) {
    return { allowed: true, gated: true, reason: "purchased" };
  }
  return {
    allowed: false,
    gated: true,
    reason: user ? "needs-purchase" : "needs-signin",
  };
}
