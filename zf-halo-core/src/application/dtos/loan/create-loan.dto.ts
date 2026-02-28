import {
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  IsDateString,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLoanDto {
  @ApiProperty({ description: 'ID of the asset to loan' })
  @IsUUID()
  assetId: string;

  @ApiProperty({ description: 'ID of the destination' })
  @IsUUID()
  destinationId: string;

  @ApiPropertyOptional({ description: 'Quantity for BULK assets', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({ description: 'Estimated return date', format: 'date-time' })
  @IsDateString()
  estimatedReturnDate: string;

  @ApiPropertyOptional({ description: 'Comments by the requester' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({
    description: 'Override requester user ID (Admin only)',
  })
  @IsOptional()
  @IsUUID()
  requesterId?: string;
}
