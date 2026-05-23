import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import issueRoutes from "./modules/issues/issues.routes.js";

const app = express();

app.use(express.json());

app.use("/api/auth",   authRoutes);
app.use("/api/issues", issueRoutes);

app.get("/", (_req, res) => {
  res.json({ success: true, message: "DevPulse API is running" });
});

export default app;