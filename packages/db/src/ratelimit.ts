import { getDb } from "./client";

export type LimitResult = { success: boolean };

/** Fixed-window limiter backed by the Postgres `check_rate_limit` RPC. */
export class Ratelimiter {
  constructor(
    private readonly prefix: string,
    private readonly max: number,
    private readonly windowSeconds: number,
  ) {}

  async limit(key: string): Promise<LimitResult> {
    try {
      const { data, error } = await getDb().rpc("check_rate_limit", {
        p_key: `${this.prefix}:${key}`,
        p_max: this.max,
        p_window_seconds: this.windowSeconds,
      });
      if (error) return { success: true }; // fail open
      return { success: data !== false };
    } catch {
      return { success: true }; // fail open
    }
  }
}

const cache = new Map<string, Ratelimiter>();

export function getRatelimit(
  prefix: string,
  max: number,
  windowSeconds: number,
): Ratelimiter {
  const key = `${prefix}:${max}:${windowSeconds}`;
  const existing = cache.get(key);
  if (existing) return existing;
  const limiter = new Ratelimiter(prefix, max, windowSeconds);
  cache.set(key, limiter);
  return limiter;
}

export const rateLimiters = {
  like: () => getRatelimit("like", 30, 60),
  comment: () => getRatelimit("comment", 8, 60),
  login: () => getRatelimit("login", 10, 300),
  signup: () => getRatelimit("signup", 5, 600),
  view: () => getRatelimit("view", 60, 60),
  upload: () => getRatelimit("upload", 30, 60),
};
