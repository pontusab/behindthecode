"use client";

import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Prefer the new publishable key (`sb_publishable_...`); fall back to the
// legacy anon JWT for older local stacks.
const publishableKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

let client: ReturnType<typeof createBrowserClient> | null = null;

/** Browser Supabase client (singleton) for client components. */
export function createSupabaseBrowserClient() {
  if (client) return client;
  client = createBrowserClient(url, publishableKey);
  return client;
}
