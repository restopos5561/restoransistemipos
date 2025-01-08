import { PrismaClient, Recipe, RecipeIngredient } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

export class RecipesService {
  async getAllRecipes(page: number = 1, limit: number = 10, productId?: number) {
    const skip = (page - 1) * limit;
    const where = productId ? { productId } : {};

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          ingredients: true,
        },
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    return {
      recipes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createRecipe(data: { productId: number; ingredients: any[] }): Promise<Recipe> {
    const existingRecipe = await prisma.recipe.findUnique({
      where: { productId: data.productId },
    });

    if (existingRecipe) {
      throw new BadRequestError('Bu ürün için zaten bir reçete mevcut');
    }

    return prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.create({
        data: {
          productId: data.productId,
          ingredients: {
            create: data.ingredients,
          },
        },
        include: {
          ingredients: true,
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return recipe;
    });
  }

  async getRecipeById(id: number): Promise<Recipe | null> {
    return prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: true,
        product: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async updateRecipe(id: number, data: { ingredients: any[] }): Promise<Recipe> {
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: true },
    });

    if (!recipe) {
      throw new BadRequestError('Reçete bulunamadı');
    }

    return prisma.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({
        where: { recipeId: id },
      });

      const updatedRecipe = await tx.recipe.update({
        where: { id },
        data: {
          ingredients: {
            create: data.ingredients.map(({ id, ...ingredient }) => ingredient),
          },
          version: { increment: 1 },
        },
        include: {
          ingredients: true,
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return updatedRecipe;
    });
  }

  async deleteRecipe(id: number): Promise<void> {
    await prisma.recipe.delete({
      where: { id },
    });
  }

  async getRecipeByProductId(productId: number): Promise<Recipe | null> {
    return prisma.recipe.findUnique({
      where: { productId },
      include: {
        ingredients: true,
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
