"use client";

import type { Settings } from "@btc/db";
import { Button } from "@btc/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@btc/ui/components/card";
import { Input } from "@btc/ui/components/input";
import { Label } from "@btc/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@btc/ui/components/select";
import { Switch } from "@btc/ui/components/switch";
import { toast } from "@btc/ui/components/toaster";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { updateSettingsAction } from "@/app/admin/actions";

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [s, setS] = React.useState(settings);
  const [saving, setSaving] = React.useState(false);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const { updatedAt: _omit, ...patch } = s;
      void _omit;
      await updateSettingsAction(patch);
      toast.success("Settings saved");
      router.refresh();
    } catch {
      toast.error("Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="siteName">Site name</Label>
            <Input
              id="siteName"
              value={s.siteName}
              onChange={(e) => set("siteName", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={s.tagline}
              onChange={(e) => set("tagline", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="accent">Accent color</Label>
              <div className="flex items-center gap-2">
                <input
                  id="accent"
                  type="color"
                  value={s.accentColor}
                  onChange={(e) => set("accentColor", e.target.value)}
                  className="h-9 w-12 rounded-md border border-input bg-transparent"
                />
                <Input
                  value={s.accentColor}
                  onChange={(e) => set("accentColor", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Default theme</Label>
              <Select
                value={s.defaultTheme}
                onValueChange={(v) =>
                  set("defaultTheme", v as Settings["defaultTheme"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Homepage & community</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Carousel source</Label>
              <Select
                value={s.carouselSource}
                onValueChange={(v) =>
                  set("carouselSource", v as Settings["carouselSource"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="latest">Latest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Registration</Label>
              <Select
                value={s.registrationMode}
                onValueChange={(v) =>
                  set("registrationMode", v as Settings["registrationMode"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="invite">Invite only</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Comments</p>
              <p className="text-xs text-muted-foreground">
                Allow signed-in viewers to comment.
              </p>
            </div>
            <Switch
              checked={s.commentsEnabled}
              onCheckedChange={(v) => set("commentsEnabled", v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">AI moderation</p>
              <p className="text-xs text-muted-foreground">
                Auto-flag spam &amp; abuse (requires OpenAI key).
              </p>
            </div>
            <Switch
              checked={s.aiModeration}
              onCheckedChange={(v) => set("aiModeration", v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="analytics">Analytics ID</Label>
            <Input
              id="analytics"
              value={s.analyticsId}
              onChange={(e) => set("analyticsId", e.target.value)}
              placeholder="Optional"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="gradient" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          Save settings
        </Button>
      </div>
    </div>
  );
}
