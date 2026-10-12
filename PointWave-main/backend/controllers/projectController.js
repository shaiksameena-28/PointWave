const Project = require("../models/Project");

const createProject = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can create projects",
      });
    }
    const {
      title,
      description,
      category,
      skills,
      budget,
      timeline,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !skills ||
      skills.length === 0 ||
      !budget ||
      !timeline
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, category, skills, budget, and timeline are required",
      });
    }

    const project = await Project.create({
      title,
      description,
      category,
      skills,
      budget,
      timeline,
      client: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
};