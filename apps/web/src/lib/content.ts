import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "src", "content");

export async function loadDoc(slug: string): Promise<string | null> {
  try {
    return await fs.readFile(path.join(CONTENT_DIR, `${slug}.md`), "utf8");
  } catch {
    return null;
  }
}
