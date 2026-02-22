import OpenAI from "openai";
import { analyzeImpact } from "./impactAgent";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateImplementationPlan(
  projectId: string,
  feature: string
) {

  // 1️⃣ get architecture analysis first
  const impactReport = await analyzeImpact(projectId, feature);

  // 2️⃣ convert to engineering tasks
  const prompt = `
You are a senior technical lead.

Your job is to convert an architecture impact analysis into a concrete implementation plan developers can follow.

Feature:
${feature}

Impact Analysis:
${impactReport}

Create a structured implementation plan.

Rules:
- Each step must reference real files/modules
- Steps must be ordered
- Include file creation, modification, and database changes
- Be concise and actionable

Output format:

STEP NUMBER
Title:
Files:
Actions:
Reason:
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });

  return response.choices[0].message.content;
}