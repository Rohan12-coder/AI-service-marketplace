import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  GEMINI_API_KEY: string;
  GOOGLE_MAPS_API_KEY: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  FRONTEND_URL: string;
  ADMIN_EMAIL: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
}

const REQUIRED_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
] as const;

const validateEnv = (): void => {
  const missing: string[] = [];

  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.error(
      `❌  Missing required environment variables:\n  ${missing.join('\n  ')}`
    );
    console.error('   Please copy .env.example to .env and fill in all values.');
    process.exit(1);
  }

  // Warn about optional but recommended vars
  const recommended = [
    'GEMINI_API_KEY',
    'GOOGLE_MAPS_API_KEY',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'SMTP_USER',
    'SMTP_PASS',
  ];

  const missingOptional = recommended.filter((v) => !process.env[v]);
  if (missingOptional.length > 0) {
    console.warn(
      `⚠️   Optional env vars not set (some features will be disabled):\n  ${missingOptional.join('\n  ')}`
    );
  }
};

const env: EnvConfig = {
  PORT:                   parseInt(process.env.PORT || '5000', 10),
  NODE_ENV:               process.env.NODE_ENV || 'development',
  MONGODB_URI:            process.env.MONGODB_URI || '',
  JWT_SECRET:             process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN:         process.env.JWT_EXPIRES_IN || '7d',
  GEMINI_API_KEY:         process.env.GEMINI_API_KEY || '',
  GOOGLE_MAPS_API_KEY:    process.env.GOOGLE_MAPS_API_KEY || '',
  CLOUDINARY_CLOUD_NAME:  process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY:     process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET:  process.env.CLOUDINARY_API_SECRET || '',
  RAZORPAY_KEY_ID:        process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET:    process.env.RAZORPAY_KEY_SECRET || '',
  SMTP_HOST:              process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT:              parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER:              process.env.SMTP_USER || '',
  SMTP_PASS:              process.env.SMTP_PASS || '',
  FRONTEND_URL:           process.env.FRONTEND_URL || 'http://localhost:3000',
  ADMIN_EMAIL:            process.env.ADMIN_EMAIL || 'admin@marketplace.com',
  RATE_LIMIT_WINDOW_MS:   parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX:         parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
};

export { validateEnv, env };
export default env;
