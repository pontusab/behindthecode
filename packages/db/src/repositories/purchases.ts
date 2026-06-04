import { getDb } from "../client";
import { rowToPurchase } from "../mappers";
import type { Purchase } from "../types";

export async function recordPurchase(input: {
  userId: string;
  videoId: string;
  polarOrderId?: string | null;
  amount?: number;
  currency?: string;
}): Promise<Purchase> {
  const { data, error } = await getDb()
    .from("purchases")
    .upsert(
      {
        user_id: input.userId,
        video_id: input.videoId,
        polar_order_id: input.polarOrderId ?? null,
        amount: input.amount ?? 0,
        currency: input.currency ?? "usd",
      },
      { onConflict: "user_id,video_id" },
    )
    .select("*")
    .single();
  if (error || !data)
    throw new Error(error?.message ?? "Failed to record purchase");
  return rowToPurchase(data);
}

export async function hasPurchased(
  userId: string,
  videoId: string,
): Promise<boolean> {
  const { data } = await getDb()
    .from("purchases")
    .select("video_id")
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .maybeSingle();
  return data != null;
}

export async function listPurchases(userId: string): Promise<Purchase[]> {
  const { data } = await getDb()
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(rowToPurchase);
}

export async function getPurchase(
  userId: string,
  videoId: string,
): Promise<Purchase | null> {
  const { data } = await getDb()
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .maybeSingle();
  return data ? rowToPurchase(data) : null;
}
