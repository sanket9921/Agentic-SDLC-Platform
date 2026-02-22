import { exec } from "child_process";
import path from "path";
import fs from "fs/promises";
import util from "util";

const execAsync = util.promisify(exec);

const WORKSPACE = path.join(process.cwd(), "workspace");

export async function prepareRepo(repoUrl: string, projectId: string) {
  const projectPath = path.join(WORKSPACE, projectId);

  try {
    // check if repo already exists
    await fs.access(projectPath);

    console.log("Repository exists. Pulling latest changes...");

    // update instead of reclone
    await execAsync(`git -C ${projectPath} pull`);

  } catch {
    // repo not present → first clone
    console.log("Cloning repository for first time...");
    await execAsync(`git clone ${repoUrl} ${projectPath}`);
  }

  return projectPath;
}