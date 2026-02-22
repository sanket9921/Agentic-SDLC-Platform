import OpenAI from "openai";
import { retrieveRelevantContext } from "./retriever";
import { pool } from "../db/db";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function reviewCodeChange(
    projectId: string,
    filePath: string,
    summary: string,
    absolutePath: string
  ) {

  // get architectural context
  const context = await retrieveRelevantContext(
    projectId,
    `architecture of project modules and responsibilities`
  );
  let code = "";
try {
  code = fs.readFileSync(absolutePath, "utf-8").slice(0, 6000);
} catch {}

const prompt = `
You are a strict senior software architect performing a real code review.

Modified file:
${filePath}

Actual code:
${code}

File understanding:
${summary}

Project architecture knowledge:
${context}

Your job:
Critically review the REAL code (not hypotheticals).

Return:

1) architectural violations (specific lines or patterns)
2) real bugs or edge cases
3) performance problems
4) security issues
5) concrete refactoring suggestions

Avoid generic advice. Base your reasoning on the code you see.
`;
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    temperature: 0.1,
    messages: [{ role: "user", content: prompt }]
  });

  const review = response.choices[0].message.content || "";

  await pool.query(
    `INSERT INTO reviews(project_id, file_path, review_text)
     VALUES ($1,$2,$3)`,
    [projectId, filePath, review]
  );

  console.log("AI REVIEW:\n", review);
}