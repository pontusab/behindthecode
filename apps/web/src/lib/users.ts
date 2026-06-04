import "server-only";
import { getDb } from "@btc/db";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  banned: boolean;
};

export async function listUsers(limit = 200): Promise<AdminUser[]> {
  const { data } = await getDb()
    .from("profiles")
    .select("id, name, email, image, role, banned")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((u) => ({
    id: u.id,
    name: u.name ?? "",
    email: u.email ?? "",
    image: u.image ?? null,
    role: u.role ?? "user",
    banned: Boolean(u.banned),
  }));
}

export type RecentMember = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: number;
};

export async function listRecentMembers(limit = 5): Promise<RecentMember[]> {
  const { data } = await getDb()
    .from("profiles")
    .select("id, name, email, image, role, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((u) => ({
    id: u.id,
    name: u.name ?? "",
    email: u.email ?? "",
    image: u.image ?? null,
    role: u.role ?? "user",
    createdAt: u.created_at ? new Date(u.created_at).getTime() : Date.now(),
  }));
}

export async function countAdmins(): Promise<number> {
  const { count } = await getDb()
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  return count ?? 0;
}

export async function setUserRole(
  userId: string,
  role: "admin" | "user",
): Promise<void> {
  const db = getDb();
  await db.from("profiles").update({ role }).eq("id", userId);
  // Mirror into app_metadata so JWT-based checks stay in sync.
  await db.auth.admin.updateUserById(userId, { app_metadata: { role } });
}

export async function setUserBanned(
  userId: string,
  banned: boolean,
): Promise<void> {
  const db = getDb();
  await db.from("profiles").update({ banned }).eq("id", userId);
  await db.auth.admin.updateUserById(userId, {
    ban_duration: banned ? "876000h" : "none",
  });
}
