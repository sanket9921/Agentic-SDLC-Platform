import { pool } from "../db/db";
import { registerProjectWatcher } from "./watcherService";

export async function bootstrapWatchers() {
  try {
    const projects = await pool.query(`SELECT id FROM projects`);

    for (const row of projects.rows) {
      console.log("Restoring watcher for project:", row.id);
      registerProjectWatcher(row.id);
    }

  } catch (err) {
    console.error("Watcher bootstrap failed:", err);
  }
}