import { settingsRepo } from "@btc/db";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/session";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await settingsRepo.getSettings();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your platform.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
