import api from './api';
import { API_ENDPOINTS } from '../config/constants';

interface RecipeIngredient {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  waste: number;
}

interface Recipe {
  id: number;
  productId: number;
  version: number;
  ingredients: RecipeIngredient[];
  isActive: boolean;
}

const recipeService = {
  // Reçete işlemleri
  getAllRecipes: async (params?: { page?: number; limit?: number; productId?: number }) => {
    const response = await api.get(API_ENDPOINTS.RECIPES.LIST, { params });
    return response.data;
  },

  getRecipeById: async (id: number) => {
    const response = await api.get(API_ENDPOINTS.RECIPES.DETAIL(id.toString()));
    return response.data;
  },

  getRecipeByProductId: async (productId: number) => {
    const response = await api.get(API_ENDPOINTS.RECIPES.BY_PRODUCT(productId.toString()));
    return response.data;
  },

  createRecipe: async (data: { productId: number; ingredients: RecipeIngredient[] }) => {
    const response = await api.post(API_ENDPOINTS.RECIPES.CREATE, data);
    return response.data;
  },

  updateRecipe: async (id: number, data: { ingredients: RecipeIngredient[] }) => {
    const response = await api.put(API_ENDPOINTS.RECIPES.UPDATE(id.toString()), data);
    return response.data;
  },

  deleteRecipe: async (id: number) => {
    const response = await api.delete(API_ENDPOINTS.RECIPES.DELETE(id.toString()));
    return response.data;
  },

  calculateRecipeCost: async (id: number) => {
    const response = await api.get(API_ENDPOINTS.RECIPES.CALCULATE_COST(id.toString()));
    return response.data;
  },

  getRecipeVersions: async (id: number) => {
    const response = await api.get(API_ENDPOINTS.RECIPES.VERSIONS(id.toString()));
    return response.data;
  },

  duplicateRecipe: async (id: number, newProductId: number) => {
    const response = await api.post(API_ENDPOINTS.RECIPES.DUPLICATE(id.toString()), { newProductId });
    return response.data;
  },

  bulkUpdateIngredients: async (id: number, ingredients: RecipeIngredient[]) => {
    const response = await api.patch(API_ENDPOINTS.RECIPES.BULK_UPDATE_INGREDIENTS(id.toString()), { ingredients });
    return response.data;
  },

  compareRecipes: async (recipeId1: number, recipeId2: number) => {
    const response = await api.get(API_ENDPOINTS.RECIPES.COMPARE, {
      params: { recipeId1, recipeId2 }
    });
    return response.data;
  }
};

export default recipeService; 