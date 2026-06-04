import { planRepo, purchaseRepo, videoRepo } from "@btc/db";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  type AccountData,
  AccountView,
} from "@/components/account/account-view";
import { getBilling } from "@/lib/billing";
import { ensureDynamicRoute } from "@/lib/dynamic-route";
import { monetizationEnabled } from "@/lib/entitlements";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountPageFallback />}>
      <AccountPageContent />
    </Suspense>
  );
}

async function AccountPageContent() {
  await ensureDynamicRoute();
  const user = await requireUser("/login?redirect=/account");

  let billing: AccountData["billing"] = null;
  let purchases: AccountData["purchases"] = [];
  let hasPlans = false;

  if (monetizationEnabled) {
    const [b, rawPurchases, plans] = await Promise.all([
      getBilling(user.id),
      purchaseRepo.listPurchases(user.id),
      planRepo.listPlans(),
    ]);
    hasPlans = plans.length > 0;

    let planName: string | null = null;
    if (b?.planId) planName = (await planRepo.getPlan(b.planId))?.name ?? null;
    billing = b
      ? { status: b.status, planName, currentPeriodEnd: b.currentPeriodEnd }
      : null;

    if (rawPurchases.length > 0) {
      const videos = await videoRepo.getVideos(
        rawPurchases.map((p) => p.videoId),
      );
      const byId = new Map(videos.map((v) => [v.id, v]));
      purchases = rawPurchases
        .map((p) => {
          const v = byId.get(p.videoId);
          if (!v) return null;
          return {
            videoId: p.videoId,
            title: v.title,
            slug: v.slug,
            amount: p.amount,
            currency: p.currency,
          };
        })
        .filter((p): p is AccountData["purchases"][number] => p !== null);
    }
  }

  const data: AccountData = {
    user: { name: user.name, email: user.email, image: user.image ?? null },
    monetizationEnabled,
    billing,
    hasPlans,
    purchases,
  };

  return <AccountView data={data} />;
}

function AccountPageFallback() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12 sm:px-6">
      <div className="h-8 w-32 animate-pulse rounded bg-muted" />
      <div className="h-40 animate-pulse rounded-lg border border-border bg-muted/40" />
    </div>
  );
}
