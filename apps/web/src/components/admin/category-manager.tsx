"use client";

import { Button } from "@btc/ui/components/button";
import { Input } from "@btc/ui/components/input";
import { toast } from "@btc/ui/components/toaster";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/admin/actions";

export type CategoryRow = {
  id: string;
  name: string;
  description: string;
  count: number;
};

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy("create");
    try {
      await createCategoryAction({ name: name.trim() });
      setName("");
      toast.success("Category created");
      router.refresh();
    } catch {
      toast.error("Could not create category");
    } finally {
      setBusy(null);
    }
  }

  async function rename(id: string, current: string) {
    const next = window.prompt("Rename category", current);
    if (!next || next === current) return;
    setBusy(id);
    try {
      await updateCategoryAction(id, { name: next });
      toast.success("Renamed");
      router.refresh();
    } catch {
      toast.error("Could not rename");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this category? Videos will become uncategorized."))
      return;
    setBusy(id);
    try {
      await deleteCategoryAction(id);
      toast.success("Deleted");
      router.refresh();
    } catch {
      toast.error("Could not delete");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="max-w-xs"
        />
        <Button type="submit" variant="gradient" disabled={busy === "create"}>
          {busy === "create" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Add
        </Button>
      </form>

      <div className="glass divide-y divide-border rounded-xl">
        {categories.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No categories yet.
          </p>
        )}
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <button
                onClick={() => rename(c.id, c.name)}
                className="text-left font-medium hover:text-primary"
              >
                {c.name}
              </button>
              <p className="text-xs text-muted-foreground">{c.count} videos</p>
            </div>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-destructive"
              disabled={busy === c.id}
              onClick={() => remove(c.id)}
            >
              {busy === c.id ? (
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
