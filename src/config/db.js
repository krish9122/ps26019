import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
 * Connects to MongoDB using Mongoose with connection pooling and error handling.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("Error: MONGODB_URI is not defined in environment variables (.env).");
    process.exit(1);
  }

  // Avoid creating multiple unnecessary connections if already connected
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true, // Build indexes automatically in development
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging 30s if offline
    });

    console.log(`MongoDB connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`\n[Database Connection Error]: Unable to connect to MongoDB.`);
    console.error(`Reason: ${error.message}`);
    console.error(`Configured URI: ${uri}`);
    console.error(`Troubleshooting:\n  1. If running locally, ensure MongoDB service is started (e.g., mongod or 'docker run -d -p 27017:27017 mongo:7').\n  2. If using MongoDB Atlas, verify your connection string and network IP whitelist in .env.\n`);
    process.exit(1);
  }
};

export { connectDB };
export default connectDB;
