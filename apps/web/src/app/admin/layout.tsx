import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@btc/ui/components/sidebar";
import { Suspense } from "react";
import { AccountMenu } from "@/components/account-menu";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { monetizationEnabled } from "@/lib/entitlements";
import { requireAdmin } from "@/lib/session";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLayoutFallback />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}

async function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <SidebarProvider defaultOpen={false}>
      <AdminSidebar monetizationEnabled={monetizationEnabled} />
      <SidebarInset className="[--card:oklch(0.985_0_0)] dark:[--card:oklch(0.16_0_0)]">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-glass-border bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="ml-auto flex items-center gap-2">
            <Suspense fallback={<AccountMenuFallback />}>
              <AccountMenu />
            </Suspense>
          </div>
        </header>
        <div className="p-4 sm:p-6">
          <Suspense fallback={<AdminPageFallback />}>{children}</Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AdminLayoutFallback() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-(--sidebar-width-icon) shrink-0 border-r border-border md:block" />
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 items-center border-b border-border px-4">
          <div className="size-7 animate-pulse rounded-md bg-muted" />
          <div className="ml-auto size-9 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="p-4 sm:p-6">
          <AdminPageFallback />
        </div>
      </div>
    </div>
  );
}

function AccountMenuFallback() {
  return <div className="size-9 animate-pulse rounded-full bg-muted" />;
}

function AdminPageFallback() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse bg-muted" />
        <div className="h-4 w-64 animate-pulse bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
            key={i}
            className="h-24 animate-pulse border border-border bg-muted/40"
          />
        ))}
      </div>
    </div>
  );
}
