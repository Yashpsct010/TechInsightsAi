import mongoose, { Schema, Model } from 'mongoose';
import { IBlogDocument, BLOG_GENRES } from '../types.js';

const BlogLinkSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
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
  { _id: false }
);

const BlogSchema = new Schema<IBlogDocument>(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      index: true,
    },
    body: {
      type: String,
      required: [true, 'Blog body is required'],
    },
    image: {
      type: String,
      required: [true, 'Blog hero image is required'],
    },
    imageAlt: {
      type: String,
      required: [true, 'Image alt text is required for accessibility'],
    },
    imageCaption: {
      type: String,
      required: false,
    },
    genre: {
      type: String,
      required: true,
      enum: BLOG_GENRES,
      default: 'general',
      index: true,
    },
    links: {
      type: [BlogLinkSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for genre filtering sorted by latest first
BlogSchema.index({ genre: 1, createdAt: -1 });

// Index for latest blogs across all genres
BlogSchema.index({ createdAt: -1 });

// Full-text search index across title and body
BlogSchema.index(
  { title: 'text', body: 'text' },
  { weights: { title: 5, body: 1 }, name: 'BlogTextIndex' }
);

export const Blog: Model<IBlogDocument> =
  (mongoose.models?.Blog as Model<IBlogDocument>) ||
  mongoose.model<IBlogDocument>('Blog', BlogSchema);

export default Blog;
