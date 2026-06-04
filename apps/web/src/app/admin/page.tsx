import { statsRepo } from "@btc/db";
import { formatCompact } from "@btc/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@btc/ui/components/card";
import { StatCard } from "@btc/ui/components/stat-card";
import {
  Eye,
  Flag,
  Heart,
  MessageSquare,
  Video as VideoIcon,
} from "lucide-react";
import Link from "next/link";
import { ViewsChart } from "@/components/admin/views-chart";
import { requireAdmin } from "@/lib/session";

export default async function AdminDashboard() {
  await requireAdmin();
  const [stats, series, top] = await Promise.all([
    statsRepo.getDashboardStats(),
    statsRepo.getViewsTimeSeries(30),
    statsRepo.getTopVideos(5),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          An overview of your platform.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Videos"
          value={formatCompact(stats.totalVideos)}
          icon={VideoIcon}
        />
        <StatCard
          label="Total views"
          value={formatCompact(stats.totalViews)}
          icon={Eye}
        />
        <StatCard
          label="Total likes"
          value={formatCompact(stats.totalLikes)}
          icon={Heart}
        />
        <StatCard
          label="Comments"
          value={formatCompact(stats.totalComments)}
          hint={
            stats.flaggedComments > 0
              ? `${stats.flaggedComments} flagged`
              : undefined
          }
          icon={MessageSquare}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle>Views — last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <ViewsChart data={series} />
          </CardContent>
        </Card>

        <Card className="glass">
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
