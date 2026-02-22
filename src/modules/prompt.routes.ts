import { Router } from "express";
import { generateCodingPrompt } from "./promptAgent";

const router = Router();

router.post("/prompt", async (req, res) => {
  const { step, context } = req.body;

  const prompt = await generateCodingPrompt(step, context);

  res.json({ prompt });
});

export default router;