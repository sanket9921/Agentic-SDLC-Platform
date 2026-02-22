import OpenAI from "openai";
import { retrieveRelevantContext } from "./retriever";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeFeature(
  projectId: string,
  userQuestion: string
) {
  const context = await retrieveRelevantContext(projectId, userQuestion);

  const prompt = `
You are a senior software architect helping on an existing project.

You are given:
1) Project knowledge extracted from the repository
2) A developer request

Using ONLY the provided knowledge, guide where and how the feature should be implemented.

Project Knowledge:
${context}

Developer Request:
${userQuestion}

Provide:
- affected modules
- files to modify
- new files needed
- risks
- database impact
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });

  return response.choices[0].message.content;
}