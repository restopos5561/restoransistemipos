import { Request, Response } from 'express';
import { ReservationsService } from '../services/reservations.service';
import {
  CreateReservationInput,
  UpdateReservationInput,
  UpdateReservationStatusInput,
} from '../schemas/reservation.schema';
import { ReservationStatus } from '@prisma/client';
import { BadRequestError } from '../errors/common-errors';

export class ReservationsController {
  private reservationsService: ReservationsService;

  constructor() {
    this.reservationsService = new ReservationsService();
  }

  async createReservation(req: Request, res: Response) {
    const data: CreateReservationInput = req.body;
    const reservation = await this.reservationsService.createReservation(data);
    res.status(201).json({ success: true, data: reservation });
  }

  async getReservationById(req: Request, res: Response) {
    const { id } = req.params;
    const reservation = await this.reservationsService.getReservationById(Number(id));
    res.json({ success: true, data: reservation });
  }

  async updateReservation(req: Request, res: Response) {
    const { id } = req.params;
    const data: UpdateReservationInput = req.body;
    const reservation = await this.reservationsService.updateReservation(Number(id), data);
    res.json({ success: true, data: reservation });
  }

  async deleteReservation(req: Request, res: Response) {
    const { id } = req.params;
    await this.reservationsService.deleteReservation(Number(id));
    res.status(204).send();
  }

  async updateReservationStatus(req: Request, res: Response) {
    const { id } = req.params;
    const data: UpdateReservationStatusInput = req.body;

    const reservation = await this.reservationsService.updateReservationStatus(
      Number(id),
      data.status,
      data.cancellationReason ?? undefined
    );

    res.json({ success: true, data: reservation });
  }

  async getReservationsByDate(req: Request, res: Response) {
    const { date } = req.params;

    try {
      const parsedDate = date ? new Date(date) : undefined;
      if (date && isNaN(parsedDate!.getTime())) {
        throw new BadRequestError('Geçersiz tarih formatı');
      }

      const reservations = await this.reservationsService.getReservationsByDate(parsedDate);
      res.json({ success: true, data: reservations });
    } catch (error) {
      if (error instanceof BadRequestError) {
        res.status(400).json({ success: false, error: error.message });
      } else {
        throw error;
      }
    }
  }

  async getReservationsByCustomer(req: Request, res: Response) {
    const { customerId } = req.params;
    const reservations = await this.reservationsService.getReservationsByCustomer(
      Number(customerId)
    );
    res.json({ success: true, data: reservations });
  }

  async getReservations(req: Request, res: Response) {
    const { customerId, tableId, branchId, date, status, page = '1', limit = '10' } = req.query;

    const reservations = await this.reservationsService.getReservations({
      customerId: customerId ? Number(customerId) : undefined,
      tableId: tableId ? Number(tableId) : undefined,
      branchId: branchId ? Number(branchId) : undefined,
      date: date ? new Date(date as string) : undefined,
      status: (status as ReservationStatus) || undefined,
      page: Number(page),
      limit: Number(limit),
    });

    res.json({ success: true, data: reservations });
  }

  async getReservationsByTable(req: Request, res: Response) {
    const { tableId } = req.params;
    const reservations = await this.reservationsService.getReservations({
      tableId: Number(tableId),
      page: 1,
      limit: 100,
    });
    res.json({ success: true, data: reservations });
  }

  async getReservationsByBranch(req: Request, res: Response) {
    const { branchId } = req.params;
    const reservations = await this.reservationsService.getReservations({
      branchId: Number(branchId),
      page: 1,
      limit: 100,
    });
    res.json({ success: true, data: reservations });
  }
}
