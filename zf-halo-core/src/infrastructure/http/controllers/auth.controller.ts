import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthService } from '../../../application/services/auth.service';
import {
  LoginDto,
  AuthResponseDto,
  UserResponseDto,
} from '../../../application/dtos/auth';
import { SubmitRegistrationUseCase } from '../../../application/use-cases/accounts/submit-registration.use-case';
import { SubmitRegistrationDto } from '../../../application/dtos/accounts/submit-registration.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly submitRegistrationUseCase: SubmitRegistrationUseCase,
  ) {}

  /**
   * Submit a new account registration request
   * POST /api/v1/auth/register
   */
  @Post('register')
  @ApiOperation({ summary: 'Submit a new account registration request' })
  @ApiResponse({
    status: 201,
    description: 'Registration submitted successfully',
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async register(@Body() dto: SubmitRegistrationDto) {
    const request = await this.submitRegistrationUseCase.execute(dto);
    return {
      message:
        'Registration submitted successfully. Please wait for admin approval.',
      requestId: request.id,
    };
  }

  /**
   * Login with email and password
   * POST /api/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user data',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired JWT token' })
  me(@CurrentUser() user: UserResponseDto): UserResponseDto {
    return user;
  }
}
