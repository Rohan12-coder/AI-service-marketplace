import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/helpers';
import { UserRole } from '../models/User';

/**
 * Restrict access to specific roles
 * Usage: restrictTo('admin', 'provider')
 */
export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'You are not logged in. Please log in to access this resource.', 401);
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      sendError(
        res,
        `Access denied. This resource requires one of the following roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
        403
      );
      return;
    }

    next();
  };
};

/**
 * Require admin role — shorthand
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    sendError(res, 'Authentication required.', 401);
    return;
  }

  if (req.user.role !== 'admin') {
    sendError(res, 'Admin access required.', 403);
    return;
  }

  next();
};

/**
 * Require provider role — shorthand
 */
export const providerOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    sendError(res, 'Authentication required.', 401);
    return;
  }

  if (req.user.role !== 'provider' && req.user.role !== 'admin') {
    sendError(res, 'Provider access required.', 403);
    return;
  }

  next();
};

/**
 * Verify the requesting user owns the resource (or is admin)
 */
export const ownerOrAdmin = (userIdField = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];

    if (
      req.user.role !== 'admin' &&
      String(req.user._id) !== String(resourceUserId)
    ) {
      sendError(res, 'You do not have permission to access this resource.', 403);
      return;
    }

    next();
  };
};
