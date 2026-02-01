import express from "express";
import signupRoutes from "./routes/Signup";
import signinRoutes from "./routes/Signin";
import contentRoutes from "./routes/content";

const app = express();

app.use(express.json());

app.use("/api/signup", signupRoutes);
app.use("/api/signin", signinRoutes);
app.use("/api/mybrain", contentRoutes);

export default app;
