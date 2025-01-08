import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

export class RecipesController {
  async getAllRecipes(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const productId = req.query.productId ? Number(req.query.productId) : undefined;

    const skip = (page - 1) * limit;
    const where = productId ? { productId } : {};

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true },
          },
          ingredients: true,
        },
        skip,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        recipes,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  async createRecipe(req: Request, res: Response) {
    const { productId, ingredients } = req.body;

    const existingRecipe = await prisma.recipe.findUnique({
      where: { productId },
    });

    if (existingRecipe) {
      throw new BadRequestError('Bu ürün için zaten bir reçete mevcut');
    }

    const recipe = await prisma.$transaction(async (tx) => {
      return tx.recipe.create({
        data: {
          productId,
          ingredients: {
            create: ingredients,
          },
        },
        include: {
          ingredients: true,
          product: {
            select: { id: true, name: true },
          },
        },
      });
    });

    res.status(201).json({ success: true, data: recipe });
  }

  async getRecipeById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        throw new BadRequestError('Geçersiz ID formatı');
      }

      const recipe = await prisma.recipe.findFirst({
        where: {
          id: id,
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

      if (!recipe) {
        throw new BadRequestError('Reçete bulunamadı');
      }

      res.json({
        success: true,
        data: recipe,
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError('Reçete getirme işlemi başarısız oldu');
    }
  }

  async updateRecipe(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { ingredients } = req.body;

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!existingRecipe) {
      throw new BadRequestError('Reçete bulunamadı');
    }

    const recipe = await prisma.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({
        where: { recipeId: id },
      });

      return tx.recipe.update({
        where: { id },
        data: {
          ingredients: {
            create: ingredients.map((ingredient: any) => {
              const { name, quantity, unit, cost, waste } = ingredient;
              return {
                name,
                quantity,
                unit,
                cost,
                waste,
              };
            }),
          },
          version: {
            increment: 1,
          },
        },
        include: {
          ingredients: true,
          product: {
            select: { id: true, name: true },
          },
        },
      });
    });

    res.json({ success: true, data: recipe });
  }

  async deleteRecipe(req: Request, res: Response) {
    const id = Number(req.params.id);
    await prisma.recipe.delete({ where: { id } });
    res.status(204).send();
  }

  async getRecipeByProductId(req: Request, res: Response) {
    const productId = Number(req.params.productId);
    const recipe = await prisma.recipe.findUnique({
      where: { productId },
      include: {
        ingredients: true,
        product: {
          select: { id: true, name: true },
        },
      },
    });

    if (!recipe) {
      throw new BadRequestError('Reçete bulunamadı');
    }

    res.json({ success: true, data: recipe });
  }

  async duplicateRecipe(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { newProductId } = req.body;

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: true },
    });

    if (!existingRecipe) {
      throw new BadRequestError('Kaynak reçete bulunamadı');
    }

    const recipe = await prisma.$transaction(async (tx) => {
      return tx.recipe.create({
        data: {
          productId: newProductId,
          ingredients: {
            create: existingRecipe.ingredients.map(({ id, recipeId, ...ingredient }) => ingredient),
          },
        },
        include: {
          ingredients: true,
          product: {
            select: { id: true, name: true },
          },
        },
      });
    });

    res.status(201).json({ success: true, data: recipe });
  }

  async bulkUpdateIngredients(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { ingredients } = req.body;

    const recipe = await prisma.$transaction(async (tx) => {
      const updates = ingredients.map((ingredient: any) =>
        tx.recipeIngredient.update({
          where: { id: ingredient.id },
          data: {
            quantity: ingredient.quantity,
            cost: ingredient.cost,
            waste: ingredient.waste,
          },
        })
      );

      await Promise.all(updates);

      return tx.recipe.findUnique({
        where: { id },
        include: {
          ingredients: true,
          product: {
            select: { id: true, name: true },
          },
        },
      });
    });

    res.json({ success: true, data: recipe });
  }

  async calculateRecipeCost(req: Request, res: Response) {
    const id = Number(req.params.id);

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: true,
        product: {
          select: { id: true, name: true },
        },
      },
    });

    if (!recipe) {
      throw new BadRequestError('Reçete bulunamadı');
    }

    const totalCost = recipe.ingredients.reduce((sum, ingredient) => {
      const quantity = Number(ingredient.quantity);
      const cost = Number(ingredient.cost);
      const waste = Number(ingredient.waste);

      const ingredientCost = cost * quantity;
      const wasteAmount = ingredientCost * (waste / 100);

      return sum + ingredientCost + wasteAmount;
    }, 0);

    res.json({
      success: true,
      data: {
        recipeId: recipe.id,
        productName: recipe.product.name,
        ingredients: recipe.ingredients.map((ing) => ({
          name: ing.name,
          quantity: Number(ing.quantity),
          cost: Number(ing.cost),
          waste: Number(ing.waste),
          totalCost: Number(ing.cost) * Number(ing.quantity) * (1 + Number(ing.waste) / 100),
        })),
        totalCost: Number(totalCost.toFixed(2)),
      },
    });
  }

  async getRecipeVersionHistory(req: Request, res: Response) {
    const id = Number(req.params.id);

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: {
        id: true,
        version: true,
        product: {
          select: { name: true },
        },
        ingredients: {
          orderBy: { id: 'asc' },
        },
        updatedAt: true,
      },
    });

    if (!recipe) {
      throw new BadRequestError('Reçete bulunamadı');
    }

    res.json({
      success: true,
      data: {
        recipeId: recipe.id,
        productName: recipe.product.name,
        currentVersion: recipe.version,
        lastUpdated: recipe.updatedAt,
        ingredients: recipe.ingredients,
      },
    });
  }

  async compareRecipes(req: Request, res: Response) {
    try {
      const recipeId1 = Number(req.query.recipeId1);
      const recipeId2 = Number(req.query.recipeId2);

      if (isNaN(recipeId1) || isNaN(recipeId2)) {
        throw new BadRequestError('Geçersiz reçete ID formatı');
      }

      const [recipe1, recipe2] = await Promise.all([
        prisma.recipe.findFirst({
          where: { id: recipeId1 },
          include: {
            ingredients: true,
            product: { select: { name: true } },
          },
        }),
        prisma.recipe.findFirst({
          where: { id: recipeId2 },
          include: {
            ingredients: true,
            product: { select: { name: true } },
          },
        }),
      ]);

      if (!recipe1 || !recipe2) {
        throw new BadRequestError('Bir veya iki reçete bulunamadı');
      }

      // İçerikleri karşılaştır
      const comparison = {
        recipe1: {
          id: recipe1.id,
          productName: recipe1.product.name,
          ingredients: recipe1.ingredients,
        },
        recipe2: {
          id: recipe2.id,
          productName: recipe2.product.name,
          ingredients: recipe2.ingredients,
        },
        differences: {
          added: recipe2.ingredients.filter(
            (ing2) => !recipe1.ingredients.some((ing1) => ing1.name === ing2.name)
          ),
          removed: recipe1.ingredients.filter(
            (ing1) => !recipe2.ingredients.some((ing2) => ing2.name === ing1.name)
          ),
          modified: recipe1.ingredients
            .filter((ing1) =>
              recipe2.ingredients.some(
                (ing2) =>
                  ing2.name === ing1.name &&
                  (ing2.quantity !== ing1.quantity ||
                    ing2.unit !== ing1.unit ||
                    ing2.cost !== ing1.cost ||
                    ing2.waste !== ing1.waste)
              )
            )
            .map((ing1) => {
              const ing2 = recipe2.ingredients.find((i) => i.name === ing1.name);
              return {
                name: ing1.name,
                recipe1: ing1,
                recipe2: ing2,
              };
            }),
        },
      };

      res.json({
        success: true,
        data: comparison,
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError('Reçete karşılaştırma işlemi başarısız oldu');
    }
  }
}
