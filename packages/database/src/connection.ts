import mongoose from 'mongoose';

/**
 * Interface to cache the active Mongoose connection and promise globally.
 * Crucial for Next.js App Router serverless invocations and hot-reloading in dev.
 */
interface MongooseConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseGlobalCache: MongooseConnectionCache | undefined;
}

let cached: MongooseConnectionCache = global.mongooseGlobalCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseGlobalCache) {
  global.mongooseGlobalCache = cached;
}

export interface ConnectionOptions {
  uri?: string;
  maxPoolSize?: number;
}

/**
 * Connects to MongoDB with connection pooling and caching.
 * Idempotent: Subsequent calls return the existing active connection.
 */
export async function connectToDatabase(options: ConnectionOptions = {}): Promise<typeof mongoose> {
  const uri = options.uri || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not defined. Please set it in your environment variables (.env.local or .env).'
    );
  }

  // If already connected, return the cached connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If already connecting, await the active promise
  if (!cached.promise) {
    const poolSize = options.maxPoolSize || Number(process.env.MONGODB_MAX_POOL_SIZE) || 10;

    const opts: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: poolSize,
      retryWrites: true,
      w: 'majority',
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}

/**
 * Returns whether the database connection is currently active.
 */
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Disconnects from the database (useful for graceful worker shutdowns and test runners).
 */
export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
