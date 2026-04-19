import jwt from 'jsonwebtoken';
import env from '../config/env';

export interface JwtPayload {
  id: string;
  role: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a signed JWT token for a user
 */
export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer:    'smart-service-marketplace',
    audience:  'marketplace-users',
  });
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer:   'smart-service-marketplace',
      audience: 'marketplace-users',
    }) as JwtPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired. Please log in again.');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token. Please log in again.');
    }
    throw new Error('Token verification failed.');
  }
};

/**
 * Generate a short-lived reset token (for password reset)
 */
export const generateResetToken = (userId: string): string => {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id: userId, purpose: 'password-reset' }, env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

/**
 * Verify a password reset token
 */
export const verifyResetToken = (token: string): { id: string } => {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      purpose: string;
    };

    if (decoded.purpose !== 'password-reset') {
      throw new Error('Invalid reset token');
    }

    return { id: decoded.id };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Reset link has expired. Please request a new one.');
    }
    throw new Error('Invalid or expired reset token.');
  }
};
