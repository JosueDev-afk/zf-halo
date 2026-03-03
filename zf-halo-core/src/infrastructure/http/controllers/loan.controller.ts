/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { Permission } from '../../../domain/enums/permission.enum';
import { RequestLoanUseCase } from '../../../application/use-cases/loans/request-loan.use-case';
import { AuthorizeLoanUseCase } from '../../../application/use-cases/loans/authorize-loan.use-case';
import { CheckOutLoanUseCase } from '../../../application/use-cases/loans/checkout-loan.use-case';
import { CheckInLoanUseCase } from '../../../application/use-cases/loans/checkin-loan.use-case';
import { GetLoansUseCase } from '../../../application/use-cases/loans/get-loans.use-case';
import { GetLoanByIdUseCase } from '../../../application/use-cases/loans/get-loan-by-id.use-case';
import { CreateLoanDto } from '../../../application/dtos/loan/create-loan.dto';
import { AuthorizeLoanDto } from '../../../application/dtos/loan/authorize-loan.dto';
import { CheckOutLoanDto } from '../../../application/dtos/loan/checkout-loan.dto';
import { CheckInLoanDto } from '../../../application/dtos/loan/checkin-loan.dto';
import { GetLoansQueryDto } from '../../../application/dtos/loan/get-loans-query.dto';

@ApiTags('Loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('loans')
export class LoanController {
  constructor(
    private readonly requestLoanUseCase: RequestLoanUseCase,
    private readonly authorizeLoanUseCase: AuthorizeLoanUseCase,
    private readonly checkOutLoanUseCase: CheckOutLoanUseCase,
    private readonly checkInLoanUseCase: CheckInLoanUseCase,
    private readonly getLoansUseCase: GetLoansUseCase,
    private readonly getLoanByIdUseCase: GetLoanByIdUseCase,
  ) {}

  @Post()
  @RequirePermissions(Permission.LOAN_REQUEST)
  @ApiOperation({ summary: 'Request a new loan' })
  async requestLoan(@Req() req: any, @Body() dto: CreateLoanDto) {
    return this.requestLoanUseCase.execute(req.user.id, dto, req.user.role);
  }

  @Get()
  @RequirePermissions(Permission.LOAN_VIEW_OWN)
  @ApiOperation({ summary: 'List loans (filtered by role internally)' })
  async getLoans(@Req() req: any, @Query() query: GetLoansQueryDto) {
    const filters: Record<string, string> = {};
    if (req.user.role === 'USER') {
      filters.requesterId = req.user.id;
    }
    if (query.status) filters.status = query.status;
    if (query.requesterId && req.user.role !== 'USER') {
      filters.requesterId = query.requesterId;
    }
    return this.getLoansUseCase.execute(query, filters);
  }

  @Get(':id')
  @RequirePermissions(Permission.LOAN_VIEW_OWN)
  @ApiOperation({ summary: 'Get a loan by ID' })
  async getLoanById(@Param('id') id: string) {
    return this.getLoanByIdUseCase.execute(id);
  }

  @Patch(':id/authorize')
  @RequirePermissions(Permission.LOAN_APPROVE)
  @ApiOperation({ summary: 'Authorize a requested loan' })
  async authorizeLoan(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: AuthorizeLoanDto,
  ) {
    return this.authorizeLoanUseCase.execute(id, req.user.id, dto);
  }

  @Patch(':id/checkout')
  @RequirePermissions(Permission.LOAN_CHECKOUT)
  @ApiOperation({ summary: 'Check out an authorized loan' })
  async checkoutLoan(@Param('id') id: string, @Body() dto: CheckOutLoanDto) {
    return this.checkOutLoanUseCase.execute(id, dto);
  }

  @Patch(':id/checkin')
  @RequirePermissions(Permission.LOAN_CHECKIN)
  @ApiOperation({ summary: 'Check in a returning loan' })
  async checkinLoan(@Param('id') id: string, @Body() dto: CheckInLoanDto) {
    return this.checkInLoanUseCase.execute(id, dto);
  }
}
