import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendError } from '../utils/helpers';

/**
 * Run validation chains and return 422 if any fail
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations in parallel
    await Promise.all(validations.map((v) => v.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field:   (err as { path?: string; param?: string }).path || (err as { path?: string; param?: string }).param || 'unknown',
      message: err.msg as string,
    }));

    res.status(422).json({
      success: false,
      message: 'Validation failed. Please check the errors and try again.',
      errors:  formattedErrors,
    });
  };
};

/**
 * Sanitize all string body fields — trim whitespace
 */
export const sanitizeBody = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body && typeof req.body === 'object') {
    const sanitizeValue = (value: unknown): unknown => {
      if (typeof value === 'string') return value.trim();
      if (Array.isArray(value))      return value.map(sanitizeValue);
      if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>;
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(obj)) {
          result[key] = sanitizeValue(obj[key]);
        }
        return result;
      }
      return value;
    };

    req.body = sanitizeValue(req.body) as Record<string, unknown>;
  }
  next();
};

/**
 * Prevent MongoDB operator injection in query params
 */
export const sanitizeQueryParams = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const sanitize = (obj: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$')) continue; // drop $ operators
      const val = obj[key];
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        result[key] = sanitize(val as Record<string, unknown>);
      } else {
        result[key] = val;
      }
    }
    return result;
  };

  req.query  = sanitize(req.query  as Record<string, unknown>) as typeof req.query;
  req.params = sanitize(req.params as Record<string, unknown>) as typeof req.params;

  next();
};
