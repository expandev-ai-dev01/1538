import { Request, Response, NextFunction } from 'express';

/**
 * @summary
 * Middleware to handle 404 Not Found errors
 *
 * @function notFoundMiddleware
 * @module middleware
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 *
 * @returns {void} Sends 404 response to client
 */
export function notFoundMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      path: req.path,
      method: req.method,
    },
    timestamp: new Date().toISOString(),
  });
}
