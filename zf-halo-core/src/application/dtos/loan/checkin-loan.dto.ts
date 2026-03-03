import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CheckInLoanDto {
  @ApiPropertyOptional({ description: 'Check-in comments' })
  @IsOptional()
  @IsString()
  comments?: string;
}
