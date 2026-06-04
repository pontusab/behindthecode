import { Separator } from "@btc/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@btc/ui/components/sidebar";
import { ThemeToggle } from "@btc/ui/components/theme-toggle";
import { AccountMenu } from "@/components/account-menu";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { monetizationEnabled } from "@/lib/entitlements";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <SidebarProvider>
      <AdminSidebar monetizationEnabled={monetizationEnabled} />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-glass-border bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-5" />
          <span className="text-sm font-medium text-muted-foreground">
            Admin
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <AccountMenu />
          </div>
        </header>
        <div className="p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
