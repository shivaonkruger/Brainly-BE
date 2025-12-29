import express from "express";
import Content from "../models/content";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// Add content (protected)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, link, description, sourceType } = req.body;

    if (!title || !link || !description) {
      return res.status(400).json({
        message: "Title, link, and description are required"
      });
    }

    const content = await Content.create({
      userId: (req as any).userId,
      title,
      link,
      description,
      sourceType
    });

    return res.status(201).json({
      message: "Content added successfully",
      content
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
});

export default router;
