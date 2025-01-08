import { PrismaClient, ProductOption } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

// Interface tanımlamaları
interface CreateOptionInput {
  optionGroupId: number;
  name: string;
  priceAdjustment?: number;
  productId: number;
}

interface UpdateOptionInput {
  name?: string;
  priceAdjustment?: number;
}

interface OptionFilters {
  optionGroupId?: number;
  productId?: number;
  page?: number;
  limit?: number;
}

export class ProductOptionService {
  // Tüm seçenekleri getir (pagination ile)
  async getOptions(filters: OptionFilters) {
    const { optionGroupId, productId, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (optionGroupId) where.optionGroupId = optionGroupId;
    if (productId) where.optionGroup = { productId };

    const [total, items] = await Promise.all([
      prisma.productOption.count({ where }),
      prisma.productOption.findMany({
        where,
        include: {
          optionGroup: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
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

  // Tekil seçenek getir
  async getOptionById(id: number) {
    const option = await prisma.productOption.findUnique({
      where: { id },
      include: {
        optionGroup: true,
      },
    });

    if (!option) {
      throw new BadRequestError('Seçenek bulunamadı');
    }

    return option;
  }

  // Yeni seçenek oluştur
  async createOption(data: CreateOptionInput) {
    // Grup kontrolü
    const optionGroup = await prisma.productOptionGroup.findUnique({
      where: { id: data.optionGroupId },
      include: { product: true },
    });

    if (!optionGroup) {
      throw new BadRequestError('Seçenek grubu bulunamadı');
    }

    // Eğer productId verilmemişse, optionGroup'un productId'sini kullanalım
    if (!data.productId) {
      data.productId = optionGroup.productId;
    }

    // Aynı isimde başka seçenek var mı kontrolü
    const existingOption = await prisma.productOption.findFirst({
      where: {
        optionGroupId: data.optionGroupId,
        name: data.name,
      },
    });

    if (existingOption) {
      throw new BadRequestError('Bu isimde bir seçenek zaten mevcut');
    }

    return prisma.productOption.create({
      data,
      include: {
        optionGroup: true,
      },
    });
  }

  // Seçenek güncelle
  async updateOption(id: number, data: UpdateOptionInput) {
    const option = await this.getOptionById(id);

    // İsim değişiyorsa ve aynı isimde başka seçenek varsa hata ver
    if (data.name && data.name !== option.name) {
      const existingOption = await prisma.productOption.findFirst({
        where: {
          optionGroupId: option.optionGroupId,
          name: data.name,
          id: { not: id },
        },
      });

      if (existingOption) {
        throw new BadRequestError('Bu isimde bir seçenek zaten mevcut');
      }
    }

    return prisma.productOption.update({
      where: { id },
      data,
      include: {
        optionGroup: true,
      },
    });
  }

  // Seçenek sil
  async deleteOption(id: number) {
    await this.getOptionById(id);
    await prisma.productOption.delete({ where: { id } });
    return true;
  }

  // Gruba ait seçenekleri getir
  async getOptionsByGroupId(groupId: number) {
    const group = await prisma.productOptionGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new BadRequestError('Seçenek grubu bulunamadı');
    }

    return prisma.productOption.findMany({
      where: { optionGroupId: groupId },
    });
  }
}
