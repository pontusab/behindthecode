import { planRepo } from "@btc/db";
import { PlanManager } from "@/components/admin/plan-manager";
import { monetizationEnabled } from "@/lib/entitlements";

export default async function AdminPlansPage() {
  const plans = await planRepo.listPlans();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-tight">Monetization</h1>
        <p className="text-sm text-muted-foreground">
          Define subscription plans. Each maps to a Polar product you create in
          your Polar dashboard.
        </p>
      </div>
      {!monetizationEnabled && (
        <div className="glass rounded-xl px-4 py-3 text-sm text-muted-foreground">
          Monetization is currently disabled. Set{" "}
          <code className="font-mono">POLAR_ENABLED=true</code> and{" "}
          <code className="font-mono">POLAR_ACCESS_TOKEN</code> to enable
          checkout.
        </div>
      )}
      <PlanManager plans={plans} />
    </div>
  );
}
