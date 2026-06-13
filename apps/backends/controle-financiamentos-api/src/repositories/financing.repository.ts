import { Injectable } from '@nestjs/common';
import { Financing, Prisma } from '../prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinancingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUser(userId: string): Promise<Financing[]> {
    return this.prisma.financing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByIdForUser(id: string, userId: string): Promise<Financing | null> {
    return this.prisma.financing.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  save(data: Prisma.FinancingCreateInput): Promise<Financing> {
    return this.prisma.financing.create({ data });
  }

  update(
    id: string,
    userId: string,
    data: Prisma.FinancingUpdateInput,
  ): Promise<Financing | null> {
    const existing = this.findByIdForUser(id, userId);
    return existing.then((financing) => {
      if (!financing) {
        return null;
      }

      return this.prisma.financing.update({
        where: { id: financing.id },
        data,
      });
    });
  }

  delete(id: string, userId: string): Promise<Financing | null> {
    const existing = this.findByIdForUser(id, userId);
    return existing.then((financing) => {
      if (!financing) {
        return null;
      }

      return this.prisma.financing.delete({
        where: { id: financing.id },
      });
    });
  }
}
