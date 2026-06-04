"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@btc/ui/components/avatar";
import { Badge } from "@btc/ui/components/badge";
import { Button } from "@btc/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@btc/ui/components/card";
import { Input } from "@btc/ui/components/input";
import { Label } from "@btc/ui/components/label";
import { toast } from "@btc/ui/components/toaster";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { updateDisplayNameAction } from "@/app/(site)/account/actions";

export type AccountData = {
  user: { name: string; email: string; image: string | null };
  monetizationEnabled: boolean;
  billing: {
    status: string | null;
    planName: string | null;
    currentPeriodEnd: number | null;
  } | null;
  hasPlans: boolean;
  purchases: {
    videoId: string;
    title: string;
    slug: string;
    amount: number;
    currency: string;
  }[];
};

export function AccountView({ data }: { data: AccountData }) {
  const router = useRouter();
  const [name, setName] = React.useState(data.user.name);
  const [savingName, setSavingName] = React.useState(false);
  const [billingBusy, setBillingBusy] = React.useState<string | null>(null);

  const initials = (data.user.name || data.user.email || "?")
    .slice(0, 2)
    .toUpperCase();
  const active =
    data.billing?.status === "active" || data.billing?.status === "trialing";

  async function saveName() {
    if (!name.trim() || name === data.user.name) return;
    setSavingName(true);
    try {
      const res = await updateDisplayNameAction(name.trim());
      if (!res.ok) throw new Error(res.error);
      toast.success("Profile updated");
      router.refresh();
    } catch {
      toast.error("Could not update profile");
    } finally {
      setSavingName(false);
    }
  }

  async function billingAction(endpoint: "checkout" | "portal", body?: object) {
    setBillingBusy(endpoint);
    try {
      const res = await fetch(`/api/polar/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) throw new Error();
      const json = (await res.json()) as { url?: string };
      if (json.url) window.location.href = json.url;
      else throw new Error();
    } catch {
      toast.error("Something went wrong");
      setBillingBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">Your account</h1>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {data.user.image ? (
                <AvatarImage src={data.user.image} alt={data.user.name} />
              ) : null}
              <AvatarFallback className="bg-primary/15 text-lg text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-muted-foreground">
              {data.user.email}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button
                onClick={saveName}
                disabled={savingName || name === data.user.name}
              >
                {savingName ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}{" "}
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.monetizationEnabled && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" /> Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {active ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge>{data.billing?.planName ?? "Active"}</Badge>
                  <span className="text-sm capitalize text-muted-foreground">
                    {data.billing?.status}
                  </span>
                </div>
                {data.billing?.currentPeriodEnd && (
                  <p className="text-sm text-muted-foreground">
                    Renews{" "}
                    {new Date(
                      data.billing.currentPeriodEnd * 1000,
                    ).toLocaleDateString()}
                  </p>
                )}
                <Button
                  variant="outline"
                  disabled={!!billingBusy}
                  onClick={() => billingAction("portal")}
                >
                  {billingBusy === "portal" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Manage billing
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have an active subscription.
                </p>
                {data.hasPlans ? (
                  <Button
                    variant="gradient"
                    disabled={!!billingBusy}
                    onClick={() =>
                      billingAction("checkout", { mode: "subscription" })
                    }
                  >
                    {billingBusy === "checkout" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    Subscribe
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No plans are available yet.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {data.purchases.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Purchases</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {data.purchases.map((p) => (
              <Link
                key={p.videoId}
                href={`/v/${p.slug}`}
                className="flex items-center justify-between py-2.5 text-sm hover:text-primary"
              >
                <span>{p.title}</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  ${(p.amount / 100).toFixed(2)}{" "}
                  <ExternalLink className="size-3.5" />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
