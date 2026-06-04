"use server";

import {
  type AccessLevel,
  type CommentStatus,
  cacheTags,
  categoryRepo,
  commentRepo,
  type PlanInterval,
  planRepo,
  type Settings,
  settingsRepo,
  tagRepo,
  type Visibility,
  videoRepo,
} from "@btc/db";
import { deleteAsset } from "@btc/mux";
import { revalidatePath } from "next/cache";
import { bust } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { countAdmins, setUserBanned, setUserRole } from "@/lib/users";

function bustCatalog() {
  bust(cacheTags.videos, cacheTags.categories, cacheTags.tags);
}

/* ───────────────────────── Videos ───────────────────────── */

export type SaveVideoInput = {
  id: string;
  title: string;
  description: string;
  categoryId: string | null;
  tags: string[];
  access: AccessLevel;
  visibility: Visibility;
  thumbnailTime: number | null;
  intent: "save" | "publish" | "unpublish" | "schedule";
  publishAt?: number | null;
};

export async function saveVideoAction(input: SaveVideoInput) {
  await requireAdmin();
  if (input.tags.length) await tagRepo.ensureTags(input.tags);

  const playbackPolicy = input.access === "free" ? "public" : "signed";

  await videoRepo.updateVideo(input.id, {
    title: input.title,
    description: input.description,
    categoryId: input.categoryId,
    tags: input.tags,
    access: input.access,
    visibility: input.visibility,
    thumbnailTime: input.thumbnailTime,
    playbackPolicy,
  });

  const video = await videoRepo.getVideo(input.id);
  if (!video) return { ok: false, error: "Video not found" };

  if (input.intent === "publish") await videoRepo.publishVideo(input.id);
  else if (input.intent === "unpublish")
    await videoRepo.unpublishVideo(input.id);
  else if (input.intent === "schedule" && input.publishAt) {
    await videoRepo.scheduleVideo(input.id, input.publishAt);
  }

  bustCatalog();
  bust(cacheTags.video(input.id), cacheTags.videoSlug(video.slug));
  revalidatePath("/admin/videos");
  revalidatePath(`/admin/videos/${input.id}`);
  return { ok: true };
}

export async function deleteVideoAction(id: string) {
  await requireAdmin();
  const video = await videoRepo.deleteVideo(id);
  if (video?.muxAssetId) await deleteAsset(video.muxAssetId);
  bustCatalog();
  if (video) bust(cacheTags.videoSlug(video.slug));
  revalidatePath("/admin/videos");
  return { ok: true };
}

/* ───────────────────────── Categories ───────────────────────── */

export async function createCategoryAction(input: {
  name: string;
  description?: string;
}) {
  await requireAdmin();
  await categoryRepo.createCategory({
    name: input.name,
    description: input.description,
  });
  bust(cacheTags.categories);
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function updateCategoryAction(
  id: string,
  input: { name?: string; description?: string },
) {
  await requireAdmin();
  await categoryRepo.updateCategory(id, input);
  bust(cacheTags.categories, cacheTags.category(id));
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  await categoryRepo.deleteCategory(id);
  bust(cacheTags.categories, cacheTags.videos);
  revalidatePath("/admin/categories");
  return { ok: true };
}

/* ───────────────────────── Comments ───────────────────────── */

export async function setCommentStatusAction(
  id: string,
  status: CommentStatus,
) {
  await requireAdmin();
  await commentRepo.setCommentStatus(id, status);
  revalidatePath("/admin/comments");
  return { ok: true };
}

export async function deleteCommentAction(id: string) {
  await requireAdmin();
  await commentRepo.deleteComment(id);
  revalidatePath("/admin/comments");
  return { ok: true };
}

/* ───────────────────────── Settings ───────────────────────── */

export async function updateSettingsAction(patch: Partial<Settings>) {
  await requireAdmin();
  await settingsRepo.updateSettings(patch);
  bust(cacheTags.settings);
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { ok: true };
}

/* ───────────────────────── Users ───────────────────────── */

export async function setUserRoleAction(
  userId: string,
  role: "admin" | "user",
) {
  const me = await requireAdmin();
  if (role === "user") {
    const admins = await countAdmins();
    if (admins <= 1)
      return { ok: false, error: "You can't remove the last admin." };
    if (userId === me.id)
      return {
        ok: false,
        error: "You can't demote yourself as the last admin.",
      };
  }
  try {
    await setUserRole(userId, role);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update role",
    };
  }
  revalidatePath("/admin/users");
  return { ok: true };
}

/* ───────────────────────── Plans ───────────────────────── */

export async function createPlanAction(input: {
  name: string;
  description?: string;
  stripePriceId: string;
  interval: PlanInterval;
  amount: number;
  currency: string;
}) {
  await requireAdmin();
  await planRepo.createPlan(input);
  bust(cacheTags.plans);
  revalidatePath("/admin/plans");
  return { ok: true };
}

export async function deletePlanAction(id: string) {
  await requireAdmin();
  await planRepo.deletePlan(id);
  bust(cacheTags.plans);
  revalidatePath("/admin/plans");
  return { ok: true };
}

export async function banUserAction(userId: string, ban: boolean) {
  const me = await requireAdmin();
  if (userId === me.id) return { ok: false, error: "You can't ban yourself." };
  try {
    await setUserBanned(userId, ban);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update user",
    };
  }
  revalidatePath("/admin/users");
  return { ok: true };
}
