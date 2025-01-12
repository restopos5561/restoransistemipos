import { PrismaClient, Table, TableStatus, OrderStatus } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';
import { TableNotFoundError, TableOperationError } from '../errors/table-errors';
import { SocketService } from '../socket/socket.service';
import { SOCKET_EVENTS } from '../socket/socket.events';

const prisma = new PrismaClient();

interface CreateTableInput {
  branchId: number;
  tableNumber: string;
  capacity?: number;
  location?: string;
}

interface UpdateTableInput {
  tableNumber?: string;
  capacity?: number;
  location?: string;
  isActive?: boolean;
  positionX?: number;
  positionY?: number;
}

interface TableResponse {
  success: boolean;
  error?: {
    message: string;
  };
  data?: Table;
}

export class TablesService {
  async getTables(filters: {
    branchId: number;
    status?: TableStatus;
    location?: string;
    capacity?: number;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    console.log('🔵 [TablesService] Masalar getiriliyor:', {
      filters,
      where: {
        branchId: filters.branchId,
        ...(filters.status && { status: filters.status }),
        ...(filters.location && { location: filters.location }),
        ...(filters.capacity && { capacity: filters.capacity }),
        ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      }
    });

    if (!filters.branchId) {
      throw new BadRequestError('Şube ID zorunludur');
    }

    const where = {
      branchId: filters.branchId,
      ...(filters.status && { status: filters.status }),
      ...(filters.location && { location: filters.location }),
      ...(filters.capacity && { capacity: filters.capacity }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    const [tables, total] = await Promise.all([
      prisma.table.findMany({
        where,
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
        include: {
          branch: true,
          orders: {
            where: {
              status: {
                in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY]
              }
            },
            include: {
              orderItems: {
                include: {
                  product: true
                }
              },
              payment: true
            },
            orderBy: {
              orderTime: 'desc'
            }
          },
        },
      }),
      prisma.table.count({ where }),
    ]);

    // Her masanın durumunu aktif siparişlere göre güncelle
    const updatedTables = await Promise.all(tables.map(async (table) => {
      const hasActiveOrders = table.orders && table.orders.length > 0;
      
      // Eğer aktif sipariş varsa ve masa IDLE ise, OCCUPIED olarak güncelle
      if (hasActiveOrders && table.status === TableStatus.IDLE) {
        const updatedTable = await prisma.table.update({
          where: { id: table.id },
          data: { status: TableStatus.OCCUPIED },
          include: {
            branch: true,
            orders: {
              where: {
                status: {
                  in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY]
                }
              },
              include: {
                orderItems: {
                  include: {
                    product: true
                  }
                },
                payment: true
              }
            }
          }
        });
        return updatedTable;
      }
      
      return table;
    }));

    // Her masanın adisyon detaylarını logla
    updatedTables.forEach(table => {
      console.log('🔍 [TablesService] Masa detayları:', {
        tableId: table.id,
        tableNumber: table.tableNumber,
        status: table.status,
        ordersCount: table.orders?.length,
        orders: table.orders?.map(order => ({
          id: order.id,
          status: order.status,
          orderTime: order.orderTime,
          closingTime: order.closingTime,
          itemCount: order.orderItems?.length,
          items: order.orderItems?.map(item => ({
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price
          }))
        }))
      });
    });

    console.log('✅ [TablesService] Masalar ve adisyonlar:', {
      totalTables: total,
      returnedTables: tables.length,
      tablesWithOrders: tables.filter(t => t.orders && t.orders.length > 0).length,
      orderDetails: tables
        .filter(t => t.orders && t.orders.length > 0)
        .map(table => ({
          tableNumber: table.tableNumber,
          orderCount: table.orders?.length,
          orders: table.orders?.map(order => ({
            id: order.id,
            status: order.status,
            totalAmount: order.totalAmount,
            itemCount: order.orderItems?.length,
            items: order.orderItems?.map(item => ({
              productName: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
              totalPrice: item.quantity * item.product.price
            }))
          }))
        }))
    });

    return {
      tables: updatedTables,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async getTableById(id: number): Promise<Table | null> {
    return prisma.table.findUnique({
      where: { id },
      include: {
        branch: true,
        orders: {
          where: {
            status: {
              in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY],
            },
            closingTime: null
          },
          include: {
            orderItems: {
              include: {
                product: true
              }
            },
            payment: true
          },
          orderBy: {
            orderTime: 'desc'
          }
        },
      },
    });
  }

  async createTable(data: CreateTableInput): Promise<Table> {
    // Aynı şubede aynı masa numarası var mı kontrol et
    const existingTable = await prisma.table.findFirst({
      where: {
        branchId: data.branchId,
        tableNumber: data.tableNumber,
      },
    });

    if (existingTable) {
      throw new BadRequestError('Bu masa numarası zaten kullanımda');
    }

    return prisma.table.create({
      data: {
        ...data,
        isActive: true,
        status: TableStatus.IDLE,
      },
      include: {
        branch: true,
      },
    });
  }

  async updateTable(id: number, data: UpdateTableInput): Promise<Table> {
    const table = await this.getTableById(id);

    if (!table) {
      throw new TableNotFoundError(id);
    }

    // Masa numarası değişiyorsa, yeni numara müsait mi kontrol et
    if (data.tableNumber && data.tableNumber !== table.tableNumber) {
      const existingTable = await prisma.table.findFirst({
        where: {
          branchId: table.branchId,
          tableNumber: data.tableNumber,
          id: { not: id },
        },
      });

      if (existingTable) {
        throw new BadRequestError('Bu masa numarası zaten kullanımda');
      }
    }

    // Position verisi varsa, ayrı olarak işle
    const { position, ...restData } = data as any;
    const updateData = {
      ...restData,
      ...(position && {
        positionX: position.x,
        positionY: position.y,
      }),
    };

    return prisma.table.update({
      where: { id },
      data: updateData,
      include: {
        branch: true,
      },
    });
  }

  async updateTableStatus(id: number, status: TableStatus): Promise<TableResponse> {
    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        orders: {
          where: {
            status: {
              notIn: ['COMPLETED', 'CANCELLED']
            }
          }
        }
      }
    });

    if (!table) {
      throw new TableNotFoundError(id);
    }

    // Eğer masada aktif sipariş varsa ve masa boş duruma alınmaya çalışılıyorsa
    if (status === TableStatus.IDLE && table.orders.length > 0) {
      return {
        success: false,
        error: {
          message: 'Aktif siparişi olan masa boş duruma alınamaz'
        }
      };
    }

    const updatedTable = await prisma.table.update({
      where: { id },
      data: { status }
    });

    return {
      success: true,
      data: updatedTable
    };
  }

  async mergeTables(mainTableId: number, tableIdsToMerge: number[]): Promise<Table> {
    // Ana masayı kontrol et
    const mainTable = await prisma.table.findUnique({
      where: { id: mainTableId },
      include: {
        orders: {
          where: {
            status: {
              notIn: ['COMPLETED', 'CANCELLED']
            }
          }
        }
      }
    });

    if (!mainTable) {
      throw new TableNotFoundError(mainTableId);
    }

    // Birleştirilecek masaları kontrol et
    const tablesToMerge = await prisma.table.findMany({
      where: {
        id: { in: tableIdsToMerge },
        branchId: mainTable.branchId,
      },
      include: {
        orders: {
          where: {
            status: {
              notIn: ['COMPLETED', 'CANCELLED']
            }
          }
        },
      },
    });

    // Validasyonlar
    if (tablesToMerge.length !== tableIdsToMerge.length) {
      throw new TableOperationError('Bazı masalar bulunamadı');
    }

    // Tüm masaların aynı şubede olduğunu kontrol et
    if (tablesToMerge.some((table) => table.branchId !== mainTable.branchId)) {
      throw new TableOperationError('Masalar farklı şubelerde');
    }

    // Ana masada aktif sipariş var mı kontrol et
    const mainTableActiveOrders = mainTable.orders?.filter(
      (order: { status: string }) => !['COMPLETED', 'CANCELLED'].includes(order.status)
    );

    // Transaction ile masaları birleştir
    return prisma.$transaction(async (tx) => {
      // Birleştirilecek masaları pasif yap
      await tx.table.updateMany({
        where: { id: { in: tableIdsToMerge } },
        data: {
          isActive: false,
        },
      });

      // Ana masayı güncelle
      const totalCapacity = tablesToMerge.reduce(
        (sum, table) => sum + (table.capacity || 0),
        mainTable.capacity || 0
      );

      return tx.table.update({
        where: { id: mainTableId },
        data: {
          capacity: totalCapacity,
          status: mainTableActiveOrders && mainTableActiveOrders.length > 0 ? TableStatus.OCCUPIED : TableStatus.IDLE,
        },
        include: { branch: true },
      });
    });
  }

  async transferTable(data: { fromTableId: number; toTableId: number }): Promise<Table> {
    const [fromTable, toTable] = await Promise.all([
      prisma.table.findUnique({
        where: { id: data.fromTableId },
        include: {
          branch: true,
          orders: {
            where: {
              status: {
                in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY],
              },
            },
          },
        },
      }),
      prisma.table.findUnique({
        where: { id: data.toTableId },
        include: {
          branch: true,
          orders: {
            where: {
              status: {
                in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY],
              },
            },
          },
        },
      }),
    ]);

    if (!fromTable || !toTable) {
      throw new TableNotFoundError(data.fromTableId || data.toTableId);
    }

    if (fromTable.branchId !== toTable.branchId) {
      throw new TableOperationError('Masalar farklı şubelerde');
    }

    if (toTable.status !== TableStatus.IDLE || (toTable.orders && toTable.orders.length > 0)) {
      throw new TableOperationError('Hedef masa dolu');
    }

    return prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: {
          tableId: data.fromTableId,
          status: {
            in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY],
          },
        },
        data: { tableId: data.toTableId },
      });

      await tx.table.update({
        where: { id: data.fromTableId },
        data: { status: TableStatus.IDLE },
      });

      return tx.table.update({
        where: { id: data.toTableId },
        data: { status: TableStatus.OCCUPIED },
        include: { branch: true },
      });
    });
  }

  async deleteTable(id: number): Promise<void> {
    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        orders: {
          where: {
            status: {
              in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY],
            },
          },
        },
      },
    });

    if (!table) {
      throw new TableNotFoundError(id);
    }

    if (table.orders && table.orders.length > 0) {
      throw new TableOperationError('Aktif siparişi olan masa silinemez');
    }

    await prisma.table.delete({ where: { id } });
  }

  async splitTable(id: string, newCapacity: number): Promise<TableResponse> {
    const table = await prisma.table.findUnique({
      where: { id: Number(id) },
      include: { orders: true }
    });

    if (!table) {
      return {
        success: false,
        error: {
          message: 'Masa bulunamadı'
        }
      };
    }

    // Aktif siparişleri kontrol et (COMPLETED veya CANCELLED olmayan siparişler)
    const activeOrders = table.orders.filter((order: { status: string }) => 
      !['COMPLETED', 'CANCELLED'].includes(order.status)
    );

    if (activeOrders.length > 0) {
      return {
        success: false,
        error: {
          message: 'Aktif siparişi olan masa ayrılamaz. Lütfen önce siparişleri tamamlayın.'
        }
      };
    }

    // Masa ayırma işlemine devam et...
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Ana masanın kapasitesini güncelle
        const updatedMainTable = await tx.table.update({
          where: { id: Number(id) },
          data: {
            capacity: (table.capacity || 0) - newCapacity,
          },
        });

        // Yeni masa oluştur
        const newTable = await tx.table.create({
          data: {
            branchId: table.branchId,
            tableNumber: await this.generateNewTableNumber(table.branchId),
            capacity: newCapacity,
            location: table.location,
            status: TableStatus.IDLE,
            isActive: true,
            positionX: (table.positionX || 0) + 120, // Ana masanın yanına yerleştir
            positionY: table.positionY,
          },
        });

        return updatedMainTable;
      });

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Masa ayrılırken bir hata oluştu'
        }
      };
    }
  }

  private async generateNewTableNumber(branchId: number): Promise<string> {
    // Şubedeki en son masa numarasını bul
    const lastTable = await prisma.table.findFirst({
      where: { branchId },
      orderBy: { tableNumber: 'desc' },
    });

    if (!lastTable) {
      return 'A1';
    }

    // Mevcut masa numarasını analiz et (örn: A1, B2, vs.)
    const letter = lastTable.tableNumber.charAt(0);
    const number = parseInt(lastTable.tableNumber.slice(1));

    // Yeni masa numarası oluştur
    if (number < 99) {
      return `${letter}${number + 1}`;
    } else {
      // 99'dan sonra harf değiştir (A->B, B->C, vs.)
      const nextLetter = String.fromCharCode(letter.charCodeAt(0) + 1);
      return `${nextLetter}1`;
    }
  }
}
