"use client";

import type { AccessLevel, Category, Video, Visibility } from "@btc/db";
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
import { RichEditor } from "@btc/ui/components/rich-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@btc/ui/components/select";
import { toast } from "@btc/ui/components/toaster";
import { ExternalLink, Loader2, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { deleteVideoAction, saveVideoAction } from "@/app/admin/actions";

export function VideoEditor({
  video,
  categories,
  monetizationEnabled,
}: {
  video: Video;
  categories: Category[];
  monetizationEnabled: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = React.useState(video.title);
  const [description, setDescription] = React.useState(video.description);
  const [categoryId, setCategoryId] = React.useState<string>(
    video.categoryId ?? "none",
  );
  const [tagsText, setTagsText] = React.useState(video.tags.join(", "));
  const [access, setAccess] = React.useState<AccessLevel>(video.access);
  const [visibility, setVisibility] = React.useState<Visibility>(
    video.visibility,
  );
  const [thumbnailTime, setThumbnailTime] = React.useState<string>(
    video.thumbnailTime != null ? String(video.thumbnailTime) : "",
  );
  const [scheduleAt, setScheduleAt] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const tags = tagsText
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  async function save(intent: "save" | "publish" | "unpublish" | "schedule") {
    setBusy(intent);
    try {
      const res = await saveVideoAction({
        id: video.id,
        title,
        description,
        categoryId: categoryId === "none" ? null : categoryId,
        tags,
        access,
        visibility,
        thumbnailTime: thumbnailTime === "" ? null : Number(thumbnailTime),
        intent,
        publishAt:
          intent === "schedule" && scheduleAt
            ? new Date(scheduleAt).getTime()
            : null,
      });
      if (!res.ok) throw new Error(res.error);
      toast.success(
        intent === "publish"
          ? "Published"
          : intent === "schedule"
            ? "Scheduled"
            : intent === "unpublish"
              ? "Unpublished"
              : "Saved",
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(null);
    }
  }

  async function uploadThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy("thumb");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("videoId", video.id);
      const res = await fetch("/api/admin/thumbnail", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Upload failed");
      }
      toast.success("Thumbnail updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remove() {
    if (!confirm("Delete this video permanently? This cannot be undone."))
      return;
    setBusy("delete");
    try {
      await deleteVideoAction(video.id);
      toast.success("Video deleted");
      router.push("/admin/videos");
    } catch {
      toast.error("Could not delete");
      setBusy(null);
    }
  }

  const posterPreview =
    video.customPosterUrl ??
    (video.playbackId && video.playbackPolicy === "public"
      ? `https://image.mux.com/${video.playbackId}/thumbnail.webp?width=640${
          thumbnailTime ? `&time=${thumbnailTime}` : ""
        }`
      : null);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <RichEditor value={description} onChange={setDescription} />
          <p className="text-xs text-muted-foreground">
            Tip: insert timestamps to let viewers jump to a moment in the video.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Uncategorized" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Uncategorized</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="comma, separated, tags"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {monetizationEnabled && (
            <div className="space-y-1.5">
              <Label>Access</Label>
              <Select
                value={access}
                onValueChange={(v) => setAccess(v as AccessLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="subscribers">Subscribers only</SelectItem>
                  <SelectItem value="purchase">One-time purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(v) => setVisibility(v as Visibility)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              Status
              <Badge
                variant={
                  video.publishStatus === "published" ? "default" : "outline"
                }
                className="capitalize"
              >
                {video.publishStatus}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={!!busy}
                onClick={() => save("save")}
              >
                {busy === "save" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}{" "}
                Save
              </Button>
              {video.publishStatus !== "published" ? (
                <Button
                  size="sm"
                  variant="gradient"
                  disabled={!!busy || video.processingStatus !== "ready"}
                  onClick={() => save("publish")}
                >
                  {busy === "publish" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}{" "}
                  Publish
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!!busy}
                  onClick={() => save("unpublish")}
                >
                  Unpublish
                </Button>
              )}
            </div>

            {video.processingStatus !== "ready" && (
              <p className="text-xs text-muted-foreground">
                Video is {video.processingStatus}. Publishing is available once
                it&apos;s ready.
              </p>
            )}

            <div className="space-y-1.5 border-t border-border pt-3">
              <Label htmlFor="schedule" className="text-xs">
                Schedule publish
              </Label>
              <div className="flex gap-2">
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={(e) => setScheduleAt(e.target.value)}
                  className="text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    !!busy || !scheduleAt || video.processingStatus !== "ready"
                  }
                  onClick={() => save("schedule")}
                >
                  Set
                </Button>
              </div>
            </div>

            {video.publishStatus === "published" && (
              <Link
                href={`/v/${video.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View live <ExternalLink className="size-3.5" />
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base">Thumbnail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="aspect-video overflow-hidden rounded-lg bg-muted">
              {posterPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={posterPreview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-xs text-muted-foreground">
                  No preview
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="thumbTime" className="text-xs">
                Thumbnail time (seconds)
              </Label>
              <Input
                id="thumbTime"
                type="number"
                min={0}
                value={thumbnailTime}
                onChange={(e) => setThumbnailTime(e.target.value)}
                placeholder="e.g. 12"
              />
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={uploadThumbnail}
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              disabled={!!busy}
              onClick={() => fileRef.current?.click()}
            >
              {busy === "thumb" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Upload custom
            </Button>
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          className="w-full text-destructive"
          disabled={!!busy}
          onClick={remove}
        >
          {busy === "delete" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Delete video
        </Button>
      </aside>
    </div>
  );
}
