import { PrismaClient, Category } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';
import { CategoryNotFoundError } from '../errors/category-errors';

const prisma = new PrismaClient();

interface CreateCategoryInput {
  restaurantId: number;
  name: string;
  description?: string;
  isActive?: boolean;
}

interface UpdateCategoryInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export class CategoriesService {
  async getCategories(filters: { restaurantId?: number; isActive?: boolean; search?: string }) {
    const where: any = {
      restaurantId: filters.restaurantId,
    };

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    return prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  async getCategoryById(id: number): Promise<Category> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new CategoryNotFoundError(id);
    }

    return category;
  }

  async createCategory(data: CreateCategoryInput): Promise<Category> {
    // Aynı isimde kategori var mı kontrol et
    const existingCategory = await prisma.category.findFirst({
      where: {
        restaurantId: data.restaurantId,
        name: data.name,
      },
    });

    if (existingCategory) {
      throw new BadRequestError('Bu isimde bir kategori zaten mevcut');
    }

    return prisma.category.create({
      data,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  async updateCategory(id: number, data: UpdateCategoryInput): Promise<Category> {
    const category = await this.getCategoryById(id);

    // İsim değişiyorsa, aynı isimde başka kategori var mı kontrol et
    if (data.name && data.name !== category.name) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          restaurantId: category.restaurantId,
          name: data.name,
          id: { not: id },
        },
      });

      if (existingCategory) {
        throw new BadRequestError('Bu isimde bir kategori zaten mevcut');
      }
    }

    return prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  async deleteCategory(id: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Önce kategorideki ürünlerin stok geçmişini sil
      await tx.stockHistory.deleteMany({
        where: {
          stock: {
            product: {
              categoryId: id,
            },
          },
        },
      });

      // Sonra ürünlerin stoklarını sil
      await tx.stock.deleteMany({
        where: {
          product: {
            categoryId: id,
          },
        },
      });

      // Ürün-tedarikçi ilişkilerini sil
      await tx.productSupplier.deleteMany({
        where: {
          product: {
            categoryId: id,
          },
        },
      });

      // Satın alma siparişi ürünlerini sil
      await tx.purchaseOrderItem.deleteMany({
        where: {
          product: {
            categoryId: id,
          },
        },
      });

      // Sipariş öğelerini sil
      await tx.orderItem.deleteMany({
        where: {
          product: {
            categoryId: id,
          },
        },
      });

      // Kategorideki ürünleri sil
      await tx.product.deleteMany({
        where: { categoryId: id },
      });

      // En son kategoriyi sil
      await tx.category.delete({
        where: { id },
      });
    });
  }
}
