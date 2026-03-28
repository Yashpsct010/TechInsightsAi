const mongoose = require("mongoose");

const IntelSchema = new mongoose.Schema(
  {
    intelHook: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
    },
    referenceUrl: {
      type: String,
      required: false,
    },
    displayDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// We want to be able to find today's specific intel easily.
IntelSchema.index({ displayDate: -1 });

module.exports = mongoose.model("Intel", IntelSchema);
