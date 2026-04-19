import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { validateEnv, env } from './config/env';
import connectDB from './config/db';
import configureCloudinary from './config/cloudinary';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { sanitizeQueryParams } from './middleware/validate.middleware';
import { handleUploadError } from './middleware/upload.middleware';

// ── Validate environment before anything else ─────────────────────────────────
validateEnv();

// ── Import routes ─────────────────────────────────────────────────────────────
import authRoutes         from './routes/auth.routes';
import userRoutes         from './routes/user.routes';
import providerRoutes     from './routes/provider.routes';
import serviceRoutes      from './routes/service.routes';
import bookingRoutes      from './routes/booking.routes';
import reviewRoutes       from './routes/review.routes';
import aiRoutes           from './routes/ai.routes';
import paymentRoutes      from './routes/payment.routes';
import adminRoutes        from './routes/admin.routes';
import notificationRoutes from './routes/notification.routes';

const app: Application = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        env.FRONTEND_URL,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials:      true,
    methods:          ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders:   ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders:   ['X-Total-Count', 'X-Page-Count'],
    optionsSuccessStatus: 200,
  })
);

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Request logging ───────────────────────────────────────────────────────────
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      skip: (_req, res) => res.statusCode < 400, // only log errors in production
    })
  );
}

// ── Rate limiting (applied globally) ─────────────────────────────────────────
app.use('/api/', apiLimiter);

// ── Query sanitisation ────────────────────────────────────────────────────────
app.use(sanitizeQueryParams);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status:      'healthy',
    environment: env.NODE_ENV,
    timestamp:   new Date().toISOString(),
    uptime:      process.uptime(),
    version:     '1.0.0',
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: '✦ Smart Service Marketplace API',
    version: '1.0.0',
    docs:    '/api/docs',
    health:  '/health',
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/providers',     providerRoutes);
app.use('/api/services',      serviceRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/notifications', notificationRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found. Check the API documentation.',
  });
});

// ── Multer / upload error handler ─────────────────────────────────────────────
app.use(handleUploadError);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = (err as { status?: number; statusCode?: number }).status ||
                     (err as { status?: number; statusCode?: number }).statusCode || 500;

  console.error(`[ERROR] ${err.message}`, {
    stack:  err.stack,
    status: statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message: env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again.'
      : err.message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Unhandled promise rejections ──────────────────────────────────────────────
process.on('unhandledRejection', (reason: unknown) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  console.error('💥  Unhandled Rejection:', message);
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  console.error('💥  Uncaught Exception:', err.message);
  process.exit(1);
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Configure Cloudinary
    configureCloudinary();

    // Start HTTP server
    const server = app.listen(env.PORT, () => {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  ✦  Smart Service Marketplace API');
      console.log(`  🌍  Mode:    ${env.NODE_ENV}`);
      console.log(`  🚀  Server:  http://localhost:${env.PORT}`);
      console.log(`  📡  Health:  http://localhost:${env.PORT}/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });

    // Handle server errors
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌  Port ${env.PORT} is already in use.`);
      } else {
        console.error('❌  Server error:', err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    const err = error as Error;
    console.error('❌  Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

export default app;
