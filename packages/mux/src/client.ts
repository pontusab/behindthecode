import Mux from "@mux/mux-node";

let client: Mux | null = null;

/** Lazily-initialized Mux client. */
export function getMux(): Mux {
  if (client) return client;
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new Error(
      "Missing MUX_TOKEN_ID / MUX_TOKEN_SECRET environment variables.",
    );
  }
  client = new Mux({
    tokenId,
    tokenSecret,
    webhookSecret: process.env.MUX_WEBHOOK_SECRET ?? undefined,
    // Used for signed playback of gated (paid) videos.
    jwtSigningKey: process.env.MUX_SIGNING_KEY_ID ?? undefined,
    jwtPrivateKey: process.env.MUX_SIGNING_PRIVATE_KEY ?? undefined,
  });
  return client;
}

export function hasSigningKey(): boolean {
  return Boolean(
    process.env.MUX_SIGNING_KEY_ID && process.env.MUX_SIGNING_PRIVATE_KEY,
  );
}

export { Mux };
