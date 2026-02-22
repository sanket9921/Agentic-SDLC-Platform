import { pool } from "../db/db";

/**
 * returns deep impact graph
 * depth = how many hops to follow dependencies
 */
export async function resolveDependencyImpact(
  projectId: string,
  startingFiles: string[],
  depth: number = 3
) {
  const visited = new Set<string>();
  let frontier = [...startingFiles];

  for (let i = 0; i < depth; i++) {
    const nextFrontier: string[] = [];

    for (const file of frontier) {
      if (visited.has(file)) continue;
      visited.add(file);

      const result = await pool.query(
        `SELECT dependencies FROM code_files
         WHERE project_id=$1 AND file_path=$2`,
        [projectId, file]
      );

      if (!result.rows.length) continue;

      const deps = result.rows[0].dependencies
        ? JSON.parse(result.rows[0].dependencies)
        : [];

      deps.forEach((d: string) => {
        if (!visited.has(d)) nextFrontier.push(d);
      });
    }

    frontier = nextFrontier;
  }

  return Array.from(visited);
}