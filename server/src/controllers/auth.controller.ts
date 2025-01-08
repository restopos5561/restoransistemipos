import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { comparePassword, generateTokens, verifyRefreshToken, generateResetToken, hashPassword } from '../utils/auth.utils';
import { UnauthorizedError } from '../errors/unauthorized-error';
import { BadRequestError } from '../errors/bad-request-error';
import { ForbiddenError } from '../errors/forbidden-error';
import { sendResetPasswordEmail } from '../utils/email.utils';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
    name: string;
    branchId?: number;
  };
}

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          userBranches: {
            include: {
              branch: {
                select: {
                  id: true,
                  name: true,
                  isActive: true,
                  restaurantId: true,
                  restaurant: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!user || !(await comparePassword(password, user.password))) {
        throw new UnauthorizedError('Geçersiz email veya şifre');
      }

      // Aktif şubeleri filtrele
      const activeBranches = user.userBranches
        .filter(ub => ub.branch.isActive)
        .map(ub => ({
          id: ub.branch.id,
          name: ub.branch.name,
          restaurantId: ub.branch.restaurantId,
          restaurant: ub.branch.restaurant
        }));

      // Birden fazla aktif şube varsa
      if (activeBranches.length > 1) {
        return res.json({
          success: true,
          error: 'MULTIPLE_ACTIVE_BRANCHES',
          data: {
            branches: activeBranches
          }
        });
      }

      const selectedBranch = activeBranches[0];
      if (!selectedBranch) {
        throw new UnauthorizedError('Aktif şube bulunamadı');
      }

      // Token'ları oluştur
      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        branchId: selectedBranch.id
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            branchId: selectedBranch.id,
            restaurantId: selectedBranch.restaurantId,
            branch: selectedBranch
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new UnauthorizedError('Oturum bulunamadı');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userBranches: {
            include: {
              branch: {
                select: {
                  id: true,
                  name: true,
                  isActive: true,
                  restaurantId: true,
                  restaurant: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!user) {
        throw new UnauthorizedError('Kullanıcı bulunamadı');
      }

      // Token'dan gelen branchId'yi kullan
      const branchId = req.user?.branchId;
      
      // Kullanıcının bu şubeye erişimi var mı kontrol et
      const userBranch = user.userBranches.find(ub => ub.branch.id === branchId && ub.branch.isActive);
      
      if (!userBranch) {
        throw new UnauthorizedError('Bu şubeye erişim yetkiniz yok');
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          branchId: branchId,
          restaurantId: userBranch.branch.restaurantId,
          branch: {
            id: userBranch.branch.id,
            name: userBranch.branch.name,
            restaurantId: userBranch.branch.restaurantId,
            restaurant: userBranch.branch.restaurant
          }
        }
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error?.message || 'Kullanıcı bilgileri alınamadı',
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const decoded = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new UnauthorizedError('Kullanıcı bulunamadı');
      }

      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        branchId: user.branchId
      });

      res.json({
        success: true,
        data: tokens,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error?.message || 'Token yenileme başarısız',
      });
    }
  }

  async logout(req: Request, res: Response) {
    // İleride token blacklist veya redis implementasyonu eklenebilir
    res.json({
      success: true,
      message: 'Başarıyla çıkış yapıldı',
    });
  }

  async loginWithBranch(req: Request, res: Response) {
    try {
      const { email, password, branchId } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          userBranches: {
            include: {
              branch: {
                select: {
                  id: true,
                  name: true,
                  isActive: true,
                  restaurantId: true,
                  restaurant: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!user || !(await comparePassword(password, user.password))) {
        throw new UnauthorizedError('Geçersiz email veya şifre');
      }

      // Seçilen şubeyi bul
      const selectedBranch = user.userBranches.find(
        ub => ub.branch.id === branchId && ub.branch.isActive
      )?.branch;

      if (!selectedBranch) {
        throw new UnauthorizedError('Geçersiz veya aktif olmayan şube seçimi');
      }

      // Token'ları oluştur
      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        branchId: selectedBranch.id
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            branchId: selectedBranch.id,
            restaurantId: selectedBranch.restaurantId,
            branch: {
              id: selectedBranch.id,
              name: selectedBranch.name,
              restaurantId: selectedBranch.restaurantId,
              restaurant: selectedBranch.restaurant
            }
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      });

    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error?.message || 'Giriş yapılamadı',
      });
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      // Kullanıcıyı bul
      const user = await prisma.user.findUnique({
        where: { email }
      });

      // Güvenlik için, kullanıcı bulunamasa bile aynı mesajı dön
      if (!user) {
        return res.json({
          success: true,
          message: 'Şifre sıfırlama bağlantısı gönderildi'
        });
      }

      // Reset token oluştur
      const resetToken = generateResetToken();
      const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 dakika

      // Kullanıcıyı güncelle
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpires
        }
      });

      // Email gönder
      await sendResetPasswordEmail(user.email, resetToken);

      res.json({
        success: true,
        message: 'Şifre sıfırlama bağlantısı gönderildi'
      });

    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      // Token ile kullanıcıyı bul
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpires: {
            gt: new Date() // Token süresi dolmamış olmalı
          }
        }
      });

      if (!user) {
        throw new BadRequestError('Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.');
      }

      try {
        // Yeni şifreyi hashle
        const hashedPassword = await hashPassword(password);

        // Şifreyi güncelle ve reset token'ları temizle
        await prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpires: null
          }
        });

        res.json({
          success: true,
          message: 'Şifreniz başarıyla güncellendi.'
        });
      } catch (error) {
        next(new Error('Şifre güncelleme işlemi başarısız oldu.'));
      }
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;

      // Email kontrolü
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new BadRequestError('Bu email adresi zaten kullanımda');
      }

      // Şifreyi hashle
      const hashedPassword = await hashPassword(password);

      // Kullanıcıyı oluştur
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN', // İlk kullanıcı ADMIN olsun
          restaurant: {
            create: {
              name: 'Restaurant', // Default restaurant
            }
          }
        }
      });

      // Token'ları oluştur
      const tokens = generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      });

    } catch (error) {
      next(error);
    }
  }
}
