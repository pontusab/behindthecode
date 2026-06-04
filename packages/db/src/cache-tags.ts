/** Cache tags used with Next.js `cacheTag` / `revalidateTag`. */
export const cacheTags = {
  videos: "videos",
  video: (id: string) => `video:${id}`,
  videoSlug: (slug: string) => `video-slug:${slug}`,
  categories: "categories",
  category: (id: string) => `category:${id}`,
  tags: "tags",
  tag: (slug: string) => `tag:${slug}`,
  playlists: "playlists",
  playlist: (id: string) => `playlist:${id}`,
  settings: "settings",
  plans: "plans",
} as const;
