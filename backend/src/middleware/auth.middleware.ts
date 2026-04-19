import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import User, { IUser } from '../models/User';
import { sendError } from '../utils/helpers';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
      userRole?: string;
    }
  }
}

/**
 * Protect routes — verifies JWT token and attaches user to request
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check Authorization header (Bearer token)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fallback: check cookie
    else if (req.cookies?.token) {
      token = req.cookies.token as string;
    }

    if (!token) {
      sendError(res, 'Access denied. No token provided.', 401);
      return;
    }

    // Verify token
    let decoded: JwtPayload;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      const error = err as Error;
      sendError(res, error.message, 401);
      return;
    }

    // Fetch user from DB (ensures account still exists & is active)
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      sendError(res, 'The user belonging to this token no longer exists.', 401);
      return;
    }

    if (!user.isActive) {
      sendError(res, 'Your account has been deactivated. Please contact support.', 401);
      return;
    }

    // Attach to request
    req.user     = user;
    req.userId   = String(user._id);
    req.userRole = user.role;

    next();
  } catch (error) {
    const err = error as Error;
    sendError(res, `Authentication failed: ${err.message}`, 500);
  }
};

/**
 * Optional auth — attaches user if token exists, but doesn't block if missing
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (user && user.isActive) {
      req.user     = user;
      req.userId   = String(user._id);
      req.userRole = user.role;
    }
  } catch {
    // Silently ignore — optional auth doesn't block
  }

  next();
};
