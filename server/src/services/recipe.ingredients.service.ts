import { prisma } from '../config/database';
import { BadRequestError } from '../errors/bad-request-error';
import { Prisma } from '@prisma/client';

export class RecipeIngredientsService {
  async getRecipeIngredients(filters: {
    recipeId?: number;
    productId?: number;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.RecipeIngredientWhereInput = {
      ...(filters.recipeId && { recipeId: filters.recipeId }),
      ...(filters.productId && {
        recipe: {
          productId: filters.productId,
        },
      }),
    };

    const [ingredients, total] = await Promise.all([
      prisma.recipeIngredient.findMany({
        where,
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
        select: {
          id: true,
          recipeId: true,
          name: true,
          quantity: true,
        },
      }),
      prisma.recipeIngredient.count({ where }),
    ]);

    return {
      recipeIngredients: ingredients,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async getRecipeIngredientById(id: number) {
    const ingredient = await prisma.recipeIngredient.findUnique({
      where: { id },
      select: {
        id: true,
        recipeId: true,
        name: true,
        quantity: true,
      },
    });

    if (!ingredient) {
      throw new BadRequestError('Reçete içeriği bulunamadı');
    }

    return ingredient;
  }

  async createRecipeIngredient(data: { recipeId: number; name: string; quantity: string }) {
    const recipe = await prisma.recipe.findUnique({
      where: { id: data.recipeId },
    });

    if (!recipe) {
      throw new BadRequestError('Reçete bulunamadı');
    }

    const numericQuantity = parseFloat(data.quantity.split(' ')[0]);
    const unit = data.quantity.split(' ')[1] || 'adet';

    return prisma.recipeIngredient.create({
      data: {
        recipeId: data.recipeId,
        name: data.name,
        quantity: numericQuantity,
        unit: unit,
        cost: 0,
        waste: 0,
      },
      select: {
        id: true,
        recipeId: true,
        name: true,
        quantity: true,
      },
    });
  }

  async updateRecipeIngredient(
    id: number,
    data: {
      name?: string;
      quantity?: string;
    }
  ) {
    await this.getRecipeIngredientById(id);

    const updateData: any = {};

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.quantity) {
      const [amount] = data.quantity.split(' ');
      updateData.quantity = parseFloat(amount);
      updateData.unit = data.quantity.split(' ')[1] || 'adet';
    }

    return prisma.recipeIngredient.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        recipeId: true,
        name: true,
        quantity: true,
        unit: true,
      },
    });
  }

  async deleteRecipeIngredient(id: number) {
    await this.getRecipeIngredientById(id);
    return prisma.recipeIngredient.delete({
      where: { id },
    });
  }

  async getIngredientsByRecipeId(recipeId: number) {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new BadRequestError('Reçete bulunamadı');
    }

    return prisma.recipeIngredient.findMany({
      where: { recipeId },
      select: {
        id: true,
        recipeId: true,
        name: true,
        quantity: true,
      },
    });
  }
}
