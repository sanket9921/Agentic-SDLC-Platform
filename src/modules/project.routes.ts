import { Router } from "express";
import { pool } from "../db/db";
import { ingestRepository } from "./ingestionOrchestrator";
import { registerProjectWatcher } from "../services/watcherService"
const router = Router();

router.post("/projects", async (req, res) => {
    try {
      const { name, repoUrl } = req.body;
  
      const project = await pool.query(
        `INSERT INTO projects(name, repo_url) VALUES ($1,$2) RETURNING id`,
        [name, repoUrl]
      );
  
      const projectId = project.rows[0].id;
  
      res.json({
        message: "Project created. Initial indexing started.",
        projectId
      });
  
      await ingestRepository(projectId, repoUrl);
  
      registerProjectWatcher(projectId);
  
    } catch (err) {
      console.error(err);
    }
  });

export default router;