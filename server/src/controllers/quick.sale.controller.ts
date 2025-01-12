import { Request, Response } from 'express';
import { QuickSaleService } from '../services/quick.sale.service';
import { validateRequest } from '../middleware/validate-request';
import { z } from 'zod';

const quickSaleService = new QuickSaleService();

// Validation schemas
const QuickSaleItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  note: z.string().optional()
});

const QuickSaleSchema = z.object({
  body: z.object({
    branchId: z.number(),
    restaurantId: z.number(),
    items: z.array(QuickSaleItemSchema).min(1),
    customerId: z.number().optional(),
    paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'MEAL_CARD']),
    receivedAmount: z.number().optional(),
    cardPayment: z.object({
      cardType: z.string(),
      lastFourDigits: z.string(),
      transactionId: z.string().optional()
    }).optional()
  })
});

const SearchProductsSchema = z.object({
  query: z.object({
    q: z.string(),
    branchId: z.string().transform(Number)
  })
});

const ValidateBarcodeSchema = z.object({
  params: z.object({
    barcode: z.string()
  }),
  query: z.object({
    branchId: z.string().transform(Number)
  })
});

export class QuickSaleController {
  async processQuickSale(req: Request, res: Response) {
    const result = await quickSaleService.processQuickSale(req.body);
    res.status(201).json(result);
  }

  async searchProducts(req: Request, res: Response) {
    const { q, branchId } = req.query;
    const products = await quickSaleService.searchProducts(q as string, Number(branchId));
    res.json(products);
  }

  async getPopularProducts(req: Request, res: Response) {
    const { branchId, categoryId, showPopularOnly, limit } = req.query;
    console.log('Debug - Controller categoryId:', categoryId);
    console.log('Debug - Controller showPopularOnly:', showPopularOnly);
    
    const products = await quickSaleService.getPopularProducts(
      Number(branchId),
      categoryId ? Number(categoryId) : null,
      showPopularOnly === 'true',
      limit ? Number(limit) : undefined
    );
    res.json(products);
  }

  async validateBarcode(req: Request, res: Response) {
    const { barcode } = req.params;
    const { branchId } = req.query;
    const product = await quickSaleService.validateBarcode(barcode);
    res.json(product);
  }
}

// Middleware'ler ile birlikte route handler'lar
export const quickSaleHandlers = {
  processQuickSale: [
    validateRequest(QuickSaleSchema),
    (req: Request, res: Response) => new QuickSaleController().processQuickSale(req, res)
  ],
  searchProducts: [
    validateRequest(SearchProductsSchema),
    (req: Request, res: Response) => new QuickSaleController().searchProducts(req, res)
  ],
  getPopularProducts: [
    (req: Request, res: Response) => new QuickSaleController().getPopularProducts(req, res)
  ],
  validateBarcode: [
    validateRequest(ValidateBarcodeSchema),
    (req: Request, res: Response) => new QuickSaleController().validateBarcode(req, res)
  ]
}; 