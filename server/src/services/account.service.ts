import { Account, AccountType, AccountTransaction, TransactionType } from '@prisma/client';
import { prisma } from '../config/database';
import { BadRequestError } from '../errors/bad-request-error';

interface AccountFilters {
  accountType?: AccountType;
  supplierId?: number;
  customerId?: number;
  restaurantId?: number;
  page?: number;
  limit?: number;
}

interface CreateAccountInput {
  restaurantId: number;
  accountName: string;
  accountType: AccountType;
  creditLimit?: number;
  supplierId?: number;
  customerId?: number;
}

interface UpdateAccountInput {
  accountName?: string;
  accountType?: AccountType;
  creditLimit?: number;
}

export class AccountService {
  async getAccounts(filters: AccountFilters) {
    const where = {
      ...(filters.accountType && { accountType: filters.accountType }),
      ...(filters.supplierId && { supplierId: filters.supplierId }),
      ...(filters.customerId && { customerId: filters.customerId }),
      ...(filters.restaurantId && { restaurantId: filters.restaurantId }),
    };

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        include: {
          supplier: true,
          customer: true,
        },
        skip: ((filters.page || 1) - 1) * (filters.limit || 10),
        take: filters.limit || 10,
        orderBy: {
          accountName: 'asc',
        },
      }),
      prisma.account.count({ where }),
    ]);

    return {
      accounts,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async createAccount(data: CreateAccountInput): Promise<Account> {
    // Aynı isimde hesap var mı kontrol et
    const existingAccount = await prisma.account.findFirst({
      where: {
        restaurantId: data.restaurantId,
        accountName: data.accountName,
      },
    });

    if (existingAccount) {
      throw new BadRequestError('Bu isimde bir hesap zaten mevcut');
    }

    // Tedarikçi/Müşteri kontrolü
    if (data.accountType === 'SUPPLIER' && !data.supplierId) {
      throw new BadRequestError('Tedarikçi hesabı için supplierId gerekli');
    }
    if (data.accountType === 'CUSTOMER' && !data.customerId) {
      throw new BadRequestError('Müşteri hesabı için customerId gerekli');
    }

    return prisma.account.create({
      data: {
        ...data,
        balance: 0,
      },
      include: {
        supplier: true,
        customer: true,
      },
    });
  }

  async getAccountById(id: number, restaurantId: number): Promise<Account | null> {
    return prisma.account.findFirst({
      where: { 
        id,
        restaurantId
      },
      include: {
        supplier: true,
        customer: true,
        transactions: {
          orderBy: {
            date: 'desc',
          },
          take: 10, // Son 10 işlem
        },
      },
    });
  }

  async updateAccount(id: number, data: UpdateAccountInput): Promise<Account> {
    // Önce hesabı bul ve restaurantId'yi al
    const existingAccount = await prisma.account.findUnique({
      where: { id },
      select: { restaurantId: true }
    });

    if (!existingAccount) {
      throw new BadRequestError('Hesap bulunamadı');
    }

    const account = await this.getAccountById(id, existingAccount.restaurantId);
    if (!account) {
      throw new BadRequestError('Hesap bulunamadı');
    }

    // İsim değişiyorsa, aynı isimde başka hesap var mı kontrol et
    if (data.accountName && data.accountName !== account.accountName) {
      const existingNameAccount = await prisma.account.findFirst({
        where: {
          restaurantId: account.restaurantId,
          accountName: data.accountName,
          id: { not: id },
        },
      });

      if (existingNameAccount) {
        throw new BadRequestError('Bu isimde bir hesap zaten mevcut');
      }
    }

    return prisma.account.update({
      where: { id },
      data,
      include: {
        supplier: true,
        customer: true,
      },
    });
  }

  async deleteAccount(id: number): Promise<void> {
    // Önce hesabı bul ve restaurantId'yi al
    const existingAccount = await prisma.account.findUnique({
      where: { id },
      select: { restaurantId: true }
    });

    if (!existingAccount) {
      throw new BadRequestError('Hesap bulunamadı');
    }

    const account = await this.getAccountById(id, existingAccount.restaurantId);
    if (!account) {
      throw new BadRequestError('Hesap bulunamadı');
    }

    // Hesap hareketleri varsa silmeye izin verme
    const transactionCount = await prisma.accountTransaction.count({
      where: { accountId: id },
    });

    if (transactionCount > 0) {
      throw new BadRequestError('Hesap hareketleri olan bir hesap silinemez');
    }

    await prisma.account.delete({ where: { id } });
  }

  async getAccountBalance(filters: {
    id?: number;
    accountType?: AccountType;
    restaurantId?: number;
  }) {
    // Filtre yoksa restaurant ID'yi zorunlu yapalım
    if (!filters.id && !filters.accountType && !filters.restaurantId) {
      throw new BadRequestError('restaurantId parametresi zorunludur');
    }

    const where = {
      ...(filters.id && { id: filters.id }),
      ...(filters.accountType && { accountType: filters.accountType }),
      ...(filters.restaurantId && { restaurantId: filters.restaurantId }),
    };

    const accounts = await prisma.account.findMany({
      where,
      select: {
        id: true,
        accountName: true,
        accountType: true,
        balance: true,
      },
    });

    if (accounts.length === 0) {
      throw new BadRequestError('Hesap bulunamadı');
    }

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    return {
      totalBalance,
      accounts,
    };
  }
}
