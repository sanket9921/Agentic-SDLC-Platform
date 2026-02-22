import { pool } from "../db/db";

export async function getAffectedFiles(projectId: string, keywords: string[]) {

  // find initial related files
  const result = await pool.query(
    `
    SELECT id, file_path, dependencies
    FROM code_files
    WHERE project_id = $1
    AND (
      responsibilities ILIKE ANY($2)
      OR summary ILIKE ANY($2)
    )
    `,
    [projectId, keywords.map(k => `%${k}%`)]
  );

  const affected = new Set<string>();

  for (const row of result.rows) {
    affected.add(row.file_path);

    if (row.dependencies) {
      const deps = JSON.parse(row.dependencies);
      deps.forEach((d: string) => affected.add(d));
    }
  }

  return [...affected];
}