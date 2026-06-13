import { Injectable } from '@nestjs/common';
import { Prepayment, Prisma } from '../prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrepaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByFinancingForUser(financingId: string, userId: string): Promise<Prepayment[]> {
    return this.prisma.prepayment.findMany({
      where: {
        financingId,
        financing: { userId },
      },
      orderBy: { date: 'asc' },
    });
  }

  findByIdForUser(id: string, userId: string): Promise<Prepayment | null> {
    return this.prisma.prepayment.findFirst({
      where: {
        id,
        financing: { userId },
      },
    });
  }

  save(data: Prisma.PrepaymentCreateInput): Promise<Prepayment> {
    return this.prisma.prepayment.create({ data });
  }

  update(
    id: string,
    userId: string,
    data: Prisma.PrepaymentUpdateInput,
  ): Promise<Prepayment | null> {
    const existing = this.findByIdForUser(id, userId);
    return existing.then((prepayment) => {
      if (!prepayment) {
        return null;
      }

      return this.prisma.prepayment.update({
        where: { id: prepayment.id },
        data,
      });
    });
  }

  delete(id: string, userId: string): Promise<Prepayment | null> {
    const existing = this.findByIdForUser(id, userId);
    return existing.then((prepayment) => {
      if (!prepayment) {
        return null;
      }

      return this.prisma.prepayment.delete({
        where: { id: prepayment.id },
      });
    });
  }
}
