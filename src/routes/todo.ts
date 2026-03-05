import express from "express";
import Todo from "../models/Todo";
import Roadmap from "../models/Roadmap";
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

// Create Smart Daily Todo based on Roadmaps
router.post("/smarttodo", authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).userId;
        const roadmaps = await Roadmap.find({ userId });

        let allPendingTasks: any[] = [];

        for (const roadmap of roadmaps) {
            // Target daily hours (tasks)
            const targetTasks = Math.max(1, Math.round(roadmap.hoursPerWeek / 7));
            let collectedTasks = 0;

            // Traverse phases
            for (const phase of roadmap.phases) {
                if (collectedTasks >= targetTasks) break;

                for (const task of phase.tasks) {
                    if (collectedTasks >= targetTasks) break;

                    if (task.subtasks && task.subtasks.length > 0) {
                        for (const subtask of task.subtasks) {
                            if (collectedTasks >= targetTasks) break;

                            if (!subtask.completed) {
                                allPendingTasks.push({
                                    description: `[${roadmap.goal}] ${subtask.title}: ${subtask.description}`,
                                    completed: false,
                                    roadmapId: roadmap._id,
                                    phaseId: phase._id,
                                    taskId: task._id,
                                    subtaskId: subtask._id
                                });
                                collectedTasks++;
                            }
                        }
                    }
                }
            }
        }

        if (allPendingTasks.length === 0) {
            return res.status(200).json({ message: "No pending tasks found across roadmaps." });
        }

        const today = new Date().toISOString().split('T')[0];

        const smartTodo = await Todo.create({
            userId,
            title: `Smart Daily Todo - ${today}`,
            isSmartTodo: true,
            tasks: allPendingTasks
        });

        res.status(201).json({ message: "Smart Todo created successfully", todo: smartTodo });
    } catch (error) {
        console.error("Error creating smart todo:", error);
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

        // Synchronization Logic: Update Roadmap subtasks if this is a Smart Todo
        if (todo.isSmartTodo && tasks) {
            for (const t of tasks) {
                if (t.roadmapId && t.phaseId && t.taskId && t.subtaskId) {
                    await Roadmap.updateOne(
                        {
                            _id: t.roadmapId,
                            "phases._id": t.phaseId,
                            "phases.tasks._id": t.taskId,
                            "phases.tasks.subtasks._id": t.subtaskId
                        },
                        {
                            $set: { "phases.$[phase].tasks.$[task].subtasks.$[subtask].completed": t.completed }
                        },
                        {
                            arrayFilters: [
                                { "phase._id": t.phaseId },
                                { "task._id": t.taskId },
                                { "subtask._id": t.subtaskId }
                            ]
                        }
                    );
                }
            }
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
