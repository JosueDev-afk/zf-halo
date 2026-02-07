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
  ApiConflictResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthService } from '../../../application/services/auth.service';
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  UserResponseDto,
} from '../../../application/dtos/auth';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * POST /api/auth/register
   */
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiConflictResponse({ description: 'Email already registered' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
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
