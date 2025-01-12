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
    try {
      // Mevcut rezervasyonları getir
      const reservations = await prisma.reservation.findMany({
        where: {
          status: {
            in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED]
          },
          OR: [
            {
              // Başlangıç zamanı henüz gelmemiş rezervasyonlar
              reservationStartTime: {
                gt: new Date()
              }
            },
            {
              // Başlamış ama bitmemiş rezervasyonlar
              AND: [
                {
                  reservationStartTime: {
                    lte: new Date()
                  }
                },
                {
                  reservationEndTime: {
                    gt: new Date()
                  }
                }
              ]
            }
          ]
        },
        include: {
          table: {
            include: {
              branch: true
            }
          }
        }
      });

      console.log('🔵 [ReservationScheduler] Aktif rezervasyonlar bulundu:', {
        count: reservations.length,
        reservations: reservations.map(r => ({
          id: r.id,
          startTime: r.reservationStartTime,
          endTime: r.reservationEndTime,
          status: r.status,
          tableId: r.tableId
        }))
      });

      // Her rezervasyon için zamanlayıcı oluştur
      for (const reservation of reservations) {
        await this.scheduleReservation(reservation);
      }

      console.log('✅ [ReservationScheduler] Zamanlayıcı başlatıldı:', {
        activeReservations: reservations.length
      });
    } catch (error) {
      console.error('❌ [ReservationScheduler] Zamanlayıcı başlatılırken hata:', error);
    }
  }

  async scheduleReservation(reservation: any) {
    try {
      console.log('🕒 [ReservationScheduler] Zamanlayıcı ayarlanıyor:', {
        id: reservation.id,
        startTime: reservation.reservationStartTime,
        endTime: reservation.reservationEndTime,
        tableId: reservation.tableId,
        currentStatus: reservation.status
      });

      const startTime = new Date(reservation.reservationStartTime).getTime();
      const endTime = new Date(reservation.reservationEndTime).getTime();
      const now = Date.now();

      // Eğer rezervasyon başlamamışsa veya henüz bitmemişse
      if ((startTime > now || (startTime <= now && endTime > now)) && 
          (reservation.status === ReservationStatus.PENDING || reservation.status === ReservationStatus.CONFIRMED)) {
        // Eğer başlangıç zamanı henüz gelmediyse
        if (startTime > now) {
          const startTimeout = setTimeout(async () => {
            try {
              // Önce rezervasyonun hala geçerli olup olmadığını kontrol et
              const currentReservation = await prisma.reservation.findUnique({
                where: { id: reservation.id }
              });

              if (!currentReservation || currentReservation.status === ReservationStatus.CANCELLED) {
                console.log('🚫 [ReservationScheduler] Rezervasyon artık geçerli değil:', {
                  reservationId: reservation.id,
                  status: currentReservation?.status
                });
                return;
              }

              // Masa ve rezervasyon durumunu güncelle
              const [updatedTable, updatedReservation] = await Promise.all([
                prisma.table.update({
                  where: { id: reservation.tableId },
                  data: { status: TableStatus.RESERVED },
                  include: {
                    branch: true
                  }
                }),
                prisma.reservation.update({
                  where: { id: reservation.id },
                  data: { status: ReservationStatus.CONFIRMED }
                })
              ]);

              // Socket event'i gönder
              if (updatedTable.branch) {
                SocketService.emitToRoom(
                  `branch_${updatedTable.branch.id}`,
                  SOCKET_EVENTS.TABLE_STATUS_CHANGED,
                  {
                    tableId: updatedTable.id,
                    status: updatedTable.status,
                    branchId: updatedTable.branch.id
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
        } else {
          // Eğer rezervasyon başlamış ama bitmemişse, hemen masa durumunu güncelle
          try {
            const [updatedTable, updatedReservation] = await Promise.all([
              prisma.table.update({
                where: { id: reservation.tableId },
                data: { status: TableStatus.RESERVED },
                include: {
                  branch: true
                }
              }),
              prisma.reservation.update({
                where: { id: reservation.id },
                data: { status: ReservationStatus.CONFIRMED }
              })
            ]);

            // Socket event'i gönder
            if (updatedTable.branch) {
              SocketService.emitToRoom(
                `branch_${updatedTable.branch.id}`,
                SOCKET_EVENTS.TABLE_STATUS_CHANGED,
                {
                  tableId: updatedTable.id,
                  status: updatedTable.status,
                  branchId: updatedTable.branch.id
                }
              );
            }

            console.log('✅ [ReservationScheduler] Masa hemen rezerve edildi:', {
              reservationId: reservation.id,
              tableId: reservation.tableId,
              startTime: reservation.reservationStartTime,
              tableStatus: updatedTable.status,
              reservationStatus: updatedReservation.status
            });
          } catch (error) {
            console.error('❌ [ReservationScheduler] Masa hemen rezerve edilirken hata:', error);
          }
        }
      }

      // Bitiş zamanı geldiğinde masayı boşalt (hem PENDING hem CONFIRMED rezervasyonlar için)
      if (endTime > now) {
        const endTimeout = setTimeout(async () => {
          try {
            // Önce rezervasyonun hala geçerli olup olmadığını kontrol et
            const currentReservation = await prisma.reservation.findUnique({
              where: { id: reservation.id }
            });

            if (!currentReservation || currentReservation.status === ReservationStatus.CANCELLED) {
              console.log('🚫 [ReservationScheduler] Rezervasyon artık geçerli değil:', {
                reservationId: reservation.id,
                status: currentReservation?.status
              });
              return;
            }

            // Masa ve rezervasyon durumunu güncelle
            const [updatedTable, updatedReservation] = await Promise.all([
              prisma.table.update({
                where: { id: reservation.tableId },
                data: { status: TableStatus.IDLE },
                include: {
                  branch: true
                }
              }),
              prisma.reservation.update({
                where: { id: reservation.id },
                data: { status: ReservationStatus.COMPLETED }
              })
            ]);

            // Socket event'i gönder
            if (updatedTable.branch) {
              SocketService.emitToRoom(
                `branch_${updatedTable.branch.id}`,
                SOCKET_EVENTS.TABLE_STATUS_CHANGED,
                {
                  tableId: updatedTable.id,
                  status: updatedTable.status,
                  branchId: updatedTable.branch.id
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
    } catch (error) {
      console.error('❌ [ReservationScheduler] Zamanlayıcı ayarlanırken hata:', error);
    }
  }

  cancelScheduledTasks(reservationId: number) {
    // Başlangıç zamanlayıcısını iptal et
    const startTimeout = this.scheduledTasks.get(reservationId);
    if (startTimeout) {
      clearTimeout(startTimeout);
      this.scheduledTasks.delete(reservationId);
      console.log('✅ [ReservationScheduler] Başlangıç zamanlayıcısı iptal edildi:', {
        reservationId
      });
    }

    // Bitiş zamanlayıcısını iptal et
    const endTimeout = this.scheduledTasks.get(-reservationId);
    if (endTimeout) {
      clearTimeout(endTimeout);
      this.scheduledTasks.delete(-reservationId);
      console.log('✅ [ReservationScheduler] Bitiş zamanlayıcısı iptal edildi:', {
        reservationId
      });
    }
  }
}

export const reservationScheduler = ReservationSchedulerService.getInstance(); 