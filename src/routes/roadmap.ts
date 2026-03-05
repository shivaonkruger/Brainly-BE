import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Roadmap from "../models/Roadmap";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { goal, category, currentLevel, timeAvailability, deadline, learningStyle, budget } = req.body;
        const userId = (req as any).userId;

        if (!goal || !category || !currentLevel || !timeAvailability || !deadline) {
            return res.status(400).json({
                message: "Missing required fields. Please make the sure the mendatory fields are filled"
            });
        }

        // Parse hours per week from timeAvailability, fallback to 7 hours default
        const hoursMatch = timeAvailability ? String(timeAvailability).match(/\d+/) : null;
        const hoursPerWeek = hoursMatch ? parseInt(hoursMatch[0], 10) : 7;

        //crazy reason for this type of shit is important so the server does not break, terniary operator and both the response if-else loop are helping the server thrive.

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `
      Generate a highly detailed and comprehensive learning roadmap for a user.
      Goal: ${goal}
      Category: ${category || "General"}
      Current Level: ${currentLevel || "Beginner"}
      Time Availability: ${timeAvailability || "Flexible"}
      Deadline: ${deadline || "None"}
      Learning Style: ${learningStyle || "Interactive"}
      Budget: ${budget || "Free"}

      IMPORTANT INSTRUCTIONS:
      - Do NOT just generate a single phase. Break the entire journey down into multiple logical, sequential phases (e.g., Fundamentals, Intermediate Concepts, Advanced Projects, etc.).
      - Each phase MUST contain multiple actionable tasks.
      - Each task MUST be broken down into detailed subtasks.
      - CRITICAL: Design each subtask so it takes roughly 1 hour to complete.

      Return ONLY a VALID JSON object (no markdown, no explanations) with this structure:
      {
        "phases": [
          {
            "title": "Phase 1: Title",
            "tasks": [
              {
                "title": "Task Title",
                "description": "Task Description",
                "resources": ["url1", "url2"],
                "status": "pending",
                "subtasks": [
                  {
                     "title": "Subtask Title",
                     "description": "Subtask description.",
                     "completed": false
                  }
                ]
              }
            ]
          }
        ]
      }
     Note again:The phases can be any number depending on the requirement of the roadmap, dont limit the lenght of it, and keep the number of the subtasks also flexible[as per requirement].
    `;
    


        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let roadmapData;
        try {
            roadmapData = JSON.parse(text);
        } catch (e) {
            console.error("AI Response parsing failed:", text);
            return res.status(500).json({ message: "Failed to generate roadmap format" });
        }

        const roadmap = await Roadmap.create({
            userId,
            goal,
            hoursPerWeek,
            phases: roadmapData.phases
        });

        res.status(201).json({ message: "Roadmap created", roadmap });

    } catch (error) {
        console.error("Error generating roadmap:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const roadmaps = await Roadmap.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ roadmaps });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const roadmap = await Roadmap.findOne({ _id: req.params.id, userId });

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        res.status(200).json({ roadmap });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { phases, goal } = req.body;

        const roadmap = await Roadmap.findOneAndUpdate(
            { _id: req.params.id, userId },
            { phases, goal },
            { new: true }
        );

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        res.status(200).json({ message: "Roadmap updated", roadmap });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const result = await Roadmap.deleteOne({ _id: req.params.id, userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        res.status(200).json({ message: "Roadmap deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
