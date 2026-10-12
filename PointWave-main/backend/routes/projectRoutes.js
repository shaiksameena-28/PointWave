const express = require("express");

const { createProject } = require("../controllers/projectController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createProject);

module.exports = router;