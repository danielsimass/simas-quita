import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client';
import { resolveDatabaseUrl } from './resolve-database-url';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    const configuredUrl = configService.get<string>('DATABASE_URL') ?? 'file:./prisma/dev.db';
    const databaseUrl = resolveDatabaseUrl(configuredUrl);
    const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
