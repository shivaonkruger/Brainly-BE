import express from "express";
import signupRoutes from "./routes/Signup";
import signinRoutes from "./routes/Signin";

const app = express();

app.use(express.json());

app.use("/api/signup", signupRoutes);
app.use("/api/signin", signinRoutes);

export default app;
