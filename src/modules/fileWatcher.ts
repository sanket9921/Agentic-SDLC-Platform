import chokidar from "chokidar";
import path from "path";
import fs from "fs";
import { ingestSingleFile } from "./singleFileIngestor";

function getAllDirectories(dir: string, dirs: string[] = []) {
    if (!fs.existsSync(dir)) return dirs;
  
    dirs.push(dir);
  
    for (const file of fs.readdirSync(dir)) {
      const full = path.join(dir, file);
      try {
        if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
          getAllDirectories(full, dirs);
        }
      } catch {
        // directory deleted while scanning → ignore
      }
    }
    return dirs;
  } 

export function startFileWatcher(projectId: string, repoPath: string) {

  console.log("Scanning directories...");

  const directories = getAllDirectories(repoPath);

  console.log("Watching", directories.length, "directories");

  const watcher = chokidar.watch(directories, {
    persistent: true,
    ignoreInitial: true,
    usePolling: true,
    interval: 250,
    awaitWriteFinish: {
      stabilityThreshold: 800,
      pollInterval: 150
    }
  });

  watcher.on("ready", () => {
    console.log("Watcher is ready and monitoring files...");
  });

  watcher.on("change", async (filePath) => {
    try {

      if (!filePath.match(/\.(py|js|ts|json)$/)) return;

      console.log("Detected change:", filePath);

      await ingestSingleFile(projectId, repoPath, filePath);

      console.log("AI memory updated:", path.basename(filePath));

    } catch (err) {
      console.error(err);
    }
  });

  watcher.on("add", async (filePath) => {
    if (!filePath.match(/\.(py|js|ts|json)$/)) return;
    console.log("Detected new file:", filePath);
    await ingestSingleFile(projectId, repoPath, filePath);
  });
}