import { IsOptional, IsIn, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/pagination-query.dto';

const LOAN_STATUSES = [
  'REQUESTED',
  'AUTHORIZED',
  'CHECKED_OUT',
  'RETURNED',
  'REJECTED',
] as const;

export class GetLoansQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: LOAN_STATUSES,
    description: 'Filter by loan status',
  })
  @IsOptional()
  @IsIn(LOAN_STATUSES)
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by requester user ID' })
  @IsOptional()
  requesterId?: string;

  @ApiPropertyOptional({ description: 'Search by notes or comments' })
  @IsOptional()
  @IsString()
  search?: string;
}
