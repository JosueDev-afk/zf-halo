import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AuthorizeLoanDto {
  @ApiPropertyOptional({ description: 'Comments by the authorizer' })
  @IsOptional()
  @IsString()
  comments?: string;
}
