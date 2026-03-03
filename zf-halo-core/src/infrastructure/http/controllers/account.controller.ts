import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubmitRegistrationUseCase } from '../../../application/use-cases/accounts/submit-registration.use-case';
import { ApproveAccountUseCase } from '../../../application/use-cases/accounts/approve-account.use-case';
import { GetAccountRequestsUseCase } from '../../../application/use-cases/accounts/get-account-requests.use-case';
import {
  SubmitRegistrationDto,
  ApproveAccountDto,
} from '../../../application/dtos/accounts';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { Permission } from '../../../domain/enums/permission.enum';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly submitRegistrationUseCase: SubmitRegistrationUseCase,
    private readonly approveAccountUseCase: ApproveAccountUseCase,
    private readonly getAccountRequestsUseCase: GetAccountRequestsUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Submit a new account request' })
  @ApiResponse({ status: 201, description: 'Request submitted successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: SubmitRegistrationDto) {
    const request = await this.submitRegistrationUseCase.execute(dto);
    return {
      message:
        'Registration submitted successfully. Please wait for admin approval.',
      requestId: request.id,
    };
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ACCOUNT_MANAGE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List pending account requests (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of pending account requests',
  })
  async getRequests() {
    return this.getAccountRequestsUseCase.execute();
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.ACCOUNT_MANAGE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve an account request (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Account approved and user created',
  })
  @ApiResponse({ status: 404, description: 'Request not found' })
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string, @Body() dto: ApproveAccountDto) {
    await this.approveAccountUseCase.execute(id, dto);
    return { message: 'Account approved successfully' };
  }
}
