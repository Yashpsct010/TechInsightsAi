import mongoose, { Schema, Model } from 'mongoose';
import { IIntelDocument } from '../types.js';

const IntelSchema = new Schema<IIntelDocument>(
  {
    intelHook: {
      type: String,
      required: [true, 'Intel hook is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Intel topic is required'],
      trim: true,
    },
    referenceUrl: {
      type: String,
      required: false,
      trim: true,
    },
    displayDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize retrieval of today's / latest intel
IntelSchema.index({ displayDate: -1 });

export const Intel: Model<IIntelDocument> =
  (mongoose.models?.Intel as Model<IIntelDocument>) ||
  mongoose.model<IIntelDocument>('Intel', IntelSchema);

export default Intel;
