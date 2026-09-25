import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens';
import { errorResponse } from '../utils/apiResponse';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(errorResponse('Unauthorized', 'UNAUTHORIZED', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.userId, role: decoded.role, email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json(errorResponse('Invalid or expired token', 'INVALID_TOKEN', 401));
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = { id: decoded.userId, role: decoded.role, email: decoded.email };
    }
    next();
  } catch (error) {
    // Ignore error for optional auth
    next();
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json(errorResponse('Forbidden', 'FORBIDDEN', 403));
    }
    next();
  });
};
