import { IsOptional, IsIn, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/pagination-query.dto';
import { MachineStatus } from '@generated/prisma';

const MACHINE_STATUSES = Object.values(MachineStatus) as string[];

export class GetAssetsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      'Search term — matches machineName, tag, brand, model, serialNumber, area',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: MACHINE_STATUSES,
    description: 'Filter by machine status',
  })
  @IsOptional()
  @IsIn(MACHINE_STATUSES)
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;
}
