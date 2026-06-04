import { UploadVideo } from "@/components/admin/upload-video";
import { monetizationEnabled } from "@/lib/entitlements";
import { requireAdmin } from "@/lib/session";

export default async function NewVideoPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload video</h1>
        <p className="text-sm text-muted-foreground">
          Give it a title, then upload. We&apos;ll generate captions
          automatically.
        </p>
      </div>
      <UploadVideo monetizationEnabled={monetizationEnabled} />
    </div>
  );
}
