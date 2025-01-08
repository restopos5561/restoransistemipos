import { PrismaClient } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';
import { UnauthorizedError } from '../errors/unauthorized-error';
import { comparePassword, generateTokens, verifyRefreshToken } from '../utils/auth.utils';

// Interface'i doğrudan burada tanımla
interface LoginCredentials {
  email: string;
  password: string;
  branchId?: number;
  restaurantId?: number;
}

const prisma = new PrismaClient();

export class AuthService {
  async login(credentials: LoginCredentials) {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      include: {
        userBranches: {
          include: {
            branch: {
              select: {
                id: true,
                name: true,
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!user || !(await comparePassword(credentials.password, user.password))) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Aktif şubeleri filtrele
    const activeBranches = user.userBranches
      .filter(ub => ub.branch.isActive)
      .map(ub => ({
        id: ub.branch.id,
        name: ub.branch.name
      }));

    // Şube kontrolü
    if (credentials.branchId) {
      const hasBranchAccess = activeBranches.some(b => b.id === credentials.branchId);
      if (!hasBranchAccess) {
        throw new UnauthorizedError('No access to this branch');
      }
      
      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        branchId: credentials.branchId
      });

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            branchId: credentials.branchId
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      };
    }

    // Birden fazla şube varsa
    if (activeBranches.length > 1) {
      return {
        success: true,
        error: 'MULTIPLE_ACTIVE_BRANCHES',
        data: { branches: activeBranches }
      };
    }

    // Tek şube varsa
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      branchId: activeBranches[0]?.id
    });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          branchId: activeBranches[0]?.id
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    };
  }

  async refreshToken(token: string) {
    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        permissions: true,
        branch: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      branchId: user.branchId
    });

    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    };
  }

  async logout(refreshToken: string) {
    // In a real application, you might want to blacklist the refresh token
    return true;
  }

  async getCurrentUser(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissions: true,
        branch: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
      branch: user.branch,
      permissions: user.permissions,
    };
  }
}
