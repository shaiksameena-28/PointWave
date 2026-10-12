const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const protect = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "PointWave API is running",
  });
});

app.get("/api/protected-test", protect, (req, res) => {
  res.json({
    success: true,
    message: "You accessed a protected route!",
    user: req.user,
  });
});

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`PointWave server running on port ${PORT}`);
});