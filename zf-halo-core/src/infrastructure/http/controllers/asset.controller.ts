import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateAssetUseCase } from '../../../application/use-cases/assets/create-asset.use-case';
import { UpdateAssetUseCase } from '../../../application/use-cases/assets/update-asset.use-case';
import { GetAssetsUseCase } from '../../../application/use-cases/assets/get-assets.use-case';
import { GetAssetByIdUseCase } from '../../../application/use-cases/assets/get-asset-by-id.use-case';
import { DeleteAssetUseCase } from '../../../application/use-cases/assets/delete-asset.use-case';
import { CreateAssetDto } from '../../../application/dtos/asset/create-asset.dto';
import { UpdateAssetDto } from '../../../application/dtos/asset/update-asset.dto';
import { GetAssetsQueryDto } from '../../../application/dtos/asset/get-assets-query.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { Permission } from '../../../domain/enums/permission.enum';

@ApiTags('Assets')
@Controller('assets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AssetController {
  constructor(
    private readonly createAssetUseCase: CreateAssetUseCase,
    private readonly updateAssetUseCase: UpdateAssetUseCase,
    private readonly getAssetsUseCase: GetAssetsUseCase,
    private readonly getAssetByIdUseCase: GetAssetByIdUseCase,
    private readonly deleteAssetUseCase: DeleteAssetUseCase,
  ) {}

  @Get()
  @RequirePermissions(Permission.ASSET_VIEW)
  @ApiOperation({ summary: 'List all active assets' })
  @ApiResponse({ status: 200, description: 'Paginated list of active assets' })
  async findAll(@Query() query: GetAssetsQueryDto) {
    return this.getAssetsUseCase.execute(query);
  }

  @Get(':id')
  @RequirePermissions(Permission.ASSET_VIEW)
  @ApiOperation({ summary: 'Get asset by ID' })
  @ApiResponse({ status: 200, description: 'Asset details' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async findOne(@Param('id') id: string) {
    return this.getAssetByIdUseCase.execute(id);
  }

  @Post()
  @RequirePermissions(Permission.ASSET_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new asset (Admin/Manager only)' })
  @ApiResponse({ status: 201, description: 'Asset created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() dto: CreateAssetDto) {
    return this.createAssetUseCase.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions(Permission.ASSET_MANAGE)
  @ApiOperation({ summary: 'Update an asset (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Asset updated' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.updateAssetUseCase.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.ASSET_MANAGE)
  @ApiOperation({ summary: 'Soft-delete an asset (Admin/Manager only)' })
  @ApiResponse({ status: 200, description: 'Asset deactivated' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async remove(@Param('id') id: string) {
    return this.deleteAssetUseCase.execute(id);
  }
}
