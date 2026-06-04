"use server";

import { getDb } from "@btc/db";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";

export async function updateDisplayNameAction(name: string) {
  const user = await requireUser();
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Name can't be empty" };

  const db = getDb();
  await db.from("profiles").update({ name: trimmed }).eq("id", user.id);
  await db.auth.admin.updateUserById(user.id, {
    user_metadata: { name: trimmed },
  });

  revalidatePath("/account");
  return { ok: true };
}
