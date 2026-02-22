import path from "path";
import OpenAI from "openai";
import { readFileSafe } from "../fileReader";
import { buildSummaryPrompt } from "../codeSummarizer";
import { createEmbedding } from "../embeddingService";
import { pool } from "../db/db";
import { toPgVector } from "../utils/formatVector";
import { generateFileHash } from "../utils/hash";
import { reviewCodeChange } from "./reviewAgent";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function ingestSingleFile(
  projectId: string,
  repoPath: string,
  absolutePath: string
) {

  const relativePath = path.relative(repoPath, absolutePath);
  const code = await readFileSafe(absolutePath);

  if (!code || code.length < 30) return;

  const fileHash = generateFileHash(code);

  const existing = await pool.query(
    `SELECT id, file_hash FROM code_files
     WHERE project_id=$1 AND file_path=$2`,
    [projectId, relativePath]
  );

  if (existing.rows.length && existing.rows[0].file_hash === fileHash) {
    return;
  }

  const prompt = buildSummaryPrompt(code, relativePath);

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0
  });

  const summary = response.choices[0].message.content || "";

  const result = await pool.query(
    `INSERT INTO code_files(project_id, file_path, file_hash, summary)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (project_id, file_path)
     DO UPDATE SET
       file_hash = EXCLUDED.file_hash,
       summary = EXCLUDED.summary,
       last_scanned = now()
     RETURNING id`,
    [projectId, relativePath, fileHash, summary]
  );

  const codeFileId = result.rows[0].id;

  const embeddingArray = await createEmbedding(summary);
  const embedding = toPgVector(embeddingArray);

  await pool.query(
    `INSERT INTO embeddings(project_id, source_type, source_id, content, embedding)
     VALUES ($1,$2,$3,$4,$5)`,
    [projectId, "code_file", codeFileId, summary, embedding]
  );

  await reviewCodeChange(projectId, relativePath, summary, absolutePath);}