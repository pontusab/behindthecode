import { getDb } from "../client";
import { defaultSettings, type Settings, settingsSchema } from "../types";

export async function getSettings(): Promise<Settings> {
  const { data } = await getDb()
    .from("settings")
    .select("data")
    .eq("id", 1)
    .maybeSingle();
  const stored = (data?.data as Partial<Settings> | undefined) ?? null;
  if (!stored) return defaultSettings;
  // Merge with defaults so new fields are always present.
  return settingsSchema.parse({ ...defaultSettings, ...stored });
}

export async function updateSettings(
  patch: Partial<Settings>,
): Promise<Settings> {
  const current = await getSettings();
  const updated = settingsSchema.parse({
    ...current,
    ...patch,
    updatedAt: Date.now(),
  });
  await getDb()
    .from("settings")
    .upsert({ id: 1, data: updated, updated_at: new Date().toISOString() });
  return updated;
}
