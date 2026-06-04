import { type PublishStatus, videoRepo } from "@btc/db";
import { formatCompact, formatDuration, formatRelativeTime } from "@btc/ui";
import { Badge } from "@btc/ui/components/badge";
import { Button } from "@btc/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@btc/ui/components/table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ensureDynamicRoute } from "@/lib/dynamic-route";

const STATUS_VARIANT: Record<
  PublishStatus,
  "default" | "secondary" | "outline"
> = {
  published: "default",
  scheduled: "secondary",
  draft: "outline",
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "scheduled", label: "Scheduled" },
] as const;

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await ensureDynamicRoute();
  const { status = "all", q } = await searchParams;
  const page = await videoRepo.listAdminVideos({
    status: status === "all" ? undefined : (status as PublishStatus),
    query: q,
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-medium tracking-tight">Videos</h1>
        <Button asChild variant="gradient">
          <Link href="/admin/videos/new">
            <Plus className="size-4" /> Upload
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-1 rounded-full border border-glass-border bg-secondary/40 p-1">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/videos?status=${f.key}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              status === f.key
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {page.items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No videos yet. Upload your first video.
                </TableCell>
              </TableRow>
            )}
            {page.items.map((v) => (
              <TableRow key={v.id} className="cursor-pointer">
                <TableCell>
                  <Link
                    href={`/admin/videos/${v.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {v.title}
                  </Link>
                  {v.processingStatus !== "ready" && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {v.processingStatus}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={STATUS_VARIANT[v.publishStatus]}
                    className="capitalize"
                  >
                    {v.publishStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCompact(v.views)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {v.duration ? formatDuration(v.duration) : "—"}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatRelativeTime(v.updatedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
