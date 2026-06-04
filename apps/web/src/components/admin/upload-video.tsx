"use client";

import type { AccessLevel } from "@btc/db";
import { Button } from "@btc/ui/components/button";
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
import MuxUploader from "@mux/mux-uploader-react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

export function UploadVideo({
  monetizationEnabled,
}: {
  monetizationEnabled: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [access, setAccess] = React.useState<AccessLevel>("free");
  const [endpoint, setEndpoint] = React.useState<string | null>(null);
  const [videoId, setVideoId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);

  async function startUpload() {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || "Untitled video", access }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { uploadUrl: string; videoId: string };
      setEndpoint(data.uploadUrl);
      setVideoId(data.videoId);
    } catch {
      toast.error("Could not start upload");
      setCreating(false);
    }
  }

  if (endpoint && videoId) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Uploading{" "}
          <span className="font-medium text-foreground">
            {title || "Untitled video"}
          </span>
          . You can edit details while it processes.
        </p>
        <MuxUploader
          endpoint={endpoint}
          onSuccess={() => {
            toast.success("Upload complete — processing on Mux.");
            router.push(`/admin/videos/${videoId}`);
          }}
          onError={() => toast.error("Upload failed")}
          style={{ ["--uploader-font-family" as string]: "inherit" }}
        />
        <Button
          variant="ghost"
          onClick={() => router.push(`/admin/videos/${videoId}`)}
        >
          Continue to editor
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My new video"
        />
      </div>

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
              <SelectItem value="free">Free — anyone can watch</SelectItem>
              <SelectItem value="subscribers">Subscribers only</SelectItem>
              <SelectItem value="purchase">One-time purchase</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Gated videos use signed playback. You can change this later.
          </p>
        </div>
      )}

      <Button variant="gradient" onClick={startUpload} disabled={creating}>
        {creating ? <Loader2 className="size-4 animate-spin" /> : null}
        Start upload
      </Button>
    </div>
  );
}
