import { PrismaClient, Printer, PrinterType } from '@prisma/client';

// Interface tanımlamaları
interface PrinterFilters {
  restaurantId: number;
  branchId?: number;
  type?: string;
  isActive?: boolean;
  page: number;
  limit: number;
}

interface PrinterInput {
  restaurantId: number;
  branchId?: number;
  name: string;
  type: PrinterType;
  ipAddress?: string;
  port?: number;
  isActive?: boolean;
  isDefault?: boolean;
}

interface PrintJobInput {
  content?: string;
  orderId?: number;
}

const prisma = new PrismaClient();

export class PrinterService {
  async getPrinters(filters: PrinterFilters) {
    const skip = (filters.page - 1) * filters.limit;

    const where: any = {
      restaurantId: filters.restaurantId,
    };

    if (filters.branchId) where.branchId = filters.branchId;
    if (filters.type) where.type = filters.type;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    const [printers, total] = await Promise.all([
      prisma.printer.findMany({
        where,
        skip,
        take: filters.limit,
        include: {
          branch: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.printer.count({ where }),
    ]);

    return {
      printers,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async getPrinterById(id: number): Promise<Printer | null> {
    return prisma.printer.findUnique({
      where: { id },
      include: {
        branch: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async createPrinter(data: PrinterInput): Promise<Printer> {
    return prisma.printer.create({
      data: {
        ...data,
        type: data.type as PrinterType,
      },
    });
  }

  async updatePrinter(id: number, data: Partial<PrinterInput>): Promise<Printer> {
    return prisma.printer.update({
      where: { id },
      data: {
        ...data,
        type: data.type as PrinterType,
      },
    });
  }

  async deletePrinter(id: number): Promise<void> {
    await prisma.printer.delete({
      where: { id },
    });
  }

  async print(printerId: number, data: PrintJobInput): Promise<void> {
    const printer = await this.getPrinterById(printerId);
    if (!printer) {
      throw new Error('Printer not found');
    }

    if (data.orderId) {
      console.log(`Printing order ${data.orderId} to ${printer.name}`);
    } else {
      console.log(`Printing test content to ${printer.name}`);
    }
  }

  async getPrintersByBranch(branchId: number) {
    return prisma.printer.findMany({
      where: {
        branchId,
        isActive: true,
      },
    });
  }
}
