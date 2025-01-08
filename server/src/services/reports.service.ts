import { PrismaClient, Role, PaymentMethod, Prisma } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

interface SalesByCategory {
  categoryId: number;
  categoryName: string;
  itemCount: number;
  totalSales: number;
}

interface ProductSaleData {
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
  salesByBranch: Record<
    number,
    {
      branchId: number;
      branchName: string;
      quantity: number;
      revenue: number;
    }
  >;
}

interface ProductAnalysis {
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
  orderCount: Set<number>;
  averageUnitPrice: number;
  salesByBranch: Record<
    number,
    {
      branchId: number;
      branchName: string;
      quantity: number;
      revenue: number;
    }
  >;
  salesByMonth: Record<
    string,
    {
      month: string;
      quantity: number;
      revenue: number;
    }
  >;
}

export class ReportsService {
  // Günlük Satış Raporu
  async getDailySalesReport(date: Date, branchId?: number) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const where = {
      orderTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      ...(branchId && { branchId }),
    };

    const [orders, payments, orderItems] = await Promise.all([
      // Siparişleri getir
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          payment: true,
          customer: true,
        },
      }),
      // Ödemeleri getir
      prisma.payment.findMany({
        where: {
          order: {
            orderTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
            ...(branchId && { branchId }),
          },
        },
      }),
      // Ürün satışlarını getir
      prisma.orderItem.findMany({
        where: {
          order: {
            orderTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
            ...(branchId && { branchId }),
          },
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      }),
    ]);

    // Toplam satış tutarı
    const totalSales = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    // Benzersiz müşteri sayısı
    const uniqueCustomers = new Set(orders.map((order) => order.customerId).filter(Boolean)).size;

    // Ortalama sipariş tutarı
    const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

    // En çok satan ürünler
    const productSales = orderItems.reduce<Record<number, ProductSaleData>>((acc, item) => {
      if (!item?.product?.id) return acc;

      const key = item.product.id;
      if (!acc[key]) {
        acc[key] = {
          productId: item.product.id,
          productName: item.product.name,
          categoryId: item.product.categoryId || 0,
          categoryName: item.product.category?.name || 'Kategorisiz',
          quantitySold: 0,
          totalRevenue: 0,
          salesByBranch: {},
        };
      }

      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      acc[key].quantitySold += quantity;
      acc[key].totalRevenue += quantity * unitPrice;

      return acc;
    }, {});

    // Ödeme yöntemlerine göre satışlar
    const salesByPaymentMethod = payments.reduce(
      (acc, payment) => {
        const method = payment.paymentMethod;
        acc[method] = (acc[method] || 0) + Number(payment.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    // İndirim hesaplama
    const discountsTotal = orders.reduce((sum, order) => {
      const beforeDiscounts = Number(order.totalPriceBeforeDiscounts);
      const afterDiscounts = Number(order.totalAmount);
      return sum + (beforeDiscounts - afterDiscounts);
    }, 0);

    return {
      success: true,
      data: {
        reportDate: date.toISOString().split('T')[0],
        totalSales,
        totalOrders: orders.length,
        totalCustomers: uniqueCustomers,
        averageOrderValue,
        topSellingProducts: Object.values(productSales)
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 10),
        salesByPaymentMethod,
        discountsTotal,
        taxesTotal: totalSales * 0.18, // Örnek KDV hesaplaması
      },
    };
  }

  // Aylık Satış Raporu
  async getMonthlySalesReport(month: number, year: number, branchId?: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const where = {
      orderTime: {
        gte: startDate,
        lte: endDate,
      },
      ...(branchId && { branchId }),
    };

    const [orders, payments, orderItems] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          payment: true,
          customer: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          order: where,
        },
      }),
      prisma.orderItem.findMany({
        where: {
          order: where,
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
          order: {
            include: {
              branch: true,
            },
          },
        },
      }),
    ]);

    // Toplam satış tutarı
    const totalSales = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    // Benzersiz müşteri sayısı
    const uniqueCustomers = new Set(orders.map((order) => order.customerId).filter(Boolean)).size;

    // Ürün satışları analizi
    const productAnalysis = orderItems.reduce<Record<number, ProductSaleData>>((acc, item) => {
      if (!item?.product?.id) return acc;

      const key = item.product.id;
      if (!acc[key]) {
        acc[key] = {
          productId: item.product.id,
          productName: item.product.name,
          categoryId: item.product.categoryId || 0,
          categoryName: item.product.category?.name || 'Kategorisiz',
          quantitySold: 0,
          totalRevenue: 0,
          salesByBranch: {},
        };
      }

      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      acc[key].quantitySold += quantity;
      acc[key].totalRevenue += quantity * unitPrice;

      // Şube bazlı satışlar
      if (item.order?.branchId) {
        const branchId = item.order.branchId;
        if (!acc[key].salesByBranch[branchId]) {
          acc[key].salesByBranch[branchId] = {
            branchId,
            branchName: item.order.branch?.name || 'Bilinmeyen Şube',
            quantity: 0,
            revenue: 0,
          };
        }
        acc[key].salesByBranch[branchId].quantity += quantity;
        acc[key].salesByBranch[branchId].revenue += quantity * unitPrice;
      }

      return acc;
    }, {});

    return {
      success: true,
      data: {
        year,
        month,
        totalSales,
        totalOrders: orders.length,
        totalCustomers: uniqueCustomers,
        averageOrderValue: orders.length > 0 ? totalSales / orders.length : 0,
        topProducts: Object.values(productAnalysis)
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 10),
      },
    };
  }

  // Yıllık Satış Raporu
  async getYearlySalesReport(year: number, branchId?: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    const monthlySales: Record<number, any> = {};
    let totalYearlySales = 0;
    let totalOrders = 0;
    const totalCustomers = new Set();

    // Her ay için veri topla
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const monthlyData = await this.getMonthlySalesReport(month + 1, year, branchId);

      if (monthlyData.success && monthlyData.data) {
        monthlySales[month + 1] = monthlyData.data;
        totalYearlySales += monthlyData.data.totalSales || 0;
        totalOrders += monthlyData.data.totalOrders || 0;
        if (monthlyData.data.totalCustomers) {
          totalCustomers.add(monthlyData.data.totalCustomers);
        }
      }
    }

    // Çeyrek dönem verilerini hesapla
    const quarterData = {
      Q1: this.calculateQuarterData(monthlySales, [1, 2, 3]),
      Q2: this.calculateQuarterData(monthlySales, [4, 5, 6]),
      Q3: this.calculateQuarterData(monthlySales, [7, 8, 9]),
      Q4: this.calculateQuarterData(monthlySales, [10, 11, 12]),
    };

    return {
      success: true,
      data: {
        year,
        totalYearlySales,
        totalOrders,
        totalCustomers: totalCustomers.size,
        averageOrderValue: totalOrders > 0 ? totalYearlySales / totalOrders : 0,
        monthlySales,
        quarterData,
      },
    };
  }

  private calculateQuarterData(monthlySales: Record<number, any>, months: number[]) {
    return {
      totalSales: months.reduce((sum, month) => sum + (monthlySales[month]?.totalSales || 0), 0),
      orderCount: months.reduce((sum, month) => sum + (monthlySales[month]?.orderCount || 0), 0),
      customerCount: months.reduce(
        (sum, month) => sum + (monthlySales[month]?.customerCount || 0),
        0
      ),
    };
  }

  // Ürün Bazlı Satış Raporu
  async getProductSalesReport(
    startDate: Date,
    endDate: Date,
    filters: {
      productId?: number;
      categoryId?: number;
      branchId?: number;
    }
  ) {
    const where = {
      orderTime: {
        gte: startDate,
        lte: endDate,
      },
      ...(filters.branchId && { branchId: filters.branchId }),
    };

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: where,
        ...(filters.productId && { productId: filters.productId }),
        ...(filters.categoryId && {
          product: {
            categoryId: filters.categoryId,
          },
        }),
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
        order: {
          include: {
            branch: true,
          },
        },
      },
      orderBy: {
        order: {
          orderTime: 'asc',
        },
      },
    });

    const analysis = await this.getProductAnalysis(orderItems);

    return {
      success: true,
      data: {
        products: analysis,
        summary: {
          totalRevenue: analysis.reduce((sum, p) => sum + p.totalRevenue, 0),
          totalQuantity: analysis.reduce((sum, p) => sum + p.quantitySold, 0),
          averageOrderValue:
            analysis.reduce((sum, p) => sum + p.totalRevenue, 0) / analysis.length || 0,
        },
      },
    };
  }

  // Personel Performans Raporu
  async getStaffPerformanceReport(
    startDate: Date,
    endDate: Date,
    filters: {
      branchId?: number;
      role?: Role;
    }
  ) {
    const employees = await prisma.user.findMany({
      where: {
        branchId: filters.branchId,
        role: filters.role as Role,
      },
      include: {
        branch: true,
      },
    });

    const staffAnalysis = employees.reduce(
      (acc, employee) => {
        acc[employee.id] = {
          staffId: employee.id,
          name: employee.name,
          role: employee.role,
          branchName: employee.branch?.name || 'Bilinmeyen Şube',
          totalOrders: 0,
          totalSales: 0,
          totalItems: 0,
          serviceSpeed: [] as number[],
          averageServiceTime: 0,
          topSellingProducts: {},
          ordersByHour: new Array(24).fill(0),
        };
        return acc;
      },
      {} as Record<number, any>
    );

    // Siparişleri getir
    const orders = await prisma.order.findMany({
      where: {
        waiterId: { not: null },
        ...(filters.branchId && { branchId: filters.branchId }),
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        payment: true,
        waiter: true,
        table: true,
      },
    });

    // Siparişleri analiz et
    orders.forEach((order) => {
      if (!order.waiterId || !staffAnalysis[order.waiterId]) return;

      const staff = staffAnalysis[order.waiterId];
      staff.totalOrders++;
      staff.totalSales += Number(order.totalAmount);

      // Servis hızını hesapla
      if (order.preparationStartTime && order.preparationEndTime) {
        const preparationTime =
          new Date(order.preparationEndTime).getTime() -
          new Date(order.preparationStartTime).getTime();
        staff.serviceSpeed.push(preparationTime / 1000 / 60);
      }

      // Sipariş içeriğini analiz et
      order.orderItems.forEach((item) => {
        staff.totalItems += item.quantity;

        // En çok satılan ürünleri güncelle
        const productKey = item.productId;
        if (!staff.topSellingProducts[productKey]) {
          staff.topSellingProducts[productKey] = {
            productId: item.productId,
            productName: item.product.name,
            quantity: 0,
            revenue: 0,
          };
        }
        staff.topSellingProducts[productKey].quantity += item.quantity;
        staff.topSellingProducts[productKey].revenue += Number(item.unitPrice) * item.quantity;
      });

      // Saat bazlı dağılımı güncelle
      const orderHour = new Date(order.orderTime).getHours();
      staff.ordersByHour[orderHour]++;

      // Servis hızını hesapla
      if (order.preparationStartTime && order.preparationEndTime) {
        const preparationTime =
          new Date(order.preparationEndTime).getTime() -
          new Date(order.preparationStartTime).getTime();
        staff.serviceSpeed.push(preparationTime / 1000 / 60); // Dakika cinsinden
      }
    });

    // Son hesaplamaları yap
    Object.values(staffAnalysis).forEach((staff: any) => {
      staff.averageOrderValue = staff.totalOrders > 0 ? staff.totalSales / staff.totalOrders : 0;

      staff.averageServiceTime =
        staff.serviceSpeed.length > 0
          ? staff.serviceSpeed.reduce((a: number, b: number) => a + b, 0) /
            staff.serviceSpeed.length
          : 0;

      staff.topSellingProducts = Object.values(staff.topSellingProducts)
        .sort((a: any, b: any) => b.quantity - a.quantity)
        .slice(0, 5);

      delete staff.serviceSpeed; // Ham veriyi temizle
    });

    // Şube bazlı özet
    const branchSummary = Object.values(staffAnalysis).reduce(
      (acc, staff: any) => {
        const key = staff.branchId;
        if (!acc[key]) {
          acc[key] = {
            branchId: staff.branchId,
            branchName: staff.branchName,
            totalStaff: 0,
            totalOrders: 0,
            totalSales: 0,
            averageOrdersPerStaff: 0,
          };
        }
        acc[key].totalStaff++;
        acc[key].totalOrders += staff.totalOrders;
        acc[key].totalSales += staff.totalSales;
        return acc;
      },
      {} as Record<number, any>
    );

    // Şube ortalamalarını hesapla
    Object.values(branchSummary).forEach((branch: any) => {
      branch.averageOrdersPerStaff = branch.totalOrders / branch.totalStaff;
    });

    return {
      success: true,
      data: {
        dateRange: {
          start: startDate,
          end: endDate,
        },
        staffPerformance: Object.values(staffAnalysis).sort(
          (a: any, b: any) => b.totalSales - a.totalSales
        ),
        branchSummary: Object.values(branchSummary),
        overallStats: {
          totalStaff: employees.length,
          totalOrders: Object.values(staffAnalysis).reduce(
            (sum: number, s: any) => sum + s.totalOrders,
            0
          ),
          totalSales: Object.values(staffAnalysis).reduce(
            (sum: number, s: any) => sum + s.totalSales,
            0
          ),
          averageOrdersPerStaff:
            Object.values(staffAnalysis).reduce((sum: number, s: any) => sum + s.totalOrders, 0) /
            employees.length,
        },
      },
    };
  }

  // Masa Bazlı Rapor
  async getTableReport(
    startDate: Date,
    endDate: Date,
    filters: {
      branchId?: number;
      tableId?: number;
    }
  ) {
    const where = {
      orderTime: {
        gte: startDate,
        lte: endDate,
      },
      tableId: { not: null },
      ...(filters.branchId && { branchId: filters.branchId }),
      ...(filters.tableId && { tableId: filters.tableId }),
    };

    // Masaları getir
    const tables = await prisma.table.findMany({
      where: {
        ...(filters.branchId && { branchId: filters.branchId }),
        ...(filters.tableId && { id: filters.tableId }),
      },
      include: {
        branch: true,
      },
    });

    // Siparişleri getir
    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        payment: true,
        table: true,
        waiter: true,
      },
    });

    // Masa bazlı analiz
    const tableAnalysis = tables.reduce(
      (acc, table) => {
        acc[table.id] = {
          tableId: table.id,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          branchId: table.branchId,
          branchName: table.branch?.name || 'Bilinmeyen Şube',
          totalOrders: 0,
          totalSales: 0,
          totalCustomers: 0,
          averageOrderValue: 0,
          turnoverRate: 0, // Masa devir hızı
          peakHours: new Array(24).fill(0),
          averageOccupancyTime: 0,
          topSellingItems: {},
          ordersByDay: {}, // Günlük sipariş dağılımı
        };
        return acc;
      },
      {} as Record<number, any>
    );

    // Siparişleri analiz et
    orders.forEach((order) => {
      if (!order.tableId || !tableAnalysis[order.tableId]) return;

      const table = tableAnalysis[order.tableId];
      table.totalOrders++;

      // Müşteri sayısını güncelle
      if (order.customerCount) {
        table.totalCustomers += order.customerCount;
      }

      // Toplam satışı güncelle
      table.totalSales += Number(order.totalAmount);

      // Masa kullanım süresini hesapla
      if (order.openingTime && order.closingTime) {
        const occupancyTime =
          new Date(order.closingTime).getTime() - new Date(order.openingTime).getTime();
        table.averageOccupancyTime += occupancyTime / (1000 * 60); // Dakika cinsinden
      }

      // Saat bazlı dağılımı güncelle
      const orderHour = new Date(order.orderTime).getHours();
      table.peakHours[orderHour]++;

      // Günlük dağılımı güncelle
      const dateKey = order.orderTime.toISOString().split('T')[0];
      if (!table.ordersByDay[dateKey]) {
        table.ordersByDay[dateKey] = {
          date: dateKey,
          orderCount: 0,
          sales: 0,
        };
      }
      table.ordersByDay[dateKey].orderCount++;
      if (order.payment) {
        table.ordersByDay[dateKey].sales += Number(order.payment.amount);
      }

      // En çok satılan ürünleri güncelle
      order.orderItems.forEach((item) => {
        const productKey = item.productId;
        if (!table.topSellingItems[productKey]) {
          table.topSellingItems[productKey] = {
            productId: item.productId,
            productName: item.product.name,
            quantity: 0,
            revenue: 0,
          };
        }
        table.topSellingItems[productKey].quantity += item.quantity;
        table.topSellingItems[productKey].revenue += Number(item.unitPrice) * item.quantity;
      });
    });

    // Son hesaplamaları yap
    Object.values(tableAnalysis).forEach((table: any) => {
      // Ortalama sipariş değeri
      table.averageOrderValue = table.totalOrders > 0 ? table.totalSales / table.totalOrders : 0;

      // Ortalama masa kullanım süresi
      table.averageOccupancyTime =
        table.totalOrders > 0 ? table.averageOccupancyTime / table.totalOrders : 0;

      // Masa devir hızı (günlük ortalama sipariş sayısı)
      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      table.turnoverRate = table.totalOrders / totalDays;

      // En çok satılan ürünleri sırala
      table.topSellingItems = Object.values(table.topSellingItems)
        .sort((a: any, b: any) => b.quantity - a.quantity)
        .slice(0, 5);

      // Günlük dağılımı array'e çevir
      table.ordersByDay = Object.values(table.ordersByDay).sort((a: any, b: any) =>
        a.date.localeCompare(b.date)
      );
    });

    return {
      success: true,
      data: {
        dateRange: {
          start: startDate,
          end: endDate,
        },
        tables: Object.values(tableAnalysis).sort((a: any, b: any) => b.totalSales - a.totalSales),
        overallStats: {
          totalTables: tables.length,
          totalOrders: Object.values(tableAnalysis).reduce(
            (sum: number, t: any) => sum + t.totalOrders,
            0
          ),
          totalSales: Object.values(tableAnalysis).reduce(
            (sum: number, t: any) => sum + t.totalSales,
            0
          ),
          averageOrdersPerTable:
            Object.values(tableAnalysis).reduce((sum: number, t: any) => sum + t.totalOrders, 0) /
            tables.length,
          averageTurnoverRate:
            Object.values(tableAnalysis).reduce((sum: number, t: any) => sum + t.turnoverRate, 0) /
            tables.length,
        },
      },
    };
  }

  // İndirim hesaplama düzeltmesi
  private calculateDiscount(order: any): number {
    const beforeDiscounts = Number(order.totalPriceBeforeDiscounts || 0);
    const afterDiscounts = Number(order.totalAmount || 0);
    return beforeDiscounts - afterDiscounts;
  }

  // Kategori bazlı satışlar düzeltmesi
  private async getCategorySales(orderItems: any[]): Promise<SalesByCategory[]> {
    const categorySales = new Map<number, SalesByCategory>();

    for (const item of orderItems) {
      const categoryId = item.product?.categoryId;
      if (!categoryId) continue;

      if (!categorySales.has(categoryId)) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        });

        if (!category) continue;

        categorySales.set(categoryId, {
          categoryId: category.id,
          categoryName: category.name,
          itemCount: 0,
          totalSales: 0,
        });
      }

      const analysis = categorySales.get(categoryId)!;
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      analysis.itemCount += quantity;
      analysis.totalSales += quantity * unitPrice;
    }

    return Array.from(categorySales.values());
  }

  // Ürün satışları düzeltmesi
  private getProductSales(orderItems: any[]): ProductSaleData[] {
    const salesMap = new Map<number, ProductSaleData>();

    for (const item of orderItems) {
      if (!item?.product?.id) continue;

      const product = item.product;
      const branchId = item.order?.branchId;
      const branchName = item.order?.branch?.name || 'Bilinmeyen Şube';

      if (!salesMap.has(product.id)) {
        salesMap.set(product.id, {
          productId: product.id,
          productName: product.name,
          categoryId: product.categoryId || 0,
          categoryName: product.category?.name || 'Kategorisiz',
          quantitySold: 0,
          totalRevenue: 0,
          salesByBranch: {},
        });
      }

      const productData = salesMap.get(product.id)!;
      const quantity = Number(item.quantity || 0);
      const revenue = Number(item.unitPrice || 0) * quantity;

      productData.quantitySold += quantity;
      productData.totalRevenue += revenue;

      if (branchId) {
        if (!productData.salesByBranch[branchId]) {
          productData.salesByBranch[branchId] = {
            branchId,
            branchName,
            quantity: 0,
            revenue: 0,
          };
        }
        productData.salesByBranch[branchId].quantity += quantity;
        productData.salesByBranch[branchId].revenue += revenue;
      }
    }

    return Array.from(salesMap.values());
  }

  // Ürün analizi düzeltmesi
  private async getProductAnalysis(orderItems: any[]) {
    const salesMap = new Map<number, ProductSaleData>();

    for (const item of orderItems) {
      if (!item?.product?.id) continue;

      const key = item.product.id;
      if (!salesMap.has(key)) {
        const product = await prisma.product.findUnique({
          where: { id: key },
          include: { category: true },
        });

        if (!product) continue;

        salesMap.set(key, {
          productId: product.id,
          productName: product.name,
          categoryId: product.categoryId || 0,
          categoryName: product.category?.name || 'Kategorisiz',
          quantitySold: 0,
          totalRevenue: 0,
          salesByBranch: {},
        });
      }

      const productData = salesMap.get(key)!;
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      productData.quantitySold += quantity;
      productData.totalRevenue += quantity * unitPrice;

      // Şube bazlı satışlar
      if (item.order?.branchId) {
        const branchId = item.order.branchId;
        if (!productData.salesByBranch[branchId]) {
          productData.salesByBranch[branchId] = {
            branchId,
            branchName: item.order.branch?.name || 'Bilinmeyen Şube',
            quantity: 0,
            revenue: 0,
          };
        }
        productData.salesByBranch[branchId].quantity += quantity;
        productData.salesByBranch[branchId].revenue += quantity * unitPrice;
      }
    }

    return Array.from(salesMap.values());
  }
}
