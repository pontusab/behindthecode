/**
 * Seed script for BehindTheCode.
 *
 *   bun run seed              # admin user + demo categories + default settings
 *   bun run seed --admin-only # only ensure the admin account exists
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from the env (falls back to
 * sensible defaults). Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *
 * The first profile created becomes an admin automatically (handle_new_user
 * trigger), but we also force the role here so re-runs stay consistent.
 */
import { categoryRepo, getDb, settingsRepo } from "@btc/db";

const adminOnly = process.argv.includes("--admin-only");

const email = (
  process.env.ADMIN_EMAIL ?? "admin@behindthecode.local"
).toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "changeme123!";
const name = process.env.ADMIN_NAME ?? "Admin";

const DEMO_CATEGORIES = [
  { name: "Product", description: "Launches, demos, and walkthroughs." },
  { name: "Engineering", description: "Deep dives and technical talks." },
  { name: "Culture", description: "Behind the scenes with the team." },
  { name: "Tutorials", description: "Step-by-step guides." },
];

async function seedAdmin() {
  const db = getDb();

  // Look for an existing auth user with this email.
  const { data: list } = await db.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const existing = list?.users.find((u) => u.email?.toLowerCase() === email);

  let userId: string;
  if (existing) {
    userId = existing.id;
    console.log(`✓ Admin already exists: ${email}`);
  } else {
    const { data, error } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
      app_metadata: { role: "admin" },
    });
    if (error || !data.user)
      throw new Error(error?.message ?? "Failed to create admin");
    userId = data.user.id;
    console.log(`✓ Created admin user: ${email}`);
    console.log(`  Password: ${password} (change it after first login)`);
  }

  // Ensure the profile row is admin (covers both new + pre-existing users).
  await db.from("profiles").update({ role: "admin", name }).eq("id", userId);
  await db.auth.admin.updateUserById(userId, {
    app_metadata: { role: "admin" },
  });
}

async function seedContent() {
  const existing = await categoryRepo.listCategories();
  if (existing.length > 0) {
    console.log(`✓ Categories already present (${existing.length}), skipping`);
  } else {
    for (const c of DEMO_CATEGORIES) {
      const created = await categoryRepo.createCategory(c);
      console.log(`  + category: ${created.name}`);
    }
  }

  const settings = await settingsRepo.getSettings();
  if (!settings.siteName || settings.siteName === "BehindTheCode") {
    await settingsRepo.updateSettings({
      siteName: process.env.SITE_NAME ?? "BehindTheCode",
    });
  }
  console.log("✓ Settings ensured");
}

async function main() {
  console.log("Seeding BehindTheCode…\n");
  await seedAdmin();
  if (!adminOnly) await seedContent();
  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
