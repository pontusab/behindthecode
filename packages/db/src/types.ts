import { z } from "zod";

/* ───────────────────────── Video ───────────────────────── */

export const processingStatuses = [
  "uploading",
  "processing",
  "ready",
  "errored",
] as const;
export const publishStatuses = ["draft", "scheduled", "published"] as const;
export const accessLevels = ["free", "subscribers", "purchase"] as const;
export const visibilities = ["public", "unlisted"] as const;
export const playbackPolicies = ["public", "signed"] as const;

export type ProcessingStatus = (typeof processingStatuses)[number];
export type PublishStatus = (typeof publishStatuses)[number];
export type AccessLevel = (typeof accessLevels)[number];
export type Visibility = (typeof visibilities)[number];
export type PlaybackPolicy = (typeof playbackPolicies)[number];

export const videoSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().default(""),
  processingStatus: z.enum(processingStatuses).default("uploading"),
  publishStatus: z.enum(publishStatuses).default("draft"),
  muxUploadId: z.string().nullable().default(null),
  muxAssetId: z.string().nullable().default(null),
  playbackId: z.string().nullable().default(null),
  playbackPolicy: z.enum(playbackPolicies).default("public"),
  duration: z.number().nullable().default(null),
  aspectRatio: z.string().nullable().default(null),
  thumbnailTime: z.number().nullable().default(null),
  customPosterUrl: z.string().nullable().default(null),
  categoryId: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
  access: z.enum(accessLevels).default("free"),
  requiredPlanIds: z.array(z.string()).default([]),
  polarProductId: z.string().nullable().default(null),
  priceAmount: z.number().nullable().default(null),
  visibility: z.enum(visibilities).default("public"),
  createdAt: z.number(),
  updatedAt: z.number(),
  publishAt: z.number().nullable().default(null),
  publishedAt: z.number().nullable().default(null),
});

export type Video = z.infer<typeof videoSchema>;

/** A video joined with its live engagement counts, used by the UI. */
export type VideoWithStats = Video & { views: number; likes: number };

/* ───────────────────────── Category ───────────────────────── */

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().default(""),
  createdAt: z.number(),
});
export type Category = z.infer<typeof categorySchema>;

/* ───────────────────────── Tag ───────────────────────── */

export const tagSchema = z.object({
  slug: z.string(),
  name: z.string(),
  createdAt: z.number(),
});
export type Tag = z.infer<typeof tagSchema>;

/* ───────────────────────── Playlist ───────────────────────── */

export const playlistSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().default(""),
  createdAt: z.number(),
});
export type Playlist = z.infer<typeof playlistSchema>;

/* ───────────────────────── Comment ───────────────────────── */

export const commentStatuses = ["published", "flagged", "removed"] as const;
export type CommentStatus = (typeof commentStatuses)[number];

export const commentSchema = z.object({
  id: z.string(),
  videoId: z.string(),
  userId: z.string(),
  authorName: z.string(),
  authorImage: z.string().nullable().default(null),
  body: z.string(),
  createdAt: z.number(),
  status: z.enum(commentStatuses).default("published"),
  aiReason: z.string().nullable().default(null),
});
export type Comment = z.infer<typeof commentSchema>;

/* ───────────────────────── Plan / Purchase (monetization) ───────────────────────── */

export const planIntervals = ["month", "year"] as const;
export type PlanInterval = (typeof planIntervals)[number];

export const planSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().default(""),
  polarProductId: z.string(),
  interval: z.enum(planIntervals).default("month"),
  amount: z.number().default(0),
  currency: z.string().default("usd"),
  createdAt: z.number(),
});
export type Plan = z.infer<typeof planSchema>;

export const purchaseSchema = z.object({
  userId: z.string(),
  videoId: z.string(),
  polarOrderId: z.string().nullable().default(null),
  amount: z.number().default(0),
  currency: z.string().default("usd"),
  createdAt: z.number(),
});
export type Purchase = z.infer<typeof purchaseSchema>;

/* ───────────────────────── Settings ───────────────────────── */

export const registrationModes = ["open", "invite", "closed"] as const;
export type RegistrationMode = (typeof registrationModes)[number];

export const settingsSchema = z.object({
  siteName: z.string().default("Behind The Code"),
  tagline: z.string().default("An open-source video platform."),
  logoUrl: z.string().nullable().default(null),
  faviconUrl: z.string().nullable().default(null),
  accentColor: z.string().default("#8b5cf6"),
  defaultTheme: z.enum(["light", "dark", "system"]).default("dark"),
  socialLinks: z
    .object({
      x: z.string().default(""),
      youtube: z.string().default(""),
      instagram: z.string().default(""),
      github: z.string().default(""),
      website: z.string().default(""),
    })
    .default({ x: "", youtube: "", instagram: "", github: "", website: "" }),
  featuredVideoIds: z.array(z.string()).default([]),
  carouselSource: z.enum(["popular", "latest"]).default("popular"),
  registrationMode: z.enum(registrationModes).default("open"),
  commentsEnabled: z.boolean().default(true),
  aiModeration: z.boolean().default(false),
  defaultDescription: z
    .string()
    .default("A beautiful, single-publisher video platform."),
  defaultOgImage: z.string().nullable().default(null),
  defaultAccess: z.enum(accessLevels).default("free"),
  currency: z.string().default("usd"),
  analyticsId: z.string().default(""),
  livePlaybackId: z.string().default(""),
  liveTitle: z.string().default(""),
  updatedAt: z.number().default(() => Date.now()),
});
export type Settings = z.infer<typeof settingsSchema>;

export const defaultSettings: Settings = settingsSchema.parse({});

/* ───────────────────────── Pagination ───────────────────────── */

export type Page<T> = {
  items: T[];
  total: number;
  hasMore: boolean;
  nextOffset: number;
};

export type VideoSort = "popular" | "recent" | "liked";
