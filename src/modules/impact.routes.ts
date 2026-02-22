import { Router } from "express";
import { analyzeImpact } from "./impactAgent";

const router = Router();

router.post("/impact", async (req, res) => {
  const { projectId, feature } = req.body;

  const report = await analyzeImpact(projectId, feature);

  res.json({ report });
});

export default router;