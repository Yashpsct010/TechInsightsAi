// Connection utility
export {
  connectToDatabase,
  isDatabaseConnected,
  disconnectDatabase,
  type ConnectionOptions,
} from './connection.js';

// Mongoose Models
export { Blog } from './models/Blog.js';
export { User } from './models/User.js';
export { Intel } from './models/Intel.js';

// Shared Types & Interfaces
export {
  type BlogGenre,
  BLOG_GENRES,
  type IBlogLink,
  type IBlog,
  type IBlogDocument,
  type UserRole,
  type IUser,
  type IUserDocument,
  type IIntel,
  type IIntelDocument,
  type SystemStatus,
} from './types.js';
