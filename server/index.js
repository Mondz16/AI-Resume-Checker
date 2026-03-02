import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import resumeRouter from "./routes/resumeRoutes.js";
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = "https://resume-ai-mondz16.vercel.app";

mongoose.connect(process.env.MONGODB_URI)
  .then(console.log("Connected to the Mongo DB"))
  .catch((error) => console.error(error));

const app = express();

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
  }),
);

app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
    validate: {xForwardedForHeader: false}
  }),
);

app.use("/api", resumeRouter);
app.use("/auth", authRoutes);

// Error Handlers
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(413)
      .json({
        error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`,
      });
  }
  if (err.message === "Only PDF files are accepted.") {
    return res.status(415).json({ error: err.message });
  }

  res.status(500).json({ error: err.message || "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
