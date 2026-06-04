import { settingsRepo } from "@btc/db";
import { SettingsForm } from "@/components/admin/settings-form";
import { ensureDynamicRoute } from "@/lib/dynamic-route";

export default async function AdminSettingsPage() {
  await ensureDynamicRoute();
  const settings = await settingsRepo.getSettings();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your platform.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
