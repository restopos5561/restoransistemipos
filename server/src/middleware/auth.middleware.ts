import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/unauthorized-error';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  branchId?: number;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token bulunamadı',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Geçersiz token',
      });
    }
  } catch (error) {
    next(error);
  }
};

export const requireChefAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'CHEF' && req.user.role !== 'ADMIN')) {
    throw new UnauthorizedError('Bu işlem için yetkiniz yok');
  }
  next();
};

export const requireBarAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'BAR' && req.user.role !== 'ADMIN')) {
    throw new UnauthorizedError('Bu işlem için yetkiniz yok');
  }
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new UnauthorizedError('Bu işlem için admin yetkisi gerekiyor');
  }
  next();
};
