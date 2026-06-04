"use client";

import type { Plan, PlanInterval } from "@btc/db";
import { Button } from "@btc/ui/components/button";
import { Card, CardContent } from "@btc/ui/components/card";
import { Input } from "@btc/ui/components/input";
import { Label } from "@btc/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@btc/ui/components/select";
import { toast } from "@btc/ui/components/toaster";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { createPlanAction, deletePlanAction } from "@/app/admin/actions";

export function PlanManager({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [productId, setProductId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [interval, setInterval] = React.useState<PlanInterval>("month");
  const [busy, setBusy] = React.useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !productId.trim()) {
      toast.error("Name and Polar product ID are required");
      return;
    }
    setBusy("create");
    try {
      await createPlanAction({
        name: name.trim(),
        polarProductId: productId.trim(),
        interval,
        amount: Math.round(Number(amount) * 100) || 0,
        currency: "usd",
      });
      setName("");
      setProductId("");
      setAmount("");
      toast.success("Plan created");
      router.refresh();
    } catch {
      toast.error("Could not create plan");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this plan?")) return;
    setBusy(id);
    try {
      await deletePlanAction(id);
      router.refresh();
    } catch {
      toast.error("Could not delete");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="glass">
        <CardContent className="p-5">
          <form onSubmit={create} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pname">Plan name</Label>
              <Input
                id="pname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pro"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product">Polar product ID</Label>
              <Input
                id="product"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="prod_..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (display)</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="9.99"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Interval</Label>
              <Select
                value={interval}
                onValueChange={(v) => setInterval(v as PlanInterval)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                variant="gradient"
                disabled={busy === "create"}
              >
                {busy === "create" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Add plan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="glass divide-y divide-border rounded-xl">
        {plans.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No plans yet. Create one to enable subscriptions.
          </p>
        )}
        {plans.map((p) => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                ${(p.amount / 100).toFixed(2)}/{p.interval} · {p.polarProductId}
              </p>
            </div>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-destructive"
              disabled={busy === p.id}
              onClick={() => remove(p.id)}
            >
              {busy === p.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
