import crypto from "crypto";

export function generateFileHash(content: string): string {
  return crypto
    .createHash("sha256")
    .update(content)
    .digest("hex");
}