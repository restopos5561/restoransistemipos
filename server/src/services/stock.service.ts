import { PrismaClient, StockTransactionType, Prisma } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';
import { SocketService } from '../socket/socket.service';
import { SOCKET_EVENTS } from '../socket/socket.events';

interface TransferStockInput {
  fromBranchId: number;
  toBranchId: number;
  productId: number;
  quantity: number;
  transferBy: number;
  notes?: string;
}

const prisma = new PrismaClient();

export class StockService {
  async getStocks(filters: {
    productId?: number;
    restaurantId?: number;
    branchId?: number;
    lowStock?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const where: any = {
      ...(filters.productId && { productId: filters.productId }),
      ...(filters.lowStock && {
        AND: [
          { lowStockThreshold: { not: null } },
          {
            quantity: {
              lt: prisma.stock.fields.lowStockThreshold,
            },
          },
        ],
      }),
      ...(filters.branchId && { branchId: filters.branchId }),
      ...(filters.search && {
        product: {
          name: {
            contains: filters.search,
            mode: 'insensitive' as const,
          },
        },
      }),
    };

    const [stocks, total] = await Promise.all([
      prisma.stock.findMany({
        where,
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              unit: true,
              barcode: true,
              productSuppliers: {
                include: {
                  supplier: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            },
          },
        },
      }),
      prisma.stock.count({ where }),
    ]);

    console.log('Stok verisi:', JSON.stringify(stocks, null, 2));

    return {
      stocks,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async getStockById(id: number) {
    const stock = await prisma.stock.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!stock) {
      throw new BadRequestError('Stock not found');
    }

    return stock;
  }

  async updateStockQuantity(stockId: number, data: { quantity: number; type: 'IN' | 'OUT'; notes?: string }) {
    const stock = await prisma.stock.findUnique({
      where: { id: stockId },
      include: {
        product: true,
        branch: true
      }
    });

    if (!stock) {
      throw new BadRequestError('Stok bulunamadı');
    }

    // Stok güncelleme işlemi
    const updatedStock = await prisma.$transaction(async (tx) => {
      // Stok miktarını güncelle
      const updated = await tx.stock.update({
        where: { id: stockId },
        data: {
          quantity: data.type === 'IN' 
            ? { increment: data.quantity }
            : { decrement: data.quantity }
        },
        include: {
          product: true,
          branch: true
        }
      });

      // Stok hareketi oluştur
      await tx.stockHistory.create({
        data: {
          stockId: stockId,
          productId: stock.productId,
          restaurantId: stock.product.restaurantId,
          type: data.type === 'IN' ? StockTransactionType.IN : StockTransactionType.OUT,
          quantity: data.quantity,
          notes: data.notes,
          date: new Date()
        }
      });

      return updated;
    });

    // Socket event'lerini gönder
    if (stock.branch) {
      SocketService.emitToRoom(`branch_${stock.branch.id}`, SOCKET_EVENTS.STOCK_QUANTITY_CHANGED, {
        stockId: stock.id,
        productId: stock.productId,
        newQuantity: updatedStock.quantity,
        type: data.type,
        productName: stock.product.name
      });

      // Eğer stok kritik seviyenin altındaysa uyarı gönder
      if (stock.lowStockThreshold && updatedStock.quantity <= stock.lowStockThreshold) {
        SocketService.emitToRoom(`branch_${stock.branch.id}`, SOCKET_EVENTS.STOCK_ALERT, {
          stockId: stock.id,
          productId: stock.productId,
          currentQuantity: updatedStock.quantity,
          threshold: stock.lowStockThreshold,
          productName: stock.product.name
        });
      }
    }

    return updatedStock;
  }

  async getStockHistory(stockId: number) {
    const history = await prisma.stockHistory.findMany({
      where: { stockId },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    if (!history) {
      throw new BadRequestError('Stock history not found');
    }

    return history;
  }

  async getStockMovements(filters: {
    restaurantId?: number;
    branchId?: number;
    productId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const where = {
      ...(filters.restaurantId && { restaurantId: filters.restaurantId }),
      ...(filters.productId && { productId: filters.productId }),
      ...(filters.branchId && {
        stock: {
          branchId: filters.branchId,
        },
      }),
      ...(filters.startDate &&
        filters.endDate && {
          date: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
          },
        }),
    };

    const [movements, total] = await Promise.all([
      prisma.stockHistory.findMany({
        where,
        include: {
          product: {
            select: {
              name: true,
              unit: true,
            },
          },
          stock: {
            select: {
              branch: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
      }),
      prisma.stockHistory.count({ where }),
    ]);

    return {
      movements: movements.map((m) => ({
        id: m.id,
        productId: m.productId,
        productName: m.product.name,
        quantity: m.quantity,
        type: m.type,
        date: m.date,
        notes: m.notes,
        branchName: m.stock.branch.name,
        unit: m.product.unit,
      })),
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async getExpiringStock(filters: {
    restaurantId?: number;
    branchId?: number;
    daysToExpiration: number;
    page?: number;
    limit?: number;
  }) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + filters.daysToExpiration);

    const where = {
      ...(filters.restaurantId && { product: { restaurantId: filters.restaurantId } }),
      ...(filters.branchId && { branchId: filters.branchId }),
      expirationDate: {
        lte: expirationDate,
      },
    };

    const [stocks, total] = await Promise.all([
      prisma.stock.findMany({
        where,
        include: {
          product: {
            select: {
              name: true,
              unit: true,
            },
          },
          branch: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { expirationDate: 'asc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
      }),
      prisma.stock.count({ where }),
    ]);

    return {
      stocks: stocks.map((s) => ({
        id: s.id,
        productName: s.product.name,
        quantity: s.quantity,
        expirationDate: s.expirationDate,
        branchName: s.branch.name,
        unit: s.product.unit,
        daysToExpiration: Math.ceil(
          (s.expirationDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async createTransaction(data: {
    productId: number;
    quantity: number;
    type: StockTransactionType;
    notes?: string;
    restaurantId: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findFirst({
        where: {
          productId: data.productId,
          product: {
            restaurantId: data.restaurantId,
          },
        },
      });

      if (!stock) {
        throw new BadRequestError('Stock not found');
      }

      // Stok miktarını güncelle
      const updatedStock = await tx.stock.update({
        where: { id: stock.id },
        data: {
          quantity:
            data.type === 'OUT' ? stock.quantity - data.quantity : stock.quantity + data.quantity,
          lastStockUpdate: new Date(),
        },
      });

      // Stok hareketi oluştur
      const stockHistory = await tx.stockHistory.create({
        data: {
          stockId: stock.id,
          productId: data.productId,
          quantity: data.quantity,
          type: data.type,
          notes: data.notes,
          restaurantId: data.restaurantId,
          date: new Date(),
        },
      });

      return stockHistory;
    });
  }

  async updateThreshold(
    id: number,
    data: {
      lowStockThreshold: number;
      idealStockLevel?: number;
    }
  ) {
    return prisma.stock.update({
      where: { id },
      data: {
        lowStockThreshold: data.lowStockThreshold,
        idealStockLevel: data.idealStockLevel,
      },
    });
  }

  async getBranchStock(branchId: number) {
    const [stocks, total] = await Promise.all([
      prisma.stock.findMany({
        where: { branchId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              unit: true,
              barcode: true,
            },
          },
        },
      }),
      prisma.stock.count({ where: { branchId } }),
    ]);

    return {
      stocks,
      total,
    };
  }

  async getThresholdAlerts(filters: {
    restaurantId?: number;
    branchId?: number;
    page?: number;
    limit?: number;
  }) {
    const where = {
      ...(filters.branchId && { branchId: filters.branchId }),
      ...(filters.restaurantId && {
        product: {
          restaurantId: filters.restaurantId,
        },
      }),
      lowStockThreshold: { not: null },
      quantity: {
        lt: prisma.stock.fields.lowStockThreshold,
      },
    };

    const [stocks, total] = await Promise.all([
      prisma.stock.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
      }),
      prisma.stock.count({ where }),
    ]);

    return {
      thresholdAlerts: stocks.map((stock) => ({
        productId: stock.productId,
        productName: stock.product.name,
        currentStock: stock.quantity,
        lowStockThreshold: stock.lowStockThreshold,
      })),
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async transferStock(data: TransferStockInput) {
    const { fromBranchId, toBranchId, productId, quantity, transferBy, notes } = data;

    const sourceStock = await prisma.stock.findFirst({
      where: { branchId: fromBranchId, productId },
      include: { 
        product: true,
        branch: true
      }
    });

    if (!sourceStock) {
      throw new BadRequestError('Kaynak şubede stok bulunamadı');
    }

    if (sourceStock.quantity < quantity) {
      throw new BadRequestError('Yetersiz stok miktarı');
    }

    const targetStock = await prisma.stock.findFirst({
      where: { branchId: toBranchId, productId },
      include: {
        branch: true
      }
    });

    if (!targetStock) {
      throw new BadRequestError('Hedef şubede stok kaydı bulunamadı');
    }

    // Transaction ile stok transferini gerçekleştir
    const transfer = await prisma.$transaction(async (tx) => {
      // Kaynak stoktan düş
      const updatedSourceStock = await tx.stock.update({
        where: { id: sourceStock.id },
        data: {
          quantity: { decrement: quantity }
        }
      });

      // Kaynak stok hareketi
      await tx.stockHistory.create({
        data: {
          stockId: sourceStock.id,
          productId: sourceStock.productId,
          restaurantId: sourceStock.product.restaurantId,
          type: StockTransactionType.TRANSFER,
          quantity: quantity,
          notes: notes || `Transfer to Branch #${toBranchId}`,
          date: new Date()
        }
      });

      // Hedef stoğa ekle
      const updatedTargetStock = await tx.stock.update({
        where: { id: targetStock.id },
        data: {
          quantity: { increment: quantity }
        }
      });

      // Hedef stok hareketi
      await tx.stockHistory.create({
        data: {
          stockId: targetStock.id,
          productId: targetStock.productId,
          restaurantId: sourceStock.product.restaurantId,
          type: StockTransactionType.TRANSFER,
          quantity: quantity,
          notes: notes || `Transfer from Branch #${fromBranchId}`,
          date: new Date()
        }
      });

      return { updatedSourceStock, updatedTargetStock };
    });

    // Transfer sonrası socket event'lerini gönder
    SocketService.emitToRoom(`branch_${fromBranchId}`, SOCKET_EVENTS.STOCK_TRANSFER, {
      type: 'OUT',
      stockId: sourceStock.id,
      productId,
      quantity,
      fromBranchId,
      toBranchId,
      productName: sourceStock.product.name
    });

    SocketService.emitToRoom(`branch_${toBranchId}`, SOCKET_EVENTS.STOCK_TRANSFER, {
      type: 'IN',
      stockId: targetStock.id,
      productId,
      quantity,
      fromBranchId,
      toBranchId,
      productName: sourceStock.product.name
    });

    return transfer;
  }

  async createStockCount(data: {
    branchId: number;
    countedBy: number;
    countedDate: string;
    products: Array<{
      productId: number;
      countedQuantity: number;
      countedStockId: number;
    }>;
  }) {
    return prisma.$transaction(async (tx) => {
      // Sayım kaydı oluştur
      const stockCount = await tx.stockCount.create({
        data: {
          branchId: data.branchId,
          countedBy: data.countedBy,
          countedDate: new Date(data.countedDate),
        },
        include: {
          branch: true
        }
      });

      let totalItems = 0;
      let itemsWithDifference = 0;
      let totalPositiveDifference = 0;
      let totalNegativeDifference = 0;
      const details = [];

      // Her ürün için sayım detayı ve stok hareketi oluştur
      for (const item of data.products) {
        const stock = await tx.stock.findUnique({
          where: { id: item.countedStockId },
          include: { product: true },
        });

        if (!stock) {
          throw new BadRequestError(`Stock not found: ${item.countedStockId}`);
        }

        const difference = item.countedQuantity - stock.quantity;

        // Sayım detayı oluştur
        await tx.stockCountItem.create({
          data: {
            stockCountId: stockCount.id,
            productId: item.productId,
            stockId: item.countedStockId,
            systemQuantity: stock.quantity,
            countedQuantity: item.countedQuantity,
            difference,
          },
        });

        // Stok miktarını güncelle
        await tx.stock.update({
          where: { id: item.countedStockId },
          data: { quantity: item.countedQuantity },
        });

        // Stok hareketi oluştur
        await tx.stockHistory.create({
          data: {
            stockId: item.countedStockId,
            productId: item.productId,
            quantity: Math.abs(difference),
            type: 'ADJUSTMENT',
            notes: `Stok sayımı düzeltmesi (${stockCount.id})`,
            restaurantId: stock.product.restaurantId,
          },
        });

        // Rapor verilerini güncelle
        totalItems++;
        if (difference !== 0) {
          itemsWithDifference++;
          if (difference > 0) {
            totalPositiveDifference += difference;
          } else {
            totalNegativeDifference += Math.abs(difference);
          }
        }

        details.push({
          productName: stock.product.name,
          systemQuantity: stock.quantity,
          countedQuantity: item.countedQuantity,
          difference,
          unit: stock.product.unit,
        });
      }

      // Rapor verisini döndür
      return {
        countId: stockCount.id,
        branchName: stockCount.branch.name,
        countDate: stockCount.countedDate,
        totalItems,
        itemsWithDifference,
        totalPositiveDifference,
        totalNegativeDifference,
        details,
      };
    });
  }

  async getLowStock(filters: {
    restaurantId?: number;
    branchId?: number;
    page?: number;
    limit?: number;
  }) {
    const where = {
      ...(filters.restaurantId && { product: { restaurantId: filters.restaurantId } }),
      ...(filters.branchId && { branchId: filters.branchId }),
      lowStockThreshold: { not: null },
      quantity: {
        lte: prisma.stock.fields.lowStockThreshold,
      },
    };

    const [stocks, total] = await Promise.all([
      prisma.stock.findMany({
        where,
        include: {
          product: {
            select: {
              name: true,
              unit: true,
            },
          },
          branch: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { quantity: 'asc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
      }),
      prisma.stock.count({ where }),
    ]);

    return {
      stocks: stocks.map((s) => ({
        id: s.id,
        productName: s.product.name,
        quantity: s.quantity,
        lowStockThreshold: s.lowStockThreshold,
        branchName: s.branch.name,
        unit: s.product.unit,
        deficit: s.lowStockThreshold! - s.quantity,
      })),
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async getStockCountReport(stockCountId: number) {
    const stockCount = await prisma.stockCount.findUnique({
      where: { id: stockCountId },
      include: {
        items: {
          include: {
            product: true,
            stock: true,
          },
        },
        branch: true,
      },
    });

    if (!stockCount) {
      throw new BadRequestError('Sayım kaydı bulunamadı');
    }

    const summary = {
      countId: stockCount.id,
      branchName: stockCount.branch.name,
      countDate: stockCount.countedDate,
      totalItems: stockCount.items.length,
      itemsWithDifference: 0,
      totalPositiveDifference: 0,
      totalNegativeDifference: 0,
      details: stockCount.items.map(item => ({
        productName: item.product.name,
        systemQuantity: item.systemQuantity,
        countedQuantity: item.countedQuantity,
        difference: item.difference,
        unit: item.product.unit,
      })),
    };

    // İstatistikleri hesapla
    stockCount.items.forEach(item => {
      if (item.difference !== 0) {
        summary.itemsWithDifference++;
        if (item.difference > 0) {
          summary.totalPositiveDifference += item.difference;
        } else {
          summary.totalNegativeDifference += Math.abs(item.difference);
        }
      }
    });

    return summary;
  }

  async handleOrderCompletion(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        branch: true
      }
    });

    if (!order || !order.branchId) {
      throw new BadRequestError('Sipariş bulunamadı veya şube bilgisi eksik');
    }

    // Her ürün için stok düşme işlemi
    for (const item of order.orderItems) {
      if (item.product.stockTracking) {
        const stock = await prisma.stock.findFirst({
          where: {
            productId: item.productId,
            branchId: order.branchId
          }
        });

        if (!stock) {
          throw new BadRequestError(`${item.product.name} için stok kaydı bulunamadı`);
        }

        await this.updateStockQuantity(stock.id, {
          quantity: Number(item.quantity),
          type: 'OUT',
          notes: `Sipariş tamamlandı: #${order.id}`
        });

        // Stok güncellemesi sonrası event gönder
        SocketService.emitToRoom(`branch_${order.branchId}`, SOCKET_EVENTS.STOCK_UPDATED, {
          stockId: stock.id,
          productId: item.productId,
          orderId: order.id,
          type: 'OUT',
          quantity: Number(item.quantity)
        });
      }
    }
  }

  async handleOrderCancellation(orderId: number, itemIds?: number[]) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        branch: true
      }
    });

    if (!order || !order.branchId) {
      throw new BadRequestError('Sipariş bulunamadı veya şube bilgisi eksik');
    }

    const itemsToProcess = itemIds 
      ? order.orderItems.filter(item => itemIds.includes(item.id))
      : order.orderItems;

    for (const item of itemsToProcess) {
      if (item.product.stockTracking) {
        const stock = await prisma.stock.findFirst({
          where: {
            productId: item.productId,
            branchId: order.branchId
          }
        });

        if (!stock) {
          throw new BadRequestError(`${item.product.name} için stok kaydı bulunamadı`);
        }

        await this.updateStockQuantity(stock.id, {
          quantity: Number(item.quantity),
          type: 'IN',
          notes: `Sipariş iptali: #${order.id}`
        });

        // Stok güncellemesi sonrası event gönder
        SocketService.emitToRoom(`branch_${order.branchId}`, SOCKET_EVENTS.STOCK_UPDATED, {
          stockId: stock.id,
          productId: item.productId,
          orderId: order.id,
          type: 'IN',
          quantity: Number(item.quantity)
        });
      }
    }
  }

  // Diğer metodlar (threshold alerts, expiring stock, movements vb.)
}
