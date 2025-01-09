import { PrismaClient, Product } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';
import { ProductNotFoundError } from '../errors/product-errors';

const prisma = new PrismaClient();

interface CreateProductInput {
  restaurantId: number;
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isActive?: boolean;
  preparationTime?: number;
  stockTracking?: boolean;
  stockQuantity?: number;
}

interface UpdateProductInput {
  categoryId?: number;
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  isActive?: boolean;
  preparationTime?: number;
  stockTracking?: boolean;
  stockQuantity?: number;
}

interface ProductVariantInput {
  name: string;
  value: string;
  priceAdjustment?: number;
}

interface ProductOptionGroupInput {
  name: string;
  isRequired: boolean;
  minQuantity: number;
  maxQuantity: number;
}

interface ProductOptionInput {
  optionGroupId: number;
  name: string;
  priceAdjustment: number;
}

export class ProductsService {
  async getProducts(filters: {
    restaurantId?: number;
    categoryId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where = {
      ...(filters.restaurantId && { restaurantId: filters.restaurantId }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.search && {
        name: {
          contains: filters.search,
          mode: 'insensitive' as const,
        },
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
        include: {
          category: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async getProductById(id: number): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        stocks: true,
      },
    });

    if (!product) {
      throw new ProductNotFoundError(id);
    }

    return product;
  }

  async createProduct(data: CreateProductInput): Promise<Product> {
    // Aynı restoranda aynı isimde ürün var mı kontrol et
    const existingProduct = await prisma.product.findFirst({
      where: {
        restaurantId: data.restaurantId,
        name: data.name,
      },
    });

    if (existingProduct) {
      throw new BadRequestError('Bu isimde bir ürün zaten mevcut');
    }

    // Kategori mevcut ve doğru restoran'a ait mi kontrol et
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        restaurantId: data.restaurantId,
      },
    });

    if (!category) {
      throw new BadRequestError('Geçersiz kategori');
    }

    // Stok takibi isteniyorsa stock objesi oluştur
    const productData: any = {
      name: data.name,
      description: data.description,
      price: data.price,
      restaurantId: data.restaurantId,
      categoryId: data.categoryId,
      preparationTime: data.preparationTime,
      stockTracking: data.stockTracking,
    };

    // Eğer stok takibi isteniyorsa stock objesi ekle
    if (data.stockTracking && data.stockQuantity !== undefined) {
      // Restoranın tüm şubelerini bul
      const branches = await prisma.branch.findMany({
        where: { restaurantId: data.restaurantId },
      });

      // Her şube için stok kaydı oluştur
      productData.stocks = {
        create: branches.map((branch) => ({
          quantity: data.stockQuantity,
          branchId: branch.id,
        })),
      };
    }

    return prisma.product.create({
      data: productData,
      include: {
        category: true,
        stocks: true,
      },
    });
  }

  async updateProduct(id: number, data: UpdateProductInput): Promise<Product> {
    const product = await this.getProductById(id);

    // İsim değişiyorsa, aynı restoranda aynı isimde başka ürün var mı kontrol et
    if (data.name && data.name !== product.name) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          restaurantId: product.restaurantId,
          name: data.name,
          id: { not: id },
        },
      });

      if (existingProduct) {
        throw new BadRequestError('Bu isimde bir ürün zaten mevcut');
      }
    }

    // Kategori değişiyorsa, yeni kategori mevcut ve doğru restoran'a ait mi kontrol et
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          restaurantId: product.restaurantId,
        },
      });

      if (!category) {
        throw new BadRequestError('Geçersiz kategori');
      }
    }

    // Fiyat değişikliği varsa önce fiyat geçmişi kaydı oluştur
    if (data.price !== undefined && data.price !== product.price) {
      await prisma.priceHistory.create({
        data: {
          productId: id,
          oldPrice: product.price,
          newPrice: data.price,
          startDate: new Date(),
        },
      });
    }

    const updateData: any = {
      name: data.name,
      description: data.description,
      price: data.price,
      preparationTime: data.preparationTime,
      isActive: data.isActive,
      stockTracking: data.stockTracking,
      ...(data.categoryId && {
        category: {
          connect: {
            id: data.categoryId
          }
        }
      })
    };

    // Stok güncelleme işlemi
    if (data.stockTracking !== undefined) {
      if (data.stockTracking) {
        // Restoranın tüm şubelerini bul
        const branches = await prisma.branch.findMany({
          where: { restaurantId: product.restaurantId },
        });

        // Her şube için stok kaydı oluştur
        updateData.stocks = {
          deleteMany: {},
          create: branches.map((branch) => ({
            quantity: data.stockQuantity || 0,
            branchId: branch.id,
          })),
        };
      } else {
        // Stok takibi kapatılıyorsa stok kaydını sil
        updateData.stocks = {
          deleteMany: {},
        };
      }
    } else if (data.stockQuantity !== undefined && product.stockTracking) {
      // Sadece stok miktarı güncelleniyorsa
      updateData.stocks = {
        updateMany: {
          where: { productId: id },
          data: { quantity: data.stockQuantity }
        }
      };
    }

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        stocks: true,
        category: true,
      },
    });
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.getProductById(id);

    // Aktif siparişlerde bu ürün var mı kontrol edilebilir
    // Bu kontrol sipariş modeli oluşturulduğunda eklenecek

    await prisma.product.delete({ where: { id } });
  }

  async updateProductPrice(id: number, newPrice: number): Promise<Product> {
    const product = await this.getProductById(id);

    return prisma.$transaction(async (tx) => {
      // Fiyat geçmişi oluştur
      await tx.priceHistory.create({
        data: {
          productId: id,
          oldPrice: product.price,
          newPrice: newPrice,
          startDate: new Date(),
        },
      });

      // Ürün fiyatını güncelle
      return tx.product.update({
        where: { id },
        data: { price: newPrice },
        include: {
          category: true,
          priceHistory: {
            orderBy: {
              startDate: 'desc',
            },
            take: 1,
          },
        },
      });
    });
  }

  async getProductPriceHistory(id: number) {
    await this.getProductById(id);

    const priceHistory = await prisma.priceHistory.findMany({
      where: { productId: id },
      orderBy: {
        startDate: 'desc',
      },
      select: {
        id: true,
        productId: true,
        oldPrice: true,
        newPrice: true,
        startDate: true,
      }
    });

    return {
      success: true,
      data: priceHistory
    };
  }

  // Varyant metodları
  async getProductVariants(productId: number) {
    await this.getProductById(productId);

    const variants = await prisma.productVariant.findMany({
      where: { productId },
    });

    return {
      success: true,
      data: variants
    };
  }

  async addProductVariant(productId: number, data: ProductVariantInput) {
    await this.getProductById(productId);

    const variant = await prisma.productVariant.create({
      data: {
        ...data,
        productId,
      },
    });

    return {
      success: true,
      data: variant
    };
  }

  async updateProductVariant(productId: number, variantId: number, data: ProductVariantInput) {
    await this.getProductById(productId);

    const variant = await prisma.productVariant.update({
      where: {
        id: variantId,
        productId,
      },
      data,
    });

    return {
      success: true,
      data: variant
    };
  }

  async deleteProductVariant(productId: number, variantId: number) {
    await this.getProductById(productId);

    await prisma.productVariant.delete({
      where: {
        id: variantId,
        productId,
      },
    });

    return {
      success: true,
      data: null
    };
  }

  // Seçenek grupları ve seçenekler metodları
  async getProductOptions(productId: number) {
    await this.getProductById(productId);

    return prisma.productOptionGroup.findMany({
      where: { productId },
      include: {
        options: true,
      },
    });
  }

  async addProductOptionGroup(productId: number, data: ProductOptionGroupInput) {
    await this.getProductById(productId);

    return prisma.productOptionGroup.create({
      data: {
        ...data,
        productId,
      },
    });
  }

  async addProductOption(productId: number, data: ProductOptionInput) {
    await this.getProductById(productId);

    // OptionGroup'un bu ürüne ait olduğunu kontrol et
    const optionGroup = await prisma.productOptionGroup.findFirst({
      where: {
        id: data.optionGroupId,
        productId,
      },
    });

    if (!optionGroup) {
      throw new BadRequestError('Geçersiz seçenek grubu');
    }

    return prisma.productOption.create({
      data: {
        name: data.name,
        priceAdjustment: data.priceAdjustment,
        optionGroupId: data.optionGroupId,
        productId: productId,
      },
    });
  }

  async updateProductOption(
    productId: number,
    optionId: number,
    data: Partial<ProductOptionInput>
  ) {
    await this.getProductById(productId);

    // Seçeneğin bu ürüne ait olduğunu kontrol et
    const option = await prisma.productOption.findFirst({
      where: {
        id: optionId,
        optionGroup: {
          productId,
        },
      },
    });

    if (!option) {
      throw new BadRequestError('Geçersiz seçenek');
    }

    return prisma.productOption.update({
      where: { id: optionId },
      data,
    });
  }

  async deleteProductOption(productId: number, optionId: number) {
    await this.getProductById(productId);

    // Seçeneğin bu ürüne ait olduğunu kontrol et
    const option = await prisma.productOption.findFirst({
      where: {
        id: optionId,
        optionGroup: {
          productId,
        },
      },
    });

    if (!option) {
      throw new BadRequestError('Geçersiz seçenek');
    }

    await prisma.productOption.delete({
      where: { id: optionId },
    });
  }
}
