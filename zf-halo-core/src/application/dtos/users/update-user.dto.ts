import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import * as userEntity from '../../../domain/entities/user.entity';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsEnum(['USER', 'MANAGER', 'ADMIN', 'AUDITOR'])
    role?: userEntity.UserRole;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateUserProfileDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;
}
