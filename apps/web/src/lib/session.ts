import "server-only";
import { getDb } from "@btc/db";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  banned?: boolean | null;
  emailVerified?: boolean;
  stripeCustomerId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionPlanId?: string | null;
  currentPeriodEnd?: number | null;
};

/**
 * Returns the verified JWT claims for the current request, or null.
 * `getClaims()` validates the token signature against the project's published
 * keys (locally for asymmetric keys), so it's safe to trust in server code.
 */
export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  return data ? { claims: data.claims } : null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  // Authoritative role/profile data lives in the profiles table (service role).
  const db = getDb();
  const { data: profile } = await db
    .from("profiles")
    .select("name, image, role, banned, email")
    .eq("id", claims.sub)
    .maybeSingle();

  const metaRole =
    (claims.app_metadata as { role?: string } | undefined)?.role ?? null;
  const claimEmail = typeof claims.email === "string" ? claims.email : null;

  return {
    id: claims.sub,
    name: profile?.name ?? "",
    email: profile?.email ?? claimEmail ?? "",
    image: profile?.image ?? null,
    role: profile?.role ?? metaRole ?? "user",
    banned: profile?.banned ?? false,
    emailVerified: true,
  };
}

export function isAdmin(user: SessionUser | null | undefined): boolean {
  return user?.role === "admin";
}

/** For admin pages: redirect non-admins. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin");
  if (!isAdmin(user)) redirect("/");
  return user;
}

/** For viewer pages requiring any signed-in user. */
export async function requireUser(redirectTo = "/login"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}
