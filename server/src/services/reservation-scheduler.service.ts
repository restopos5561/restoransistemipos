import { PrismaClient, TableStatus, ReservationStatus } from '@prisma/client';
import { SocketService } from '../socket';
import { SOCKET_EVENTS } from '../socket/socket.events';

const prisma = new PrismaClient();

export class ReservationSchedulerService {
  private static instance: ReservationSchedulerService;
  private scheduledTasks: Map<number, NodeJS.Timeout>;

  private constructor() {
    this.scheduledTasks = new Map();
    this.initializeScheduler();
  }

  static getInstance(): ReservationSchedulerService {
    if (!ReservationSchedulerService.instance) {
      ReservationSchedulerService.instance = new ReservationSchedulerService();
    }
    return ReservationSchedulerService.instance;
  }

  private async initializeScheduler() {
    // Mevcut rezervasyonları getir
    const reservations = await prisma.reservation.findMany({
      where: {
        status: 'PENDING',
        reservationStartTime: {
          gt: new Date()
        }
      },
      include: {
        table: {
          include: {
            branch: true
          }
        }
      }
    });

    // Her rezervasyon için zamanlayıcı oluştur
    reservations.forEach(reservation => {
      this.scheduleReservation(reservation);
    });

    console.log('✅ [ReservationScheduler] Zamanlayıcı başlatıldı:', {
      activeReservations: reservations.length
    });
  }

  async scheduleReservation(reservation: any) {
    console.log('🕒 [ReservationScheduler] Zamanlayıcı ayarlanıyor:', {
      id: reservation.id,
      startTime: reservation.reservationStartTime,
      endTime: reservation.reservationEndTime,
      tableId: reservation.tableId
    });

    // Başlangıç zamanı için zamanlayıcı
    const startTime = new Date(reservation.reservationStartTime).getTime();
    const endTime = new Date(reservation.reservationEndTime).getTime();
    const now = Date.now();

    // Başlangıç zamanı geldiğinde masayı rezerve et
    if (startTime > now) {
      const startTimeout = setTimeout(async () => {
        try {
          // Masa ve rezervasyon durumunu güncelle
          const [updatedTable, updatedReservation] = await Promise.all([
            prisma.table.update({
              where: { id: reservation.tableId },
              data: { status: TableStatus.RESERVED }
            }),
            prisma.reservation.update({
              where: { id: reservation.id },
              data: { status: ReservationStatus.CONFIRMED }
            })
          ]);

          // Socket event'i gönder
          if (reservation.table?.branch) {
            SocketService.emitToRoom(
              `branch_${reservation.table.branch.id}`,
              SOCKET_EVENTS.TABLE_STATUS_CHANGED,
              {
                tableId: reservation.tableId,
                status: TableStatus.RESERVED,
                branchId: reservation.table.branch.id
              }
            );
          }

          console.log('✅ [ReservationScheduler] Masa rezerve edildi:', {
            reservationId: reservation.id,
            tableId: reservation.tableId,
            startTime: reservation.reservationStartTime,
            tableStatus: updatedTable.status,
            reservationStatus: updatedReservation.status
          });
        } catch (error) {
          console.error('❌ [ReservationScheduler] Masa rezerve edilirken hata:', error);
        }
      }, startTime - now);

      this.scheduledTasks.set(reservation.id, startTimeout);
      console.log('✅ [ReservationScheduler] Başlangıç zamanlayıcısı ayarlandı:', {
        reservationId: reservation.id,
        startIn: Math.floor((startTime - now) / 1000 / 60), // dakika
        startTime: new Date(startTime).toLocaleString()
      });
    }

    // Bitiş zamanı geldiğinde masayı boşalt
    if (endTime > now) {
      const endTimeout = setTimeout(async () => {
        try {
          // Masa ve rezervasyon durumunu güncelle
          const [updatedTable, updatedReservation] = await Promise.all([
            prisma.table.update({
              where: { id: reservation.tableId },
              data: { status: TableStatus.IDLE }
            }),
            prisma.reservation.update({
              where: { id: reservation.id },
              data: { status: ReservationStatus.COMPLETED }
            })
          ]);

          // Socket event'i gönder
          if (reservation.table?.branch) {
            SocketService.emitToRoom(
              `branch_${reservation.table.branch.id}`,
              SOCKET_EVENTS.TABLE_STATUS_CHANGED,
              {
                tableId: reservation.tableId,
                status: TableStatus.IDLE,
                branchId: reservation.table.branch.id
              }
            );
          }

          console.log('✅ [ReservationScheduler] Rezervasyon süresi doldu:', {
            reservationId: reservation.id,
            tableId: reservation.tableId,
            endTime: reservation.reservationEndTime,
            tableStatus: updatedTable.status,
            reservationStatus: updatedReservation.status
          });
        } catch (error) {
          console.error('❌ [ReservationScheduler] Masa boşaltılırken hata:', error);
        }
      }, endTime - now);

      this.scheduledTasks.set(-reservation.id, endTimeout);
      console.log('✅ [ReservationScheduler] Bitiş zamanlayıcısı ayarlandı:', {
        reservationId: reservation.id,
        endIn: Math.floor((endTime - now) / 1000 / 60), // dakika
        endTime: new Date(endTime).toLocaleString()
      });
    }
  }

  cancelScheduledTasks(reservationId: number) {
    // Başlangıç zamanlayıcısını iptal et
    const startTimeout = this.scheduledTasks.get(reservationId);
    if (startTimeout) {
      clearTimeout(startTimeout);
      this.scheduledTasks.delete(reservationId);
    }

    // Bitiş zamanlayıcısını iptal et
    const endTimeout = this.scheduledTasks.get(-reservationId);
    if (endTimeout) {
      clearTimeout(endTimeout);
      this.scheduledTasks.delete(-reservationId);
    }
  }
}

export const reservationScheduler = ReservationSchedulerService.getInstance(); 