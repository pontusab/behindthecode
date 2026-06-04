"use client";

import { Button } from "@btc/ui/components/button";
import { toast } from "@btc/ui/components/toaster";
import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

export function PaywallActions({
  videoId,
  reason,
}: {
  videoId: string;
  reason: "needs-subscription" | "needs-purchase" | "needs-signin";
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  if (reason === "needs-signin") {
    return (
      <Button
        variant="gradient"
        className="rounded-full"
        onClick={() =>
          router.push(
            `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
          )
        }
      >
        Sign in to watch
      </Button>
    );
  }

  async function checkout(mode: "subscription" | "purchase") {
    setPending(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, videoId }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
      else throw new Error();
    } catch {
      toast.error("Could not start checkout");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        variant="gradient"
        className="rounded-full"
        disabled={pending}
        onClick={() =>
          checkout(reason === "needs-purchase" ? "purchase" : "subscription")
        }
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Lock className="size-4" />
        )}
        {reason === "needs-purchase" ? "Buy this video" : "Subscribe to watch"}
      </Button>
    </div>
  );
}
