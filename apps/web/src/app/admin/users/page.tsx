import {
  UserManagement,
  type UserRow,
} from "@/components/admin/user-management";
import { getCurrentUser } from "@/lib/session";
import { listUsers } from "@/lib/users";

export default async function AdminUsersPage() {
  const me = await getCurrentUser();

  let users: UserRow[] = [];
  try {
    users = await listUsers(200);
  } catch {
    users = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-medium tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage roles and access. The first user to sign up is an admin.
        </p>
      </div>
      <UserManagement users={users} currentUserId={me?.id ?? ""} />
    </div>
  );
}
