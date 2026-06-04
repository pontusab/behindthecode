import { getDb } from "../client";

/**
 * Idempotency guard for incoming webhooks. Returns `true` the first time an
 * event id is seen (caller should process it), `false` on duplicates.
 */
export async function markProcessed(
  provider: string,
  eventId: string,
): Promise<boolean> {
  const { error } = await getDb()
    .from("processed_webhooks")
    .insert({ id: `${provider}:${eventId}`, provider });
  // Unique violation -> already processed.
  if (error) return false;
  return true;
}
