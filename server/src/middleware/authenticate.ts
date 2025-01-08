import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/unauthorized-error';
import { verifyToken } from '../utils/auth.utils';
import { JwtPayload } from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
    name: string;
    branchId?: number;
  };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Yetkilendirme başlığı bulunamadı');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as JwtPayload & {
      userId: number;
      email: string;
      role: string;
      name: string;
      branchId?: number;
    };

    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedError('Geçersiz veya süresi dolmuş token'));
  }
}; 