import express from "express";
import Content from "../models/content";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, link, description, sourceType } = req.body;

    if (!title || !link || !description) {
      return res.status(400).json({
        message: "Mandatory fields are missing"
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

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;

    // Fetch only this user's content
    const contents = await Content.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Content fetched successfully",
      contents
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const contentId = req.params.id;
    const userId = (req as any).userId;

    const result = await Content.deleteOne({
      _id: contentId,
      userId: userId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Content not found or you don't have permission to delete it"
      });
    }

    return res.status(200).json({
      message: "Content deleted successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error"
    });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const contentId = req.params.id;
    const userId = (req as any).userId;
    const { title, link, description, sourceType } = req.body;

    const content = await Content.findOneAndUpdate(
      { _id: contentId, userId },
      { title, link, description, sourceType },
      { new: true } 
    );

    if (!content) {
      return res.status(404).json({
        message: "Content not found or you don't have permission to edit it"
      });
    }

    return res.status(200).json({
      message: "Content updated successfully",
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

