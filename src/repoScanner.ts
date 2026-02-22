import fs from "fs/promises";
import path from "path";
import { shouldProcessFile } from "./fileFilter";

export async function scanRepository(root: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        if (shouldProcessFile(fullPath)) {
          results.push(fullPath);
        }
      }
    }
  }

  await walk(root);
  return results;
}