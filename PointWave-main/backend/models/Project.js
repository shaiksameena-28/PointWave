const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (skills) => skills.length > 0,
        message: "At least one skill is required",
      },
    },

    budget: {
      type: String,
      required: true,
      trim: true,
    },

    timeline: {
      type: String,
      required: true,
      trim: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Completed", "Cancelled"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;