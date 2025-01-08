import { PrismaClient, Table, TableStatus, OrderStatus } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';
import { TableNotFoundError, TableOperationError } from '../errors/table-errors';

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

export class TablesService {
  async getTables(filters: {
    branchId?: number;
    status?: TableStatus;
    location?: string;
    capacity?: number;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const where = {
      ...(filters.branchId && { branchId: filters.branchId }),
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
                in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY],
              },
            },
          },
        },
      }),
      prisma.table.count({ where }),
    ]);

    return {
      tables,
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
          },
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

  async updateTableStatus(id: number, status: TableStatus): Promise<Table> {
    const table = await prisma.table.findUnique({
      where: { id },
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
    });

    if (!table) {
      throw new TableNotFoundError(id);
    }

    if (status === TableStatus.IDLE && table.orders && table.orders.length > 0) {
      throw new TableOperationError('Aktif siparişi olan masa boş duruma alınamaz');
    }

    return prisma.table.update({
      where: { id },
      data: { status },
      include: {
        branch: true,
      },
    });
  }

  async mergeTables(mainTableId: number, tableIdsToMerge: number[]): Promise<Table> {
    // Ana masayı kontrol et
    const mainTable = await this.getTableById(mainTableId);
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
              in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY],
            },
          },
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

    // Masaların boş olduğunu kontrol et
    const busyTables = tablesToMerge.filter(
      (table) => table.status !== TableStatus.IDLE || (table.orders && table.orders.length > 0)
    );
    if (busyTables.length > 0) {
      throw new TableOperationError('Birleştirilecek masalar boş olmalı');
    }

    // Transaction ile masaları birleştir
    return prisma.$transaction(async (tx) => {
      // Birleştirilecek masaları pasife al
      await tx.table.updateMany({
        where: { id: { in: tableIdsToMerge } },
        data: {
          isActive: false,
          status: TableStatus.IDLE,
        },
      });

      // Ana masayı güncelle (örn: kapasite artırımı)
      const totalCapacity = tablesToMerge.reduce(
        (sum, table) => sum + (table.capacity || 0),
        mainTable.capacity || 0
      );

      return tx.table.update({
        where: { id: mainTableId },
        data: {
          capacity: totalCapacity,
          status: TableStatus.IDLE,
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
}
