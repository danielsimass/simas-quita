import { Injectable } from '@nestjs/common';
import { Installment, InstallmentStatus, Prisma } from '../prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InstallmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByFinancingForUser(
    financingId: string,
    userId: string,
    status?: InstallmentStatus,
  ): Promise<Installment[]> {
    return this.prisma.installment.findMany({
      where: {
        financingId,
        financing: { userId },
        ...(status ? { status } : {}),
      },
      orderBy: { number: 'asc' },
    });
  }

  findByIdForUser(id: string, userId: string): Promise<Installment | null> {
    return this.prisma.installment.findFirst({
      where: {
        id,
        financing: { userId },
      },
    });
  }

  save(data: Prisma.InstallmentCreateInput): Promise<Installment> {
    return this.prisma.installment.create({ data });
  }

  update(
    id: string,
    userId: string,
    data: Prisma.InstallmentUpdateInput,
  ): Promise<Installment | null> {
    const existing = this.findByIdForUser(id, userId);
    return existing.then((installment) => {
      if (!installment) {
        return null;
      }

      return this.prisma.installment.update({
        where: { id: installment.id },
        data,
      });
    });
  }

  delete(id: string, userId: string): Promise<Installment | null> {
    const existing = this.findByIdForUser(id, userId);
    return existing.then((installment) => {
      if (!installment) {
        return null;
      }

      return this.prisma.installment.delete({
        where: { id: installment.id },
      });
    });
  }

  replaceForFinancing(
    financingId: string,
    installments: Prisma.InstallmentCreateManyInput[],
  ): Promise<Installment[]> {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.installment.deleteMany({ where: { financingId } });

      if (installments.length > 0) {
        await transaction.installment.createMany({ data: installments });
      }

      return transaction.installment.findMany({
        where: { financingId },
        orderBy: { number: 'asc' },
      });
    });
  }
}
