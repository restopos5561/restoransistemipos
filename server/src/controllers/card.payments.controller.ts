import { Request, Response } from 'express';
import { CardPaymentsService } from '../services/card.payments.service';
import { BadRequestError } from '../errors/bad-request-error';

export class CardPaymentsController {
  private cardPaymentsService: CardPaymentsService;

  constructor() {
    this.cardPaymentsService = new CardPaymentsService();
  }

  getCardPayments = async (req: Request, res: Response) => {
    try {
      const filters = {
        paymentId: req.query.paymentId ? Number(req.query.paymentId) : undefined,
        orderId: req.query.orderId ? Number(req.query.orderId) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        cardType: req.query.cardType as string,
        page: Math.max(1, Number(req.query.page) || 1),
        limit: Math.max(1, Number(req.query.limit) || 10),
      };

      if (filters.paymentId && isNaN(filters.paymentId)) {
        throw new BadRequestError('Geçersiz ödeme ID');
      }
      if (filters.orderId && isNaN(filters.orderId)) {
        throw new BadRequestError('Geçersiz sipariş ID');
      }

      const result = await this.cardPaymentsService.getCardPayments(filters);

      res.json({
        success: true,
        data: {
          cardPayments: result.cardPayments,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError('Kart ödemeleri getirilemedi');
    }
  };

  createCardPayment = async (req: Request, res: Response) => {
    try {
      const cardPayment = await this.cardPaymentsService.createCardPayment(req.body);
      res.status(201).json({ success: true, data: cardPayment });
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError('Kart ödemesi oluşturulamadı');
    }
  };

  getCardPaymentById = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const cardPayment = await this.cardPaymentsService.getCardPaymentById(id);
      res.json({ success: true, data: cardPayment });
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError('Kart ödemesi bulunamadı');
    }
  };

  getCardPaymentByPaymentId = async (req: Request, res: Response) => {
    try {
      const paymentId = Number(req.params.paymentId);
      const cardPayment = await this.cardPaymentsService.getCardPaymentByPaymentId(paymentId);
      res.json({ success: true, data: cardPayment });
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError('Kart ödemesi bulunamadı');
    }
  };
}
