import { commentRepo, statsRepo, videoRepo } from "@btc/db";
import { formatCompact, formatRelativeTime } from "@btc/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@btc/ui/components/card";
import { StatCard } from "@btc/ui/components/stat-card";
import { Flag } from "lucide-react";
import Link from "next/link";
import { ViewsChart } from "@/components/admin/views-chart";
import { listRecentMembers } from "@/lib/users";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
};

export default async function AdminDashboard() {
  const [stats, series, top, recentComments, recentVideos, recentMembers] =
    await Promise.all([
      statsRepo.getDashboardStats(),
      statsRepo.getViewsTimeSeries(30),
      statsRepo.getTopVideos(5),
      commentRepo.listRecentComments(5),
      videoRepo.listAdminVideos({ limit: 5 }),
      listRecentMembers(5),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          An overview of your platform.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Videos" value={formatCompact(stats.totalVideos)} />
        <StatCard
          label="Total views"
          value={formatCompact(stats.totalViews)}
        />
        <StatCard
          label="Total likes"
          value={formatCompact(stats.totalLikes)}
        />
        <StatCard
          label="Comments"
          value={formatCompact(stats.totalComments)}
          hint={
            stats.flaggedComments > 0
              ? `${stats.flaggedComments} flagged`
              : undefined
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle>Views — last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <ViewsChart data={series} />
          </CardContent>
        </Card>

        <Card className="glass shadow-none">
          <CardHeader>
            <CardTitle>Top videos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {top.length === 0 && (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
            {top.map((v, i) => (
              <Link
                key={v.id}
                href={`/admin/videos/${v.id}`}
                className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-secondary/50"
              >
                <span className="w-5 text-center text-sm font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="line-clamp-1 flex-1 text-sm font-medium">
                  {v.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatCompact(v.views)} views
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass shadow-none">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Latest comments</CardTitle>
            <Link
              href="/admin/comments"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentComments.length === 0 && (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
            {recentComments.map((c) => (
              <div key={c.id} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold uppercase text-muted-foreground">
                  {c.authorName.slice(0, 2) || "??"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {c.authorName || "Anonymous"}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {c.body}
                  </p>
                  {c.videoTitle && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground/70">
                      on {c.videoTitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass shadow-none">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recently added</CardTitle>
            <Link
              href="/admin/videos"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentVideos.items.length === 0 && (
              <p className="text-sm text-muted-foreground">No videos yet.</p>
            )}
            {recentVideos.items.map((v) => (
              <Link
                key={v.id}
                href={`/admin/videos/${v.id}`}
                className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-secondary/50"
              >
                <span className="line-clamp-1 flex-1 text-sm font-medium">
                  {v.title}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {STATUS_LABEL[v.publishStatus] ?? v.publishStatus}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground/70">
                  {formatRelativeTime(v.createdAt)}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="glass shadow-none">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>New members</CardTitle>
            <Link
              href="/admin/users"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMembers.length === 0 && (
              <p className="text-sm text-muted-foreground">No members yet.</p>
            )}
            {recentMembers.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold uppercase text-muted-foreground">
                  {(m.name || m.email || "?").slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {m.name || m.email || "Anonymous"}
                    </span>
                    {m.role === "admin" && (
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    Joined {formatRelativeTime(m.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {stats.flaggedComments > 0 && (
        <Link
          href="/admin/comments?filter=flagged"
          className="glass flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
        >
          <Flag className="size-4 text-warning" />
          <span>
            <span className="font-medium">{stats.flaggedComments}</span> comment
            {stats.flaggedComments === 1 ? "" : "s"} awaiting review.
          </span>
        </Link>
      )}
    </div>
  );
}
