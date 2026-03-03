import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';

import { AuthModule } from './modules/auth.module';
import { UsersModule } from './modules/users.module';
import { AssetsModule } from './modules/assets.module';
import { LoansModule } from './modules/loans.module';
import { NotificationsModule } from './modules/notifications.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsModule } from './modules/accounts.module';
import { DestinationsModule } from './modules/destinations.module';
import { DashboardModule } from './modules/dashboard.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    ...(process.env.NODE_ENV === 'test'
      ? []
      : [
          BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
              connection: {
                host: config.get<string>('REDIS_HOST', 'redis'),
                port: config.get<number>('REDIS_PORT', 6379),
              },
            }),
          }),
        ]),
    // Rate limiting (300 requests per 60 seconds)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 300,
      },
    ]),
    // Database
    PrismaModule,
    // Features
    AuthModule,
    UsersModule,
    AssetsModule,
    AccountsModule,
    LoansModule,
    DestinationsModule,
    NotificationsModule,
    DashboardModule,
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
