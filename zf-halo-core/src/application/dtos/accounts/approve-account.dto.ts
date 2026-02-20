import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@generated/prisma';

export class ApproveAccountDto {
    @ApiProperty({ enum: Role, example: Role.USER })
    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;
}
