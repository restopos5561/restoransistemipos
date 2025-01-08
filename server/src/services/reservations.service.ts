import { prisma } from '../app';
import { BadRequestError } from '../errors/common-errors';
import { ReservationNotFoundError } from '../errors/reservation-errors';
import { CreateReservationInput, UpdateReservationInput } from '../schemas/reservation.schema';
import { Prisma, ReservationStatus } from '@prisma/client';

export class ReservationsService {
  async getReservations(params: {
    customerId?: number;
    tableId?: number;
    branchId?: number;
    date?: Date;
    status?: ReservationStatus;
    page: number;
    limit: number;
  }) {
    const { customerId, tableId, branchId, date, status, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ReservationWhereInput = {
      ...(customerId && { customerId }),
      ...(tableId && { tableId }),
      ...(branchId && { branchId }),
      ...(date && {
        reservationTime: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      }),
      ...(status && { status }),
    };

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          table: {
            select: {
              id: true,
              tableNumber: true,
            },
          },
        },
        orderBy: { reservationTime: 'asc' },
      }),
      prisma.reservation.count({ where }),
    ]);

    return {
      reservations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createReservation(data: CreateReservationInput) {
    // Masa müsaitlik kontrolü
    if (data.tableId) {
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          tableId: data.tableId,
          reservationTime: {
            gte: new Date(new Date(data.reservationTime).getTime() - 2 * 60 * 60 * 1000),
            lte: new Date(new Date(data.reservationTime).getTime() + 2 * 60 * 60 * 1000),
          },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (existingReservation) {
        throw new BadRequestError('Bu masa için seçilen saatte rezervasyon bulunmaktadır');
      }
    }

    return prisma.reservation.create({
      data,
      include: {
        customer: true,
        table: true,
      },
    });
  }

  async getReservationById(id: number) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        customer: true,
        table: true,
      },
    });

    if (!reservation) {
      throw new BadRequestError(`Reservation with id ${id} not found`);
    }

    return reservation;
  }

  async updateReservation(id: number, data: UpdateReservationInput) {
    await this.getReservationById(id);

    // Masa değişiyorsa müsaitlik kontrolü
    if (data.tableId) {
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          id: { not: id },
          tableId: data.tableId,
          reservationTime: data.reservationTime
            ? {
                gte: new Date(new Date(data.reservationTime).getTime() - 2 * 60 * 60 * 1000),
                lte: new Date(new Date(data.reservationTime).getTime() + 2 * 60 * 60 * 1000),
              }
            : undefined,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (existingReservation) {
        throw new BadRequestError('Bu masa için seçilen saatte rezervasyon bulunmaktadır');
      }
    }

    return prisma.reservation.update({
      where: { id },
      data,
      include: {
        customer: true,
        table: true,
      },
    });
  }

  async deleteReservation(id: number) {
    await this.getReservationById(id);
    await prisma.reservation.delete({ where: { id } });
  }

  async updateReservationStatus(
    id: number,
    status: ReservationStatus,
    cancellationReason?: string
  ) {
    const reservation = await this.getReservationById(id);

    // İptal ediliyorsa sebep zorunlu
    if (status === 'CANCELLED' && !cancellationReason) {
      throw new BadRequestError('İptal sebebi belirtilmelidir');
    }

    return prisma.reservation.update({
      where: { id },
      data: {
        status,
        cancellationReason: status === 'CANCELLED' ? cancellationReason : null,
      },
      include: {
        customer: true,
        table: true,
      },
    });
  }

  async getReservationsByDate(date: Date | undefined) {
    if (!date) {
      // Tarih belirtilmemişse bugünün rezervasyonlarını getir
      date = new Date();
    }

    return this.getReservations({
      date,
      page: 1,
      limit: 100,
    });
  }

  async getReservationsByCustomer(customerId: number) {
    return this.getReservations({
      customerId,
      page: 1,
      limit: 100,
    });
  }
}
