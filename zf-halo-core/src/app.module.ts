import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { Role } from '@generated/prisma';
import { AuthModule } from './modules/auth.module';
import { UsersModule } from './modules/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountController } from './infrastructure/http/controllers/account.controller';
import { SubmitRegistrationUseCase } from './application/use-cases/accounts/submit-registration.use-case';
import { ApproveAccountUseCase } from './application/use-cases/accounts/approve-account.use-case';
import { GetAccountRequestsUseCase } from './application/use-cases/accounts/get-account-requests.use-case';
import { PrismaAccountRequestRepository } from './infrastructure/persistence/prisma/account-request.prisma.repository';

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
        // Features
        AuthModule,
        UsersModule,
    ],
    controllers: [AppController, AccountController],
    providers: [
        AppService,
        SubmitRegistrationUseCase,
        ApproveAccountUseCase,
        GetAccountRequestsUseCase,
        {
            provide: 'AccountRequestRepository',
            useClass: PrismaAccountRequestRepository,
        },
        // Global rate limiting guard
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
