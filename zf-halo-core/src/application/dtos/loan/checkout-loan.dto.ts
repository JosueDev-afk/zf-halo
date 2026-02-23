import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CheckOutLoanDto {
  @ApiPropertyOptional({ description: 'Checkout comments' })
  @IsOptional()
  @IsString()
  comments?: string;
}
