import { categoryRepo, videoRepo } from "@btc/db";
import { notFound } from "next/navigation";
import { VideoEditor } from "@/components/admin/video-editor";
import { monetizationEnabled } from "@/lib/entitlements";
import { requireAdmin } from "@/lib/session";

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [video, categories] = await Promise.all([
    videoRepo.getVideo(id),
    categoryRepo.listCategories(),
  ]);
  if (!video) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="line-clamp-1 text-2xl font-bold tracking-tight">
          {video.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Edit details, thumbnail, and publishing.
        </p>
      </div>
      <VideoEditor
        video={video}
        categories={categories}
        monetizationEnabled={monetizationEnabled}
      />
    </div>
  );
}
