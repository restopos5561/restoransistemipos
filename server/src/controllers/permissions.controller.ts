import { Request, Response } from 'express';
import { PermissionsService } from '../services/permissions.service';
import { UserPermissionsService } from '../services/user-permissions.service';

const permissionsService = new PermissionsService();
const userPermissionsService = new UserPermissionsService();

export class PermissionsController {
  // İzin işlemleri
  async getAllPermissions(req: Request, res: Response) {
    try {
      const permissions = await permissionsService.getAllPermissions();
      res.json({ success: true, data: permissions });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error?.message || 'Bir hata oluştu',
      });
    }
  }

  async getPermissionById(req: Request, res: Response) {
    try {
      const permission = await permissionsService.getPermissionById(Number(req.params.id));
      res.json({ success: true, data: permission });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error?.message || 'İzin bulunamadı',
      });
    }
  }

  async createPermission(req: Request, res: Response) {
    try {
      const permission = await permissionsService.createPermission(req.body);
      res.status(201).json({ success: true, data: permission });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error?.message || 'İzin oluşturulamadı',
      });
    }
  }

  async updatePermission(req: Request, res: Response) {
    try {
      const permission = await permissionsService.updatePermission(Number(req.params.id), req.body);
      res.json({ success: true, data: permission });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error?.message || 'İzin güncellenemedi',
      });
    }
  }

  async deletePermission(req: Request, res: Response) {
    try {
      await permissionsService.deletePermission(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error?.message || 'İzin silinemedi',
      });
    }
  }

  // Kullanıcı izinleri
  async getUserPermissions(req: Request, res: Response) {
    try {
      const permissions = await userPermissionsService.getUserPermissions(
        Number(req.params.userId)
      );
      res.json({
        success: true,
        data: permissions,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error?.message || 'Kullanıcı izinleri bulunamadı',
      });
    }
  }

  async updateUserPermissions(req: Request, res: Response) {
    try {
      const permissions = await userPermissionsService.updateUserPermissions(
        Number(req.params.userId),
        req.body.permissions
      );
      res.json({ success: true, data: permissions });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error?.message || 'İzinler güncellenemedi',
      });
    }
  }

  async deleteUserPermission(req: Request, res: Response) {
    try {
      await userPermissionsService.deleteUserPermission(
        Number(req.params.userId),
        Number(req.params.permissionId)
      );
      res.status(204).send();
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error?.message || 'İzin silinemedi',
      });
    }
  }
}
