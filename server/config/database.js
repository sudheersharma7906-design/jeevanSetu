// server/config/database.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jeevansetu';

/**
 * MongoDB Atlas & Local Connection Options
 * Tuned for M0 Atlas Free Tier and Container environments.
 */
const MONGO_OPTIONS = {
  autoIndex: true, // Build 2dsphere indexes automatically on startup
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10, // Maintain connection pool suited for free tier limits
  minPoolSize: 1,
  heartbeatFrequencyMS: 10000,
};

export async function connectDB() {
  try {
    const isAtlas = MONGODB_URI.includes('mongodb.net') || MONGODB_URI.startsWith('mongodb+srv');
    const targetType = isAtlas ? 'MongoDB Atlas Cloud' : 'Local MongoDB';

    const conn = await mongoose.connect(MONGODB_URI, MONGO_OPTIONS);

    console.log(`[MongoDB] Connected to ${targetType} at ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Connection notice: ${error.message}. Running in fallback in-memory/mock mode if needed.`);
    return null;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('[MongoDB] Disconnected successfully');
  } catch (error) {
    console.error('[MongoDB] Error during disconnect:', error.message);
  }
}

/**
 * Real-time health diagnostic for monitoring uptime and DB health
 */
export async function getDatabaseHealth() {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };

  const stateCode = mongoose.connection.readyState;
  const status = stateMap[stateCode] || 'unknown';
  const isConnected = stateCode === 1;

  let pingLatencyMs = null;
  if (isConnected && mongoose.connection.db) {
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      pingLatencyMs = Date.now() - start;
    } catch (err) {
      console.warn('[MongoDB Health Ping Failed]:', err.message);
    }
  }

  return {
    status: isConnected ? 'healthy' : 'disconnected',
    state: status,
    host: mongoose.connection.host || 'unknown',
    database: mongoose.connection.name || 'jivansetu',
    pingLatencyMs,
    isAtlas: (process.env.MONGODB_URI || '').includes('mongodb.net') || (process.env.MONGODB_URI || '').startsWith('mongodb+srv')
  };
}

mongoose.connection.on('connected', () => {
  console.log('[MongoDB Event] Connection established');
});

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Event] Connection lost / disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB Event] Reconnected to cluster');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB Event] Runtime error:', err.message);
});

export default connectDB;
