import { Button } from "@btc/ui/components/button";
import Link from "next/link";
import { AccountMenuClient } from "@/components/account-menu-client";
import { getCurrentUser } from "@/lib/session";

export async function AccountMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Button asChild variant="gradient" size="sm" className="rounded-full">
        <Link href="/login">Sign in</Link>
      </Button>
    );
  }

  return (
    <AccountMenuClient
      name={user.name}
      email={user.email}
      image={user.image ?? null}
      role={user.role ?? "user"}
    />
  );
}
