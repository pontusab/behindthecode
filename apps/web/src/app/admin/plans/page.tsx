import { planRepo } from "@btc/db";
import { PlanManager } from "@/components/admin/plan-manager";
import { monetizationEnabled } from "@/lib/entitlements";
import { requireAdmin } from "@/lib/session";

export default async function AdminPlansPage() {
  await requireAdmin();
  const plans = await planRepo.listPlans();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Monetization</h1>
        <p className="text-sm text-muted-foreground">
          Define subscription plans. Each maps to a Stripe Price you create in
          your Stripe dashboard.
        </p>
      </div>
      {!monetizationEnabled && (
        <div className="glass rounded-xl px-4 py-3 text-sm text-muted-foreground">
          Monetization is currently disabled. Set{" "}
          <code className="font-mono">STRIPE_ENABLED=true</code> and{" "}
          <code className="font-mono">STRIPE_SECRET_KEY</code> to enable
          checkout.
        </div>
      )}
      <PlanManager plans={plans} />
    </div>
  );
}
