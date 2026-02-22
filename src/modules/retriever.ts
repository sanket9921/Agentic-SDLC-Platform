import { pool } from "../db/db";
import { createEmbedding } from "../embeddingService";
import { toPgVector } from "../utils/formatVector";

export async function retrieveRelevantContext(
  projectId: string,
  query: string
) {
  // 1) embed user question
  const embeddingArray = await createEmbedding(query);
  const embedding = toPgVector(embeddingArray);

  // 2) search memory
  const result = await pool.query(
    `
    SELECT content
    FROM embeddings
    WHERE project_id = $1
    ORDER BY embedding <-> $2
    LIMIT 8
    `,
    [projectId, embedding]
  );

  return result.rows.map(r => r.content).join("\n\n");
}