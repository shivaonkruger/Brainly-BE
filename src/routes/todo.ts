import express from "express";
import Todo from "../models/Todo";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// Create a new Todo
router.post("/", authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { title, tasks } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const todo = await Todo.create({
            userId,
            title,
            tasks: tasks || []
        });

        res.status(201).json({ message: "Todo created successfully", todo });
    } catch (error) {
        console.error("Error creating todo:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get all Todos for a user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const todos = await Todo.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({ todos });
    } catch (error) {
        console.error("Error fetching todos:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update a Todo by ID
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { title, tasks } = req.body;

        const todo = await Todo.findOneAndUpdate(
            { _id: req.params.id, userId },
            { title, tasks },
            { new: true, runValidators: true }
        );

        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.status(200).json({ message: "Todo updated successfully", todo });
    } catch (error) {
        console.error("Error updating todo:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete a Todo by ID
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const result = await Todo.deleteOne({ _id: req.params.id, userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.status(200).json({ message: "Todo deleted successfully" });
    } catch (error) {
        console.error("Error deleting todo:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
