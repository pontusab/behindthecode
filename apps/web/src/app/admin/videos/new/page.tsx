import { UploadVideo } from "@/components/admin/upload-video";
import { monetizationEnabled } from "@/lib/entitlements";
import { ensureDynamicRoute } from "@/lib/dynamic-route";

export default async function NewVideoPage() {
  await ensureDynamicRoute();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-tight">Upload video</h1>
        <p className="text-sm text-muted-foreground">
          Give it a title, then upload. We&apos;ll generate captions
          automatically.
        </p>
      </div>
      <UploadVideo monetizationEnabled={monetizationEnabled} />
    </div>
  );
}
