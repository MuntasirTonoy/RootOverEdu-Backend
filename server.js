require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
// Import Config
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

// Initialize App
const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://rootover.vercel.app",
      /\.vercel\.app$/, // Allow all Vercel preview/deployment URLs
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", userRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("EdTech API is running...");
});

// Temporary Debug Route (Remove after fixing)
app.get("/debug-env", (req, res) => {
  const envVar = process.env.FIREBASE_SERVICE_ACCOUNT;
  let parsed = null;
  let parseError = null;
  let isBase64 = false;

  if (envVar) {
    try {
      let rawConfig = envVar;
      if (!rawConfig.trim().startsWith("{")) {
        isBase64 = true;
        rawConfig = Buffer.from(rawConfig, "base64").toString("utf8");
      }
      parsed = JSON.parse(rawConfig);
    } catch (e) {
      parseError = e.message;
    }
  }

  res.json({
    message: "Debug Info v3 (Base64 Support)",
    hasFirebaseKey: !!envVar,
    keyLength: envVar ? envVar.length : 0,
    isBase64: isBase64,
    parseSuccess: !!parsed,
    parseError: parseError,
    // Check if private_key exists and has correct format (newline handling)
    hasPrivateKey: parsed ? !!parsed.private_key : false,
    privateKeyStart:
      parsed && parsed.private_key
        ? parsed.private_key.substring(0, 30)
        : "N/A",
    privateKeyHasNewlines:
      parsed && parsed.private_key ? parsed.private_key.includes("\n") : "N/A",
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error", error: err.message });
});

// Start Server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
