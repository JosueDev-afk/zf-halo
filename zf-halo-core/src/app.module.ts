import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { AuthModule } from './modules/auth.module';
import { UsersModule } from './modules/users.module';
import { AssetsModule } from './modules/assets.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsModule } from './modules/accounts.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate limiting (10 requests per 60 seconds)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    // Database
    PrismaModule,
    // Features
    AuthModule,
    UsersModule,
    AssetsModule,
    AccountsModule,
    PrometheusModule.register(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
