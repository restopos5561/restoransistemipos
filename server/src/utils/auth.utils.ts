import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { UnauthorizedError } from '../errors/unauthorized-error';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_REFRESH_EXPIRES_IN = '7d';

// Password utils
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  candidatePassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

// AUTH UTILS DÜZELTMESİ - Interface ekleyelim
interface TokenUserData {
  id: number;
  email: string;
  role: string;
  name: string;
  branchId?: number | null;
}

// Token utils
export const generateTokens = (userData: TokenUserData) => {
  if (!userData.id || !userData.email || !userData.role || !userData.name) {
    throw new Error('Missing required user data for token generation');
  }

  const accessToken = jwt.sign(
    {
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      name: userData.name,
      branchId: userData.branchId || null
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId: userData.id },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string) => {
  try {
    console.log('Verifying token:', token);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    return decoded as jwt.JwtPayload;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new UnauthorizedError('Invalid token');
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as jwt.JwtPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid refresh token');
  }
};

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
