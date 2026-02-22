import path from "path";

const IGNORED_DIRS = [
  "node_modules",
  "dist",
  "build",
  ".git",
  ".next",
  "coverage",
  "public/assets"
];

const ALLOWED_EXT = [".ts", ".js", ".tsx", ".jsx", ".py"];

export function shouldProcessFile(filePath: string): boolean {
  const ext = path.extname(filePath);

  if (!ALLOWED_EXT.includes(ext)) return false;

  return !IGNORED_DIRS.some(dir => filePath.includes(dir));
}