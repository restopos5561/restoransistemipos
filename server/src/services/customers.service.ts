import { prisma } from '../app';
import { BadRequestError } from '../errors/common-errors';
import { CreateCustomerInput, UpdateCustomerInput } from '../schemas/customer.schema';
import { Prisma } from '@prisma/client';

export class CustomersService {
  async getCustomers(params: {
    search?: string;
    phoneNumber?: string;
    email?: string;
    page: number;
    limit: number;
    restaurantId: number;
  }) {
    const { search, phoneNumber, email, page, limit, restaurantId } = params;
    console.log('Getting customers with params:', params);
    
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      restaurantId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { phoneNumber: { contains: search } },
          { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
      ...(phoneNumber && { phoneNumber }),
      ...(email && { email }),
    };

    console.log('Prisma where clause:', where);

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.customer.count({ where }),
    ]);

    console.log('Found customers:', customers);
    console.log('Total count:', total);

    return {
      success: true,
      data: {
        customers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async createCustomer(data: CreateCustomerInput) {
    return prisma.customer.create({ data });
  }

  async getCustomerById(id: number) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new BadRequestError(id);
    return customer;
  }

  async updateCustomer(id: number, data: UpdateCustomerInput) {
    await this.getCustomerById(id);
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  async deleteCustomer(id: number) {
    await this.getCustomerById(id);
    await prisma.customer.delete({ where: { id } });
  }

  async getCustomerOrders(id: number) {
    await this.getCustomerById(id);
    return prisma.order.findMany({
      where: { customerId: id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}
