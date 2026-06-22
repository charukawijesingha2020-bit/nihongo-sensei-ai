/**
 * src/lib/mongodb.ts
 * Mongoose connection helper for Next.js App Router (TypeScript)
 *
 * - Reads MONGODB_URI from environment
 * - Prevents multiple connections during hot reload using a global cache
 * - Exports async connectDB(): Promise<mongoose.Connection>
 * - Proper error handling and retry support
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('The MONGODB_URI environment variable is not set. Add it to .env.local');
}

type MongooseCache = {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
};

declare global {
  // Allow a global cache across module reloads in dev
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const globalWithMongoose = globalThis as typeof globalThis & { _mongooseCache?: MongooseCache };

if (!globalWithMongoose._mongooseCache) {
  globalWithMongoose._mongooseCache = { conn: null, promise: null };
}

/**
 * connectDB
 * Connects to MongoDB using Mongoose and returns the mongoose.Connection.
 * Safe to call multiple times; will reuse the cached connection across hot reloads.
 */
export async function connectDB(): Promise<mongoose.Connection> {
  if (globalWithMongoose._mongooseCache!.conn) {
    return globalWithMongoose._mongooseCache!.conn!;
  }

  if (!globalWithMongoose._mongooseCache!.promise) {
    globalWithMongoose._mongooseCache!.promise = mongoose
      .connect(MONGODB_URI, {
        // Keep default options for Mongoose 6/7; disable buffering to fail fast when disconnected
        bufferCommands: false,
      })
      .then((m) => m.connection);
  }

  try {
    globalWithMongoose._mongooseCache!.conn = await globalWithMongoose._mongooseCache!.promise;
    return globalWithMongoose._mongooseCache!.conn!;
  } catch (error) {
    // Allow retries by clearing the promise on failure
    globalWithMongoose._mongooseCache!.promise = null;
    // Provide context and rethrow for the caller to handle
    console.error('[mongo] connection error:', error);
    throw error;
  }
}

export default connectDB;
