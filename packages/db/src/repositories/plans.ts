import { getDb } from "../client";
import type { Database } from "../database.types";
import { rowToPlan } from "../mappers";
import type { Plan, PlanInterval } from "../types";

type PlanUpdate = Database["public"]["Tables"]["plans"]["Update"];

export async function getPlan(id: string): Promise<Plan | null> {
  const { data } = await getDb()
    .from("plans")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? rowToPlan(data) : null;
}

export async function getPlans(ids: string[]): Promise<Plan[]> {
  if (ids.length === 0) return [];
  const { data } = await getDb().from("plans").select("*").in("id", ids);
  return (data ?? []).map(rowToPlan);
}

export async function listPlans(): Promise<Plan[]> {
  const { data } = await getDb()
    .from("plans")
    .select("*")
    .order("amount", { ascending: true });
  return (data ?? []).map(rowToPlan);
}

export async function createPlan(input: {
  name: string;
  description?: string;
  stripePriceId: string;
  interval?: PlanInterval;
  amount?: number;
  currency?: string;
}): Promise<Plan> {
  const { data, error } = await getDb()
    .from("plans")
    .insert({
      name: input.name,
      description: input.description ?? "",
      stripe_price_id: input.stripePriceId,
      interval: input.interval ?? "month",
      amount: input.amount ?? 0,
      currency: input.currency ?? "usd",
    })
    .select("*")
    .single();
  if (error || !data)
    throw new Error(error?.message ?? "Failed to create plan");
  return rowToPlan(data);
}

export async function updatePlan(
  id: string,
  patch: Partial<Omit<Plan, "id" | "createdAt">>,
): Promise<Plan | null> {
  const update: PlanUpdate = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.stripePriceId !== undefined)
    update.stripe_price_id = patch.stripePriceId;
  if (patch.interval !== undefined) update.interval = patch.interval;
  if (patch.amount !== undefined) update.amount = patch.amount;
  if (patch.currency !== undefined) update.currency = patch.currency;
  const { data } = await getDb()
    .from("plans")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  return data ? rowToPlan(data) : null;
}

export async function deletePlan(id: string): Promise<void> {
  await getDb().from("plans").delete().eq("id", id);
}

export async function findPlanByPriceId(
  stripePriceId: string,
): Promise<Plan | null> {
  const { data } = await getDb()
    .from("plans")
    .select("*")
    .eq("stripe_price_id", stripePriceId)
    .limit(1)
    .maybeSingle();
  return data ? rowToPlan(data) : null;
}
