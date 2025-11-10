import { Request, Response, NextFunction } from 'express';

/**
 * @summary
 * Global error handling middleware for Express application
 *
 * @function errorMiddleware
 * @module middleware
 *
 * @param {Error} error - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 *
 * @returns {void} Sends error response to client
 */
export function errorMiddleware(error: any, req: Request, res: Response, next: NextFunction): void {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  console.error('Error:', {
    statusCode,
    message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
    timestamp: new Date().toISOString(),
  });
}
