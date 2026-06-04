import type { Database } from "./database.types";
import type {
  Category,
  Comment,
  Plan,
  Purchase,
  Tag,
  Video,
  VideoWithStats,
} from "./types";

type Tables = Database["public"]["Tables"];
export type VideoRow = Tables["videos"]["Row"];
export type CategoryRow = Tables["categories"]["Row"];
export type TagRow = Tables["tags"]["Row"];
export type CommentRow = Tables["comments"]["Row"];
export type PlanRow = Tables["plans"]["Row"];
export type PurchaseRow = Tables["purchases"]["Row"];

export function toMs(ts: string | null): number | null {
  return ts ? new Date(ts).getTime() : null;
}

export function rowToVideo(r: VideoRow): VideoWithStats {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    description: r.description ?? "",
    processingStatus: r.processing_status as Video["processingStatus"],
    publishStatus: r.publish_status as Video["publishStatus"],
    muxUploadId: r.mux_upload_id,
    muxAssetId: r.mux_asset_id,
    playbackId: r.playback_id,
    playbackPolicy: r.playback_policy as Video["playbackPolicy"],
    duration: r.duration,
    aspectRatio: r.aspect_ratio,
    thumbnailTime: r.thumbnail_time,
    customPosterUrl: r.custom_poster_url,
    categoryId: r.category_id,
    tags: r.tags ?? [],
    access: r.access as Video["access"],
    requiredPlanIds: r.required_plan_ids ?? [],
    polarProductId: r.polar_product_id,
    priceAmount: r.price_amount,
    visibility: r.visibility as Video["visibility"],
    createdAt: toMs(r.created_at)!,
    updatedAt: toMs(r.updated_at)!,
    publishAt: toMs(r.publish_at),
    publishedAt: toMs(r.published_at),
    views: Number(r.view_count ?? 0),
    likes: Number(r.like_count ?? 0),
  };
}

export function rowToCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description ?? "",
    createdAt: toMs(r.created_at)!,
  };
}

export function rowToTag(r: TagRow): Tag {
  return { slug: r.slug, name: r.name, createdAt: toMs(r.created_at)! };
}

export function rowToComment(r: CommentRow): Comment {
  return {
    id: r.id,
    videoId: r.video_id,
    userId: r.user_id,
    authorName: r.author_name ?? "",
    authorImage: r.author_image,
    body: r.body,
    createdAt: toMs(r.created_at)!,
    status: r.status as Comment["status"],
    aiReason: r.ai_reason,
  };
}

export function rowToPlan(r: PlanRow): Plan {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    polarProductId: r.polar_product_id,
    interval: r.interval as Plan["interval"],
    amount: r.amount,
    currency: r.currency,
    createdAt: toMs(r.created_at)!,
  };
}

export function rowToPurchase(r: PurchaseRow): Purchase {
  return {
    userId: r.user_id,
    videoId: r.video_id,
    polarOrderId: r.polar_order_id,
    amount: r.amount,
    currency: r.currency,
    createdAt: toMs(r.created_at)!,
  };
}
