import "server-only";
import { getDb } from "@btc/db";

export type BillingRecord = {
  userId: string;
  stripeCustomerId: string | null;
  status: string | null; // active | trialing | past_due | canceled | ...
  planId: string | null;
  currentPeriodEnd: number | null; // unix seconds
  updatedAt: number;
};

function rowToRecord(r: {
  user_id: string;
  stripe_customer_id: string | null;
  status: string | null;
  plan_id: string | null;
  current_period_end: number | null;
  updated_at: string;
}): BillingRecord {
  return {
    userId: r.user_id,
    stripeCustomerId: r.stripe_customer_id,
    status: r.status,
    planId: r.plan_id,
    currentPeriodEnd: r.current_period_end,
    updatedAt: new Date(r.updated_at).getTime(),
  };
}

export async function getBilling(
  userId: string,
): Promise<BillingRecord | null> {
  const { data } = await getDb()
    .from("billing")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data ? rowToRecord(data) : null;
}

export async function setBilling(record: BillingRecord): Promise<void> {
  await getDb().from("billing").upsert(
    {
      user_id: record.userId,
      stripe_customer_id: record.stripeCustomerId,
      status: record.status,
      plan_id: record.planId,
      current_period_end: record.currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

export async function linkCustomer(
  customerId: string,
  userId: string,
): Promise<void> {
  await getDb().from("billing").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

export async function getUserIdByCustomer(
  customerId: string,
): Promise<string | null> {
  const { data } = await getDb()
    .from("billing")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.user_id ?? null;
}

export function isActive(billing: BillingRecord | null): boolean {
  if (!billing || !billing.status) return false;
  if (billing.status !== "active" && billing.status !== "trialing")
    return false;
  if (billing.currentPeriodEnd && billing.currentPeriodEnd * 1000 < Date.now())
    return false;
  return true;
}
