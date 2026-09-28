import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000, // Quick 3s timeout for local check
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (env.NODE_ENV !== 'production') {
      console.log('⚡ Local MongoDB service not detected on port 27017.');
      console.log('🚀 Starting in-memory MongoDB server for instant local development...');

      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongoMemoryServer = await MongoMemoryServer.create();
        const memoryUri = mongoMemoryServer.getUri();
        const conn = await mongoose.connect(memoryUri);
        console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (memError) {
        console.error(`In-Memory MongoDB Error: ${(memError as Error).message}`);
        process.exit(1);
      }
    }

    console.error(`MongoDB Connection Error: ${(error as Error).message}`);
    process.exit(1);
  }
};
