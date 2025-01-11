import { prisma } from '../app';
import { BadRequestError } from '../errors/common-errors';
import { ReservationNotFoundError } from '../errors/reservation-errors';
import { Prisma, ReservationStatus } from '@prisma/client';
import { format } from 'date-fns';

type UpdateReservationInput = {
  tableId?: number;
  reservationStartTime?: string;
  reservationEndTime?: string;
  partySize?: number;
  notes?: string;
  status?: ReservationStatus;
  cancellationReason?: string;
};

async function checkTableAvailability(
  tableId: number,
  startTime: Date,
  endTime: Date,
  excludeReservationId?: number
) {
  const existingReservation = await prisma.reservation.findFirst({
    where: {
      tableId: tableId,
      status: {
        in: ['CONFIRMED', 'PENDING']
      },
      id: {
        not: excludeReservationId
      },
      OR: [
        {
          AND: [
            { reservationStartTime: { lte: startTime } },
            { reservationEndTime: { gt: startTime } }
          ]
        },
        {
          AND: [
            { reservationStartTime: { lt: endTime } },
            { reservationEndTime: { gte: endTime } }
          ]
        }
      ]
    }
  });

  return !existingReservation;
}

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
        reservationStartTime: {
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
        orderBy: { reservationStartTime: 'asc' },
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

  async createReservation(data: {
    customerId: number;
    restaurantId: number;
    branchId: number;
    tableId?: number;
    reservationStartTime: string;
    reservationEndTime: string;
    partySize: number;
    notes?: string;
    status: ReservationStatus;
  }) {
    // branchId kontrolü
    if (!data.branchId) {
      throw new BadRequestError('Şube ID zorunludur');
    }

    // Masa müsaitlik kontrolü
    if (data.tableId) {
      // Önce masanın şubeye ait olup olmadığını kontrol et
      const table = await prisma.table.findUnique({
        where: { id: data.tableId }
      });

      if (!table) {
        throw new BadRequestError('Masa bulunamadı');
      }

      if (table.branchId !== data.branchId) {
        throw new BadRequestError('Seçilen masa bu şubeye ait değil');
      }

      // Seçilen zaman diliminde başka rezervasyon var mı kontrol et
      const startTime = new Date(data.reservationStartTime);
      const endTime = new Date(data.reservationEndTime);

      const isAvailable = await checkTableAvailability(data.tableId, startTime, endTime);

      if (!isAvailable) {
        throw new BadRequestError(
          `Bu masa ${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')} saatleri arasında rezerve edilmiş`
        );
      }
    }

    return prisma.reservation.create({
      data,
      include: {
        customer: true,
        table: true
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
    const currentReservation = await this.getReservationById(id);

    // Masa değişiyorsa müsaitlik kontrolü
    if (data.tableId && data.tableId !== currentReservation.tableId) {
      // Önce masanın şubeye ait olup olmadığını kontrol et
      const table = await prisma.table.findUnique({
        where: { id: data.tableId }
      });

      if (!table) {
        throw new BadRequestError('Masa bulunamadı');
      }

      if (table.branchId !== currentReservation.branchId) {
        throw new BadRequestError('Seçilen masa bu şubeye ait değil');
      }

      // Seçilen zaman diliminde başka rezervasyon var mı kontrol et
      const startTime = new Date(data.reservationStartTime || currentReservation.reservationStartTime);
      const endTime = new Date(data.reservationEndTime || currentReservation.reservationEndTime);

      const isAvailable = await checkTableAvailability(data.tableId, startTime, endTime, id);

      if (!isAvailable) {
        throw new BadRequestError(
          `Bu masa ${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')} saatleri arasında rezerve edilmiş`
        );
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
    return this.updateReservation(id, { status, cancellationReason });
  }

  async getReservationsByDate(date: Date | undefined) {
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
