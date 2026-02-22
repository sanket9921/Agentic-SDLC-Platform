export function buildSummaryPrompt(code: string, filePath: string) {
  return `
You are a senior software architect analyzing a source file.

Return ONLY valid JSON.

Schema:
{
  "responsibility": string,
  "main_exports": string[],
  "dependencies": string[],
  "side_effects": string,
  "domain": string
}

File path: ${filePath}

CODE:
${code}
`;
}