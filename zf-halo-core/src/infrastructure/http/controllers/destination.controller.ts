import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { Permission } from '../../../domain/enums/permission.enum';
import { GetDestinationsUseCase } from '../../../application/use-cases/get-destinations.use-case';

@ApiTags('Destinations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('destinations')
export class DestinationController {
  constructor(
    private readonly getDestinationsUseCase: GetDestinationsUseCase,
  ) {}

  @Get()
  @RequirePermissions(Permission.ASSET_VIEW)
  @ApiOperation({ summary: 'List all active destinations' })
  async findAll(@Query('all') all?: string) {
    return this.getDestinationsUseCase.execute(all !== 'true');
  }
}
