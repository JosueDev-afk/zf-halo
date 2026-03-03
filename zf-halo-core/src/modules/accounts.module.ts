import { Module } from '@nestjs/common';
import { AccountController } from '../infrastructure/http/controllers/account.controller';
import { SubmitRegistrationUseCase } from '../application/use-cases/accounts/submit-registration.use-case';
import { ApproveAccountUseCase } from '../application/use-cases/accounts/approve-account.use-case';
import { GetAccountRequestsUseCase } from '../application/use-cases/accounts/get-account-requests.use-case';
import { PrismaAccountRequestRepository } from '../infrastructure/persistence/prisma/account-request.prisma.repository';

@Module({
  controllers: [AccountController],
  providers: [
    SubmitRegistrationUseCase,
    ApproveAccountUseCase,
    GetAccountRequestsUseCase,
    {
      provide: 'AccountRequestRepository',
      useClass: PrismaAccountRequestRepository,
    },
  ],
  exports: [SubmitRegistrationUseCase],
})
export class AccountsModule {}
