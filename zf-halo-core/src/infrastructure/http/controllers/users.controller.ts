import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GetUsersUseCase } from '../../../application/use-cases/users/get-users.use-case';
import { GetUserByIdUseCase } from '../../../application/use-cases/users/get-user-by-id.use-case';
import { UpdateUserUseCase } from '../../../application/use-cases/users/update-user.use-case';
import { DeactivateUserUseCase } from '../../../application/use-cases/users/deactivate-user.use-case';
import {
  UpdateUserDto,
  UpdateUserProfileDto,
} from '../../../application/dtos/users/update-user.dto';
import { GetUsersQueryDto } from '../../../application/dtos/users/get-users-query.dto';
import { UserResponseDto } from '../../../application/dtos/auth';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Permission } from '../../../domain/enums/permission.enum';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
  ) {}

  @Get()
  @RequirePermissions(Permission.ACCOUNT_MANAGE)
  @ApiOperation({ summary: 'List all users (Admin only)' })
  async findAll(@Query() query: GetUsersQueryDto) {
    return this.getUsersUseCase.execute(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: UserResponseDto) {
    return this.getUserByIdUseCase.execute(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser() user: UserResponseDto,
    @Body() dto: UpdateUserProfileDto,
  ) {
    // Explicitly pass isAdmin=false for self-updates
    return this.updateUserUseCase.execute(user.id, dto, false);
  }

  @Get(':id')
  @RequirePermissions(Permission.ACCOUNT_MANAGE)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  async findOne(@Param('id') id: string) {
    return this.getUserByIdUseCase.execute(id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.ACCOUNT_MANAGE)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    // Pass isAdmin=true for admin updates
    return this.updateUserUseCase.execute(id, dto, true);
  }

  @Delete(':id')
  @RequirePermissions(Permission.ACCOUNT_MANAGE)
  @ApiOperation({ summary: 'Deactivate user (Admin only)' })
  async deactivate(@Param('id') id: string) {
    return this.deactivateUserUseCase.execute(id);
  }
}
