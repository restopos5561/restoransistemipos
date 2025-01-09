import { PrismaClient, ProductOptionGroup } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

// Interface tanımlamaları
interface CreateOptionGroupInput {
  productId: number;
  name: string;
  isRequired: boolean;
  minQuantity?: number;
  maxQuantity?: number;
}

interface UpdateOptionGroupInput {
  name?: string;
  isRequired?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
}

interface OptionGroupFilters {
  productId?: number;
  restaurantId?: number;
  page?: number;
  limit?: number;
}

export class ProductOptionGroupService {
  // Tüm seçenek gruplarını getir (pagination ile)
  async getOptionGroups(filters: OptionGroupFilters) {
    const { productId, restaurantId, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) where.productId = productId;
    if (restaurantId) where.product = { restaurantId };

    const [total, items] = await Promise.all([
      prisma.productOptionGroup.count({ where }),
      prisma.productOptionGroup.findMany({
        where,
        include: {
          options: true,
          product: {
            select: {
              name: true,
              restaurantId: true,
            },
          },
        },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  // Tekil seçenek grubu getir
  async getOptionGroupById(id: number) {
    const optionGroup = await prisma.productOptionGroup.findUnique({
      where: { id },
      include: {
        options: true,
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!optionGroup) {
      throw new BadRequestError('Seçenek grubu bulunamadı');
    }

    return optionGroup;
  }

  // Yeni seçenek grubu oluştur
  async createOptionGroup(data: CreateOptionGroupInput) {
    // Ürün kontrolü
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new BadRequestError('Ürün bulunamadı');
    }

    // Aynı isimde başka grup var mı kontrolü
    const existingGroup = await prisma.productOptionGroup.findFirst({
      where: {
        productId: data.productId,
        name: data.name,
      },
    });

    if (existingGroup) {
      throw new BadRequestError('Bu isimde bir seçenek grubu zaten mevcut');
    }

    return prisma.productOptionGroup.create({
      data,
      include: {
        options: true,
      },
    });
  }

  // Seçenek grubunu güncelle
  async updateOptionGroup(id: number, data: UpdateOptionGroupInput) {
    const optionGroup = await this.getOptionGroupById(id);

    // İsim değişiyorsa ve aynı isimde başka grup varsa hata ver
    if (data.name && data.name !== optionGroup.name) {
      const existingGroup = await prisma.productOptionGroup.findFirst({
        where: {
          productId: optionGroup.productId,
          name: data.name,
          id: { not: id },
        },
      });

      if (existingGroup) {
        throw new BadRequestError('Bu isimde bir seçenek grubu zaten mevcut');
      }
    }

    return prisma.productOptionGroup.update({
      where: { id },
      data,
      include: {
        options: true,
      },
    });
  }

  // Seçenek grubunu sil
  async deleteOptionGroup(id: number) {
    try {
      const optionGroup = await this.getOptionGroupById(id);

      if (!optionGroup) {
        throw new BadRequestError('Seçenek grubu bulunamadı');
      }

      // Önce seçenekleri sil
      await prisma.productOption.deleteMany({
        where: { optionGroupId: id },
      });

      // Sonra grubu sil
      await prisma.productOptionGroup.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Seçenek grubu başarıyla silindi'
      };
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError('Seçenek grubu silinirken bir hata oluştu');
    }
  }

  // Ürüne ait seçenek gruplarını getir
  async getOptionGroupsByProductId(productId: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestError('Ürün bulunamadı');
    }

    return prisma.productOptionGroup.findMany({
      where: { productId },
      include: {
        options: true,
      },
    });
  }
}
