import OpenAI from "openai";
import { pool } from "../db/db";
import { retrieveRelevantContext } from "./retriever";
import { resolveDependencyImpact } from "./dependencyResolver";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Impact Analysis Agent
 * Performs multi-level architectural reasoning
 */
export async function analyzeImpact(projectId: string, feature: string) {

  // 1️⃣ Retrieve semantic knowledge from vector memory
  const context = await retrieveRelevantContext(projectId, feature);

  // 2️⃣ Identify initial related modules using keyword match
  const keyword = feature.split(" ")[0];

  const initialFilesResult = await pool.query(
    `
    SELECT file_path
    FROM code_files
    WHERE project_id=$1
    AND (
      responsibilities ILIKE $2
      OR summary ILIKE $2
    )
    `,
    [projectId, `%${keyword}%`]
  );

  const initialFiles = initialFilesResult.rows.map(r => r.file_path);

  // 3️⃣ Resolve deep dependency chain (THIS IS THE BIG UPGRADE)
  const impactedFiles = await resolveDependencyImpact(
    projectId,
    initialFiles,
    3 // dependency depth
  );

  // 4️⃣ Build stronger architect prompt
  const prompt = `
You are a senior backend software architect analyzing a change in an EXISTING production system.

You MUST reason about system behavior — not just which files change.

Feature Request:
${feature}

Project Knowledge:
${context}

Dependency Graph Impact:
${impactedFiles.join("\n")}

Perform a real engineering impact analysis.

Your answer must include:

1. Directly affected modules (files that must change)
2. Indirectly affected modules (files that may break)
3. Data flow consequences (what data paths are altered)
4. Database implications (writes, reads, migrations)
5. Performance risks (load, concurrency, scheduling)
6. Possible regressions (what existing features could fail)
7. Recommended safe implementation strategy

Do NOT give generic advice.
Use the provided modules and reason carefully.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.15
  });

  return response.choices[0].message.content || "No analysis generated.";
}