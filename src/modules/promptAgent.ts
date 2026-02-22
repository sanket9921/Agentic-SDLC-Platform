import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateCodingPrompt(step: string, projectContext: string) {

  const prompt = `
You are preparing instructions for an AI coding assistant (like Cursor).

Your job is to convert a development step into a precise coding prompt.

Project Context:
${projectContext}

Development Step:
${step}

Create a prompt that:
- explains the goal
- references existing modules
- prevents breaking behavior
- specifies constraints
- tells the coding AI what to output

Output ONLY the final prompt to give to the coding AI.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });

  return response.choices[0].message.content;
}