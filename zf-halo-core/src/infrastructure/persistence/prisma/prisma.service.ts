import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@generated/prisma';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pgPool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL || '';
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pgPool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    // Explicitly end the pg pool to prevent hanging handles in testing
    await this.pgPool.end();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;

    // Deletion order matters due to foreign key constraints
    await this.$transaction([
      this.internalNotification.deleteMany(),
      this.loan.deleteMany(),
      this.accountRequest.deleteMany(),
      this.asset.deleteMany(),
      this.destination.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
