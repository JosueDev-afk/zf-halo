import { Module } from '@nestjs/common';
import { LoanController } from '../infrastructure/http/controllers/loan.controller';
import { RequestLoanUseCase } from '../application/use-cases/loans/request-loan.use-case';
import { AuthorizeLoanUseCase } from '../application/use-cases/loans/authorize-loan.use-case';
import { CheckOutLoanUseCase } from '../application/use-cases/loans/checkout-loan.use-case';
import { CheckInLoanUseCase } from '../application/use-cases/loans/checkin-loan.use-case';
import { GetLoansUseCase } from '../application/use-cases/loans/get-loans.use-case';
import { GetLoanByIdUseCase } from '../application/use-cases/loans/get-loan-by-id.use-case';
import { FolioGeneratorService } from '../domain/services/folio-generator.service';
import { LOAN_REPOSITORY } from '../domain/repositories/loan.repository.interface';
import { LoanPrismaRepository } from '../infrastructure/persistence/prisma/loan.prisma.repository';
import { AssetsModule } from './assets.module';
import { AuthModule } from './auth.module';
import { PrismaModule } from '../infrastructure/persistence/prisma/prisma.module';
import { OverdueCheckService } from '../infrastructure/cron/overdue-check.service';

@Module({
  imports: [PrismaModule, AssetsModule, AuthModule],
  controllers: [LoanController],
  providers: [
    {
      provide: LOAN_REPOSITORY,
      useClass: LoanPrismaRepository,
    },
    FolioGeneratorService,
    RequestLoanUseCase,
    AuthorizeLoanUseCase,
    CheckOutLoanUseCase,
    CheckInLoanUseCase,
    GetLoansUseCase,
    GetLoanByIdUseCase,
    OverdueCheckService,
  ],
  exports: [LOAN_REPOSITORY],
})
export class LoansModule {}
