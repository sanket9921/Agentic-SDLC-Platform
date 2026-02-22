import path from "path";
import OpenAI from "openai";
import { scanRepository } from "../repoScanner";
import { readFileSafe } from "../fileReader";
import { buildSummaryPrompt } from "../codeSummarizer";
import { createEmbedding } from "../embeddingService";
import { pool } from "../db/db";
import { prepareRepo } from "../utils/git";
import { toPgVector } from "../utils/formatVector";
import { generateFileHash } from "../utils/hash";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Safely parse JSON returned by LLM
 * Handles ```json fenced output
 */
function safeJsonParse(text: string): any | null {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export async function ingestRepository(projectId: string, repoUrl: string) {
  try {
    console.log("Starting ingestion for project:", projectId);

    // 1️⃣ Clone repository
    const repoPath = await prepareRepo(repoUrl, projectId);

    // 2️⃣ Scan candidate files
    const files = await scanRepository(repoPath);

    console.log(`Found ${files.length} candidate files`);

    for (const absolutePath of files) {
      try {
        // Always store RELATIVE path (critical for portability)
        const relativePath = path.relative(repoPath, absolutePath);

        // 3️⃣ Read code
        const code = await readFileSafe(absolutePath);

        // ignore tiny or empty files
        if (!code || code.length < 30) continue;

        // 4️⃣ Generate file fingerprint
        const fileHash = generateFileHash(code);

        // 5️⃣ Check if file already indexed
        const existing = await pool.query(
          `SELECT id, file_hash FROM code_files
           WHERE project_id=$1 AND file_path=$2`,
          [projectId, relativePath]
        );

        if (existing.rows.length > 0) {
          const row = existing.rows[0];

          // unchanged file → skip LLM (VERY IMPORTANT cost saver)
          if (row.file_hash === fileHash) {
            console.log("Skipping unchanged:", relativePath);
            continue;
          }

          // file changed → remove old memory
          await pool.query(
            `DELETE FROM embeddings WHERE source_id=$1 AND source_type='code_file'`,
            [row.id]
          );
        }

        // 6️⃣ Ask LLM to understand file
        const prompt = buildSummaryPrompt(code, relativePath);

        const response = await openai.chat.completions.create({
          model: "gpt-4.1-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0
        });

        const rawText = response.choices[0].message.content || "";
        const parsed = safeJsonParse(rawText);

        if (!parsed) {
          console.log("Skipped (invalid JSON):", relativePath);
          continue;
        }

        // 7️⃣ Save structured knowledge
        const result = await pool.query(
          `INSERT INTO code_files(project_id, file_path, file_hash, summary, responsibilities, dependencies)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (project_id, file_path)
           DO UPDATE SET
             file_hash = EXCLUDED.file_hash,
             summary = EXCLUDED.summary,
             responsibilities = EXCLUDED.responsibilities,
             dependencies = EXCLUDED.dependencies,
             last_scanned = now()
           RETURNING id`,
          [
            projectId,
            relativePath,
            fileHash,
            parsed.responsibility || "",
            parsed.responsibility || "",
            JSON.stringify(parsed.dependencies || [])
          ]
        );

        const codeFileId = result.rows[0].id;

        // 8️⃣ Build semantic memory text
        const embeddingSource = `
File: ${relativePath}
Responsibility: ${parsed.responsibility}
Dependencies: ${(parsed.dependencies || []).join(", ")}
Domain: ${parsed.domain || ""}
`;

        // 9️⃣ Create embedding
        const embeddingArray = await createEmbedding(embeddingSource);
        const embedding = toPgVector(embeddingArray);

        // 🔟 Store in vector memory
        await pool.query(
          `INSERT INTO embeddings(project_id, source_type, source_id, content, embedding)
           VALUES ($1,$2,$3,$4,$5)`,
          [projectId, "code_file", codeFileId, embeddingSource, embedding]
        );

        console.log("Indexed:", relativePath);

      } catch (fileErr) {
        console.error("Failed file:", absolutePath, fileErr);
      }
    }

    console.log("Repository ingestion completed successfully.");
  } catch (err) {
    console.error("Ingestion failed:", err);
  }
}