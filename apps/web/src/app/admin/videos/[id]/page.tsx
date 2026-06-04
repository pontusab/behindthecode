import { categoryRepo, videoRepo } from "@btc/db";
import { notFound } from "next/navigation";
import { VideoEditor } from "@/components/admin/video-editor";
import { monetizationEnabled } from "@/lib/entitlements";
import { ensureDynamicRoute } from "@/lib/dynamic-route";

export default async function EditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await ensureDynamicRoute();
  const { id } = await params;
  const [video, categories] = await Promise.all([
    videoRepo.getVideo(id),
    categoryRepo.listCategories(),
  ]);
  if (!video) notFound();

  return (
    <div className="space-y-6">
      <VideoEditor
        video={video}
        categories={categories}
        monetizationEnabled={monetizationEnabled}
      />
    </div>
  );
}
