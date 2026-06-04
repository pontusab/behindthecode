import { categoryRepo, videoRepo } from "@btc/db";
import type { MetadataRoute } from "next";

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const [{ items: videos }, categories] = await Promise.all([
      videoRepo.listPublished({ limit: 1000 }),
      categoryRepo.listCategories(),
    ]);

    const videoRoutes: MetadataRoute.Sitemap = videos.map((v) => ({
      url: `${base}/v/${v.slug}`,
      lastModified: new Date(v.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${base}/category/${c.slug}`,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

    return [...staticRoutes, ...videoRoutes, ...categoryRoutes];
  } catch {
    return staticRoutes;
  }
}
