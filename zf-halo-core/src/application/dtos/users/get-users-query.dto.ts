import { IsOptional, IsIn, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/pagination-query.dto';
import { Role } from '@generated/prisma';

const ROLES = Object.values(Role) as string[];

export class GetUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search term — matches firstName, lastName, email',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ROLES,
    description: 'Filter by role',
  })
  @IsOptional()
  @IsIn(ROLES)
  role?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status (true/false)',
  })
  @IsOptional()
  isActive?: boolean;
}
