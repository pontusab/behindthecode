import "server-only";
import { getDb } from "@btc/db";

export type Bucket = "thumbnails" | "branding";

/**
 * Upload a file to a public Supabase Storage bucket and return its public URL.
 */
export async function uploadPublicFile(
  bucket: Bucket,
  path: string,
  file: File | Blob,
  contentType: string,
): Promise<string> {
  const db = getDb();
  const { error } = await db.storage.from(bucket).upload(path, file, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(error.message);
  const { data } = db.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
