import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/azharuddin_next';

/**
 * In production a missing MONGODB_URI would otherwise fall back to localhost,
 * which does not exist on a hosting platform — producing a confusing timeout
 * instead of naming the actual problem.
 */
if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
  console.error(
    'MONGODB_URI is not set. Add it to your hosting platform’s environment variables — ' +
      '.env.local is git-ignored and is never deployed. See /api/health for a full diagnosis.'
  );
}

/**
 * Next.js hot-reloads modules in development, which would otherwise open a new
 * connection on every reload. Cache the connection on the global object.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
