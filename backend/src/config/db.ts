import mongoose from 'mongoose';

const MAX_RETRIES = 5;
const RETRY_INTERVAL_MS = 5000;

let retryCount = 0;

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌  MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  const options: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    retryWrites: true,
  };

  try {
    const conn = await mongoose.connect(uri, options);
    retryCount = 0;
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
    console.log(`📦  Database: ${conn.connection.name}`);
  } catch (error) {
    const err = error as Error;
    console.error(`❌  MongoDB connection error: ${err.message}`);

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(
        `🔄  Retrying connection (${retryCount}/${MAX_RETRIES}) in ${RETRY_INTERVAL_MS / 1000}s...`
      );
      setTimeout(connectDB, RETRY_INTERVAL_MS);
    } else {
      console.error('💀  Max retries reached. Exiting process.');
      process.exit(1);
    }
  }
};

// ── Connection event listeners ────────────────────────────────────────────────
mongoose.connection.on('connected', () => {
  console.log('🟢  Mongoose connection established');
});

mongoose.connection.on('disconnected', () => {
  console.warn('🟡  Mongoose disconnected. Attempting reconnect...');
  setTimeout(connectDB, RETRY_INTERVAL_MS);
});

mongoose.connection.on('error', (err: Error) => {
  console.error(`🔴  Mongoose connection error: ${err.message}`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n📴  ${signal} received. Closing MongoDB connection...`);
  await mongoose.connection.close();
  console.log('✅  MongoDB connection closed. Exiting.');
  process.exit(0);
};

process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default connectDB;
