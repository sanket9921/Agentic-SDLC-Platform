import fs from "fs/promises";

const MAX_CHARS = 12000;

export async function readFileSafe(path: string): Promise<string> {
  const content = await fs.readFile(path, "utf-8");

  if (content.length <= MAX_CHARS) return content;

  // truncate large files
  return content.slice(0, MAX_CHARS);
}