/**
 * Seed script for BehindTheCode.
 *
 *   bun run seed              # admin user + categories + demo videos + settings
 *   bun run seed --admin-only # only ensure the admin account exists
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from the env (falls back to
 * sensible defaults). Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *
 * The first profile created becomes an admin automatically (handle_new_user
 * trigger), but we also force the role here so re-runs stay consistent.
 */
import { categoryRepo, getDb, settingsRepo, videoRepo } from "@btc/db";

const adminOnly = process.argv.includes("--admin-only");

/**
 * Public Mux sample asset ("Big Buck Bunny"). Seeded videos point at this so the
 * player actually plays without needing a real Mux account in local/dev.
 */
const MUX_DEMO_PLAYBACK_ID = "DS00Spx1CV902MCtPj5WknGlR102V5HFkDe";

/**
 * Curated abstract nature imagery from Unsplash (rendered grayscale by the UI).
 * Moody, textural landscapes — fog, forests, ridgelines, water — that read well
 * in monochrome. Deliberately avoids people / man-made structures. One unique
 * poster per seeded video.
 */
const UNSPLASH_IDS = [
  "photo-1470071459604-3b5ec3a7fe05", // misty mountain ridge
  "photo-1418065460487-3e41a6c84dc5", // aerial misty pine forest
  "photo-1509316975850-ff9c5deb0cd9", // fog through pines
  "photo-1505765050516-f72dcac9c60e", // snowy range in cloud
  "photo-1508739773434-c26b3d09e071", // minimal mountain ridge
  "photo-1513836279014-a89f7a76ae86", // looking up at tall trees
  "photo-1441974231531-c6227db76b6e", // forest of tall trunks
  "photo-1497436072909-60f360e1d4b1", // forest meeting water
  "photo-1426604966848-d7adac402bff", // granite cliffs in mist
  "photo-1500534623283-312aade485b7", // layered ridgelines
  "photo-1454496522488-7a8e488e8606", // snow-capped peaks
  "photo-1485470733090-0aae1788d5af", // dark peak over still water
  "photo-1419242902214-272b3f66ee7a", // starry night sky
  "photo-1500049242364-5f500807cdd7", // deep canyon valley
  "photo-1472214103451-9374bd1c798e", // rolling hills
  "photo-1518495973542-4542c06a5843", // light through branches
  "photo-1502082553048-f009c37129b9", // lone oak, bare branches
  "photo-1455218873509-8097305ee378", // waterfall in forest
  "photo-1465146344425-f00d5f5c8f07", // wild meadow
  "photo-1490750967868-88aa4486c946", // soft blossoms
];

function poster(i: number): string {
  const id = UNSPLASH_IDS[i % UNSPLASH_IDS.length];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&h=640&q=70`;
}

const VIDEO_BODY = `In this video, we'll walk through how we approached the problem, the trade-offs we considered, and how the final implementation came together.

## Introduction

We start by setting up the project and wiring the core pieces together. The goal is to keep the surface area small while leaving room to grow. Along the way we'll touch on data fetching, caching, and how to keep the UI responsive.

Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aliquam sapien dolor, scelerisque sit amet faucibus sed, congue eu odio. Morbi eleifend leo eros, nec sollicitudin arcu hendrerit at.

## Wrapping up

With the foundations in place, the rest is iteration — ship something small, measure, and refine.`;

type SeedVideo = {
  title: string;
  minutes: number;
  access: "free" | "subscribers" | "purchase";
};

/** Demo videos keyed by category name (matches the seeded categories). */
const VIDEOS_BY_CATEGORY: Record<string, SeedVideo[]> = {
  Product: [
    { title: "Launching our new dashboard", minutes: 16, access: "free" },
    { title: "Designing the pricing page", minutes: 12, access: "free" },
    {
      title: "A walkthrough of the admin panel",
      minutes: 22,
      access: "subscribers",
    },
    { title: "Shipping dark mode", minutes: 14, access: "free" },
    { title: "Building the onboarding flow", minutes: 19, access: "purchase" },
  ],
  Engineering: [
    { title: "Edge-rendered dashboards", minutes: 16, access: "free" },
    { title: "Webhooks that never drop", minutes: 24, access: "subscribers" },
    { title: "Streaming server components", minutes: 15, access: "free" },
    {
      title: "Scaling Postgres to a million rows",
      minutes: 28,
      access: "purchase",
    },
    { title: "Type-safe APIs end to end", minutes: 21, access: "free" },
  ],
  Culture: [
    { title: "Behind the scenes with the team", minutes: 18, access: "free" },
    { title: "How we run remote standups", minutes: 11, access: "free" },
    { title: "Our design review process", minutes: 17, access: "subscribers" },
    { title: "A day in the life of an engineer", minutes: 13, access: "free" },
    { title: "How we hire", minutes: 20, access: "purchase" },
  ],
  Tutorials: [
    {
      title: "CSV import using the Vercel AI SDK",
      minutes: 15,
      access: "free",
    },
    { title: "Native navigation in React", minutes: 16, access: "free" },
    { title: "Building a command menu", minutes: 22, access: "subscribers" },
    { title: "Auth without the headaches", minutes: 24, access: "free" },
    {
      title: "Background jobs with Trigger.dev",
      minutes: 33,
      access: "purchase",
    },
  ],
};

const GENERIC_VIDEOS: SeedVideo[] = [
  { title: "Getting started", minutes: 12, access: "free" },
  { title: "Going deeper", minutes: 18, access: "free" },
  { title: "Advanced techniques", minutes: 24, access: "subscribers" },
  { title: "Putting it together", minutes: 16, access: "free" },
  { title: "Production checklist", minutes: 21, access: "purchase" },
];

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
  if (!settings.siteName || settings.siteName === "Behind The Code") {
    await settingsRepo.updateSettings({
      siteName: process.env.SITE_NAME ?? "Behind The Code",
    });
  }
  console.log("✓ Settings ensured");
}

async function seedVideos() {
  const db = getDb();
  const categories = await categoryRepo.listCategories();
  if (categories.length === 0) {
    console.log("! No categories to attach videos to, skipping videos");
    return;
  }

  const existing = await videoRepo.listPublished({ limit: 1 });
  if (existing.total > 0) {
    console.log(
      `✓ Videos already present (${existing.total} published), skipping`,
    );
    return;
  }

  let i = 0;
  let created = 0;
  for (const category of categories) {
    const defs = VIDEOS_BY_CATEGORY[category.name] ?? GENERIC_VIDEOS;
    for (const def of defs) {
      const video = await videoRepo.createVideo({
        title: def.title,
        description: VIDEO_BODY,
        categoryId: category.id,
        access: def.access,
      });
      await videoRepo.markVideoReady(video.id, {
        muxAssetId: `seed-${video.id}`,
        playbackId: MUX_DEMO_PLAYBACK_ID,
        playbackPolicy: "public",
        duration: def.minutes * 60,
        aspectRatio: "16/9",
      });
      await videoRepo.updateVideo(video.id, { customPosterUrl: poster(i) });
      // Synthetic engagement so the feed sort + stats look realistic.
      await db
        .from("videos")
        .update({ view_count: 800 + i * 430, like_count: 30 + i * 11 })
        .eq("id", video.id);
      await videoRepo.publishVideo(video.id);
      i += 1;
      created += 1;
    }
    console.log(`  + ${defs.length} videos for ${category.name}`);
  }
  console.log(`✓ Seeded ${created} videos`);
}

/** Synthetic daily view counts for the admin chart (last 30 days). */
async function seedDailyViews() {
  const db = getDb();
  const { count } = await db
    .from("daily_views")
    .select("day", { count: "exact", head: true });
  if ((count ?? 0) >= 30) {
    console.log(`✓ Daily views already present (${count}), skipping`);
    return;
  }

  const days = 30;
  const rows: { day: string; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const dayStr = day.toISOString().slice(0, 10);
    const weekday = day.getDay();
    const weekend = weekday === 0 || weekday === 6 ? 90 : 0;
    const trend = (days - 1 - i) * 14;
    const wave = Math.sin(i / 3.5) * 55;
    const spike = i === 8 || i === 19 ? 180 : 0;
    const noise = ((i * 17 + 11) % 97) + 40;
    const views = Math.round(160 + wave + weekend + trend + spike + noise);
    rows.push({ day: dayStr, count: views });
  }

  const { error } = await db.from("daily_views").upsert(rows);
  if (error) throw new Error(error.message);
  console.log(`✓ Seeded ${rows.length} days of view analytics`);
}

async function main() {
  console.log("Seeding BehindTheCode…\n");
  await seedAdmin();
  if (!adminOnly) {
    await seedContent();
    await seedVideos();
    await seedDailyViews();
  }
  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
