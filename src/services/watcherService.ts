import path from "path";
import fs from "fs";
import { startFileWatcher } from "../modules/fileWatcher";
import { pool } from "../db/db";
import { prepareRepo } from "../utils/git";

const activeWatchers = new Set<string>();

export async function registerProjectWatcher(projectId: string) {

  if (activeWatchers.has(projectId)) {
    console.log("Watcher already running for", projectId);
    return;
  }

  const project = await pool.query(
    `SELECT repo_url FROM projects WHERE id=$1`,
    [projectId]
  );

  if (project.rows.length === 0) return;

  const repoUrl = project.rows[0].repo_url;
  const repoPath = path.join(process.cwd(), "workspace", projectId);

  try {
    // If folder missing → reclone
    if (!fs.existsSync(repoPath)) {
      console.log("Workspace missing. Re-cloning:", projectId);
      await prepareRepo(repoUrl, projectId);
    }

    console.log("Launching persistent watcher for", projectId);

    startFileWatcher(projectId, repoPath);

    activeWatchers.add(projectId);

  } catch (err) {
    console.error("Watcher start failed:", projectId, err);
  }
}