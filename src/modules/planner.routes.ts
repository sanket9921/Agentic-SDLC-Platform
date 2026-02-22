import { Router } from "express";
import { generateImplementationPlan } from "./plannerAgent";

const router = Router();

router.post("/plan", async (req, res) => {
  const { projectId, feature } = req.body;

  const plan = await generateImplementationPlan(projectId, feature);

  res.json({ plan });
});

export default router;