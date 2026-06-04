import { json, requireApiUser } from "@/lib/api";
import { getBilling } from "@/lib/billing";
import { monetizationEnabled } from "@/lib/entitlements";
import { getPolar } from "@/lib/polar";

export async function POST() {
  if (!monetizationEnabled)
    return json({ error: "Monetization is disabled" }, 501);
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  const billing = await getBilling(auth.user.id);
  if (!billing?.polarCustomerId) {
    return json({ error: "No billing account found" }, 400);
  }

  try {
    const session = await getPolar().customerSessions.create({
      externalCustomerId: auth.user.id,
    });
    return json({ url: session.customerPortalUrl });
  } catch (err) {
    console.error("[polar portal]", err);
    return json({ error: "Could not open billing portal" }, 500);
  }
}
