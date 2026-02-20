import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@generated/prisma';

export class UserResponseDto {
    @ApiProperty({ example: 'uuid-v4-string', description: 'Unique user ID' })
    id: string;

    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiProperty({ example: 'John' })
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    lastName: string;

    @ApiProperty({ enum: Role, example: Role.USER })
    role: Role;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class AuthResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT access token',
    })
    accessToken: string;

    @ApiProperty({ type: UserResponseDto })
    user: UserResponseDto;
}
