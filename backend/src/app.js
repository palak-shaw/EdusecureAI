const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/database");

dotenv.config();
connectDB();

const app = express();
app.use(express.static(path.join(__dirname,'..',"dist")))

// ✅ Uploads folder auto-create — Render ke liye zaroori
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({
  baseURL:"https://edusecureai.onrender.com"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Frontend static files serve karo
app.use(express.static(path.join(__dirname, "../public")));

// ─── Routes ───────────────────────────────────────────────────────────────────
const aiRoutes = require("./routes/aiRoutes");
const offlineRoutes = require("./routes/offlineRoutes");
const deepfakeRoutes = require("./routes/deepfakeRoutes");
const questionRoutes = require("./routes/questionRoutes");

app.use("/api/ai", aiRoutes);
app.use("/api/offline", offlineRoutes);
app.use("/api/deepfake", deepfakeRoutes);
app.use("/api/questions", questionRoutes);

// ✅ React Router ke liye — sab routes pe index.html do
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/{*splat}",(req,res)=>{
  res.sendFile(path.join(__dirname,'..',"dist","index.html"))
})

module.exports = app;