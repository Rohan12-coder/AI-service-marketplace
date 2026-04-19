import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import env from '../config/env';

const rateLimitHandler = (_req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests from this IP. Please wait and try again later.',
    retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 60000),
  });
};

// ── General API rate limiter ──────────────────────────────────────────────────
export const apiLimiter = rateLimit({
  windowMs:         env.RATE_LIMIT_WINDOW_MS,   // 15 min
  max:              env.RATE_LIMIT_MAX,           // 100 requests
  standardHeaders:  true,
  legacyHeaders:    false,
  handler:          rateLimitHandler,
  skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1', // skip localhost in dev
});

// ── Strict limiter for auth routes ────────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,  // 15 min
  max:             20,               // 20 auth attempts
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

// ── Very strict limiter for password reset ────────────────────────────────────
export const passwordResetLimiter = rateLimit({
  windowMs:        60 * 60 * 1000, // 1 hour
  max:             5,               // 5 reset requests/hour
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again in 1 hour.',
  },
});

// ── AI endpoint limiter (more expensive) ─────────────────────────────────────
export const aiLimiter = rateLimit({
  windowMs:        60 * 60 * 1000, // 1 hour
  max:             50,              // 50 AI calls/hour
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'AI request limit reached. Please try again in an hour.',
  },
});

// ── Upload limiter ────────────────────────────────────────────────────────────
export const uploadLimiter = rateLimit({
  windowMs:        60 * 60 * 1000, // 1 hour
  max:             30,              // 30 uploads/hour
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Upload limit reached. Please try again in an hour.',
  },
});
