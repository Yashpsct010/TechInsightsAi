import { Document, Types } from 'mongoose';

export type BlogGenre =
  | 'tech-news'
  | 'ai-ml'
  | 'cybersecurity'
  | 'coding'
  | 'emerging-tech'
  | 'general';

export const BLOG_GENRES: BlogGenre[] = [
  'tech-news',
  'ai-ml',
  'cybersecurity',
  'coding',
  'emerging-tech',
  'general',
];

export interface IBlogLink {
  title: string;
  url: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
}

export interface IBlog {
  _id: Types.ObjectId | string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  imageCaption?: string;
  genre: BlogGenre;
  links: IBlogLink[];
  createdAt: Date;
  updatedAt: Date;
}

export type IBlogDocument = IBlog & Document;

export type UserRole = 'user' | 'admin';

export interface IUser {
  _id: Types.ObjectId | string;
  email: string;
  password?: string;
  role: UserRole;
  preferences: string[];
  bookmarks: (Types.ObjectId | string | IBlog)[];
  newsletterSubscribed: boolean;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export type IUserDocument = IUser & Document;

export interface IIntel {
  _id: Types.ObjectId | string;
  intelHook: string;
  topic: string;
  referenceUrl?: string;
  displayDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type IIntelDocument = IIntel & Document;

export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'down';
  databaseConnected: boolean;
  totalBlogs: number;
  totalUsers: number;
  latestBlogPublishedAt: string | null;
  blogsByGenre: Record<string, number>;
  environment: string;
  uptimeSeconds: number;
}
