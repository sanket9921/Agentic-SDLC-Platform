import express from "express";
import cors from "cors";
import { pool } from "./db/db";

import projectRoutes from "./modules/project.routes";
import analysisRoutes from "./modules/analysis.routes";
import impactRoutes from "./modules/impact.routes";
import plannerRoutes from "./modules/planner.routes";
import promptRoutes from "./modules/prompt.routes";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", projectRoutes);
app.use("/api", analysisRoutes);
app.use("/api", impactRoutes);
app.use("/api", plannerRoutes);
app.use("/api", promptRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.get("/db-test", async (_, res) => {
    try {
      const result = await pool.query("SELECT NOW()");
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "DB connection failed" });
    }
  });

export default app;