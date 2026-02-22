import { Router } from "express";
import { analyzeFeature } from "./analysisAgent";

const router = Router();

router.post("/analyze", async (req, res) => {
  const { projectId, question } = req.body;

  const answer = await analyzeFeature(projectId, question);

  res.json({ answer });
});

export default router;