import { Router } from "express";

const router = Router();

// Simple endpoint to confirm that the API is available.
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

export default router;
