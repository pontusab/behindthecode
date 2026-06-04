import { json, requireApiUser } from "@/lib/api";
import { getBilling } from "@/lib/billing";
import { monetizationEnabled } from "@/lib/entitlements";
import { appUrl, getStripe } from "@/lib/stripe";

export async function POST() {
  if (!monetizationEnabled)
    return json({ error: "Monetization is disabled" }, 501);
  const auth = await requireApiUser();
  if ("response" in auth) return auth.response;

  const billing = await getBilling(auth.user.id);
  if (!billing?.stripeCustomerId) {
    return json({ error: "No billing account found" }, 400);
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: billing.stripeCustomerId,
      return_url: `${appUrl()}/account`,
    });
    return json({ url: session.url });
  } catch (err) {
    console.error("[stripe portal]", err);
    return json({ error: "Could not open billing portal" }, 500);
  }
}
