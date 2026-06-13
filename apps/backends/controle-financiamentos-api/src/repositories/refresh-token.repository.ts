import { Injectable } from '@nestjs/common';
import { Prisma, RefreshToken } from '../prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUser(userId: string): Promise<RefreshToken[]> {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: 'desc' },
    });
  }

  findActiveById(id: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({
      where: {
        id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  findByIdForUser(id: string, userId: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  save(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  revoke(id: string, userId: string): Promise<RefreshToken | null> {
    const existing = this.findByIdForUser(id, userId);
    return existing.then((token) => {
      if (!token) {
        return null;
      }

      return this.prisma.refreshToken.update({
        where: { id: token.id },
        data: { revokedAt: new Date() },
      });
    });
  }

  revokeById(id: string): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}
