import { prisma } from '../app';
import { BadRequestError } from '../errors/common-errors';
import { ReservationNotFoundError } from '../errors/reservation-errors';
import { Prisma, ReservationStatus, TableStatus, Table } from '@prisma/client';
import { format } from 'date-fns';
import { reservationScheduler } from './reservation-scheduler.service';
import { SocketService } from '../socket';
import { SOCKET_EVENTS } from '../socket/socket.events';

type UpdateReservationInput = {
  tableId?: number | null;
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
    try {
      // branchId kontrolü
      if (!data.branchId) {
        throw new BadRequestError('Şube ID zorunludur');
      }

      // Masa müsaitlik kontrolü
      if (data.tableId) {
        // Önce masanın şubeye ait olup olmadığını kontrol et
        const table = await prisma.table.findUnique({
          where: { id: data.tableId },
          include: {
            branch: true
          }
        });

        if (!table) {
          throw new BadRequestError('Masa bulunamadı');
        }

        if (table.branchId !== data.branchId) {
          throw new BadRequestError(`Seçilen masa ${table.branch?.name || 'başka bir'} şubeye ait`);
        }

        // Seçilen zaman diliminde başka rezervasyon var mı kontrol et
        const startTime = new Date(data.reservationStartTime);
        const endTime = new Date(data.reservationEndTime);

        const existingReservation = await prisma.reservation.findFirst({
          where: {
            tableId: data.tableId,
            status: {
              in: ['CONFIRMED', 'PENDING']
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
          },
          include: {
            customer: true
          }
        });

        if (existingReservation) {
          throw new BadRequestError(
            `Bu masa ${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')} saatleri arasında ${existingReservation.customer?.name || 'başka bir müşteri'} adına rezerve edilmiş`
          );
        }
      }

      // Rezervasyonu oluştur
      const reservation = await prisma.reservation.create({
        data: {
          ...data,
          status: 'PENDING'
        },
        include: {
          customer: true,
          table: {
            include: {
              branch: true
            }
          }
        }
      });

      console.log('✅ [ReservationsService] Rezervasyon oluşturuldu:', {
        id: reservation.id,
        startTime: reservation.reservationStartTime,
        endTime: reservation.reservationEndTime,
        tableId: reservation.tableId
      });

      // Zamanlayıcıyı başlat
      await reservationScheduler.scheduleReservation(reservation);

      return {
        success: true,
        data: reservation
      };
    } catch (error) {
      console.error('❌ [ReservationsService] Rezervasyon oluşturulurken hata:', error);
      
      if (error instanceof BadRequestError) {
        throw error;
      }

      throw new Error('Rezervasyon oluşturulurken bir hata oluştu');
    }
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

    // Mevcut zamanlayıcıyı iptal et
    reservationScheduler.cancelScheduledTasks(id);

    // Rezervasyonu güncelle
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data,
      include: {
        customer: true,
        table: true,
      },
    });

    // Yeni zamanlayıcı oluştur
    await reservationScheduler.scheduleReservation(updatedReservation);

    return updatedReservation;
  }

  async deleteReservation(id: number) {
    const reservation = await this.getReservationById(id);
    
    // Önce zamanlayıcıyı iptal et
    reservationScheduler.cancelScheduledTasks(id);

    // Masa durumunu güncelle ve rezervasyonu sil
    await Promise.all([
      // Masayı boşalt
      ...(reservation.tableId ? [
        prisma.table.update({
          where: { id: reservation.tableId },
          data: { status: TableStatus.IDLE },
          select: {
            id: true,
            branchId: true,
            status: true
          }
        }).then((updatedTable: Pick<Table, 'id' | 'branchId' | 'status'>) => {
          // Socket event'i gönder
          SocketService.emitToRoom(
            `branch_${updatedTable.branchId}`,
            SOCKET_EVENTS.TABLE_STATUS_CHANGED,
            {
              tableId: updatedTable.id,
              status: updatedTable.status,
              branchId: updatedTable.branchId
            }
          );
        })
      ] : []),
      // Rezervasyonu sil
      prisma.reservation.delete({ where: { id } })
    ]);

    console.log('✅ [ReservationsService] Rezervasyon silindi ve masa boşaltıldı:', {
      reservationId: id,
      tableId: reservation.tableId
    });
  }

  async updateReservationStatus(
    id: number,
    status: ReservationStatus,
    cancellationReason?: string
  ) {
    const reservation = await this.getReservationById(id);

    // Mevcut zamanlayıcıyı iptal et
    reservationScheduler.cancelScheduledTasks(id);

    // Eğer rezervasyon iptal ediliyorsa ve masaya atanmışsa, masa durumunu kontrol et
    if (status === ReservationStatus.CANCELLED && reservation.tableId) {
      const table = await prisma.table.findUnique({
        where: { id: reservation.tableId },
        include: { orders: true }
      });

      if (table) {
        // Masada aktif sipariş varsa OCCUPIED, yoksa IDLE
        const hasActiveOrders = table.orders?.some(order => 
          order.status === 'PENDING' || 
          order.status === 'PREPARING' || 
          order.status === 'READY' || 
          order.status === 'DELIVERED'
        );
        
        const newStatus = hasActiveOrders ? TableStatus.OCCUPIED : TableStatus.IDLE;
        
        await prisma.table.update({
          where: { id: reservation.tableId },
          data: { status: newStatus }
        });

        // Socket event'i gönder
        SocketService.emitToRoom(
          `branch_${table.branchId}`,
          SOCKET_EVENTS.TABLE_STATUS_CHANGED,
          {
            tableId: table.id,
            status: newStatus,
            branchId: table.branchId
          }
        );
      }
    }

    // Rezervasyon durumunu güncelle
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: { status, cancellationReason },
      include: {
        customer: true,
        table: true,
      },
    });

    // Yeni zamanlayıcı oluştur (iptal edilmediyse)
    if (status !== ReservationStatus.CANCELLED) {
      await reservationScheduler.scheduleReservation(updatedReservation);
    }

    return updatedReservation;
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
