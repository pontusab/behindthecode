import "server-only";
import { connection } from "next/server";

/** Opt auth-gated routes out of static prerender (admin, account). */
export async function ensureDynamicRoute() {
  await connection();
}
