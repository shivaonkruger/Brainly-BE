import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();

import signupRoutes from "./routes/Signup";
import signinRoutes from "./routes/Signin";
import contentRoutes from "./routes/content";

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/brainly";
app.use(cors());
app.use(express.json());

app.use("/api/signup", signupRoutes);
app.use("/api/signin", signinRoutes);
app.use("/api/mybrain", contentRoutes);
import roadmapRoutes from "./routes/roadmap";
app.use("/api/roadmap", roadmapRoutes);

// Connect to MongoDB and start server
async function startServer() {
  try {
    // Check if we are ALREADY connected (1)
    if (mongoose.connection.readyState !== 1) {
      console.log("Attempting to connect to MongoDB...");
      await mongoose.connect(MONGO_URI);
      console.log("Connected to MongoDB");
    } else {
      console.log("Already connected to MongoDB");
    }

    // Start the server only once
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Critical: Error starting server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
