import { getDb } from "../client";
import { rowToVideo } from "../mappers";
import type { VideoWithStats } from "../types";

export type DashboardStats = {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  flaggedComments: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await getDb().rpc("dashboard_stats").maybeSingle();
  return {
    totalVideos: Number(data?.total_videos ?? 0),
    totalViews: Number(data?.total_views ?? 0),
    totalLikes: Number(data?.total_likes ?? 0),
    totalComments: Number(data?.total_comments ?? 0),
    flaggedComments: Number(data?.flagged_comments ?? 0),
  };
}

export type ViewsPoint = { date: string; views: number };

/** Daily view counts for the last `days` days (oldest first). */
export async function getViewsTimeSeries(days = 30): Promise<ViewsPoint[]> {
  const { data } = await getDb().rpc("views_timeseries", { p_days: days });
  return (data ?? []).map((r) => ({
    date: r.day,
    views: Number(r.views ?? 0),
  }));
}

/** Top videos by view count. */
export async function getTopVideos(limit = 5): Promise<VideoWithStats[]> {
  const { data } = await getDb()
    .from("videos")
    .select("*")
    .eq("publish_status", "published")
    .order("view_count", { ascending: false })
    .limit(limit);
  return (data ?? []).map(rowToVideo);
}
