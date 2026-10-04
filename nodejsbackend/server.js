require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("./config/database");

const app = express();

// ─── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
  (process.env.FRONTEND_URL || "").replace(/\/+$/, ""),
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/+$/, "");
      if (
        allowedOrigins.includes(normalized) ||
        /^https?:\/\/localhost(:\d+)?$/.test(normalized) ||
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(normalized) ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  }),
);
app.options("*", cors());

// ─── BODY PARSERS ───────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── STATIC UPLOADS ─────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/uploads/seller",
  express.static(path.join(__dirname, "uploads", "sellers")),
);
app.use(
  "/uploads/sellers",
  express.static(path.join(__dirname, "uploads", "sellers")),
);
app.use(
  "/uploads/category",
  express.static(path.join(__dirname, "uploads", "categories")),
);
app.use(
  "/uploads/categories",
  express.static(path.join(__dirname, "uploads", "categories")),
);
app.use(
  "/uploads/products",
  express.static(path.join(__dirname, "uploads", "products")),
);

// ─── ROUTES ─────────────────────────────────────────────────────────────────
const apiRoutes = require("./routes/api");
app.use("/api/v1", apiRoutes);

// ─── HEALTH CHECK ───────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Sohani Dairy Farm API is running 🐄",
    version: "1.0.0",
  });
});

// ─── 404 HANDLER ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── GLOBAL ERROR HANDLER ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── START SERVER ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Sohani Dairy API running at http://localhost:${PORT}`);
});

module.exports = app;
