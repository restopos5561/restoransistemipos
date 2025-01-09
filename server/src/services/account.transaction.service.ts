import { PrismaClient, TransactionType, AccountTransaction } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

const prisma = new PrismaClient();

interface CreateTransactionInput {
  accountId: number;
  type: TransactionType;
  amount: number;
  description: string;
}

export class AccountTransactionService {
  async createTransaction(data: CreateTransactionInput) {
    const account = await prisma.account.findUnique({
      where: { id: data.accountId },
    });

    if (!account) {
      throw new BadRequestError('Hesap bulunamadı');
    }

    return prisma.$transaction(async (tx) => {
      // İşlemi oluştur
      const transaction = await tx.accountTransaction.create({
        data: {
          accountId: data.accountId,
          type: data.type,
          amount: data.amount,
          description: data.description,
        },
      });

      // Hesap bakiyesini güncelle
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: data.type === 'CREDIT' ? data.amount : -data.amount,
          },
        },
      });

      return transaction;
    });
  }

  // Tüm işlemleri getir
  async getTransactions(filters: { accountId?: number; page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.accountId && { accountId: filters.accountId }),
    };

    const [transactions, total] = await Promise.all([
      prisma.accountTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: { account: true },
      }),
      prisma.accountTransaction.count({ where }),
    ]);

    return {
      data: transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ID'ye göre işlem getir
  async getTransactionById(id: number) {
    return prisma.accountTransaction.findUnique({
      where: { id },
      include: { account: true },
    });
  }

  // Hesaba göre işlemleri getir
  async getTransactionsByAccountId(accountId: number): Promise<AccountTransaction[]> {
    return prisma.accountTransaction.findMany({
      where: { accountId },
      orderBy: {
        date: 'desc'
      },
      include: {
        account: true
      }
    });
  }
}
