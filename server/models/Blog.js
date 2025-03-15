const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    imageAlt: {
      type: String,
      required: true,
    },
    imageCaption: {
      type: String,
      required: false,
    },
    genre: {
      type: String,
      required: true,
      enum: [
        "tech-news",
        "ai-ml",
        "cybersecurity",
        "coding",
        "emerging-tech",
        "general",
      ],
      default: "general",
    },
    links: [
      {
        title: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: false,
        },
        image: {
          type: String,
          required: false,
        },
        imageAlt: {
          type: String,
          required: false,
        },
        imageCaption: {
          type: String,
          required: false,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient genre-based queries
BlogSchema.index({ genre: 1, createdAt: -1 });

module.exports = mongoose.model("Blog", BlogSchema);
