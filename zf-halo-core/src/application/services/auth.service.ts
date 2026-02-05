import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { LoginDto, RegisterDto, AuthResponseDto, UserResponseDto } from '../dtos/auth';
import { Role } from '../../../generated/prisma';

export interface JwtPayload {
    sub: string;
    email: string;
    role: Role;
}

@Injectable()
export class AuthService {
    private readonly SALT_ROUNDS = 12;

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto): Promise<AuthResponseDto> {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password with bcrypt
        const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: dto.role || Role.USER,
            },
        });

        // Generate JWT token
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            user: this.mapToUserResponse(user),
        };
    }

    async login(dto: LoginDto): Promise<AuthResponseDto> {
        // Find user by email
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT token
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            user: this.mapToUserResponse(user),
        };
    }

    async validateUser(userId: string): Promise<UserResponseDto | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId, isActive: true },
        });

        if (!user) {
            return null;
        }

        return this.mapToUserResponse(user);
    }

    private mapToUserResponse(user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }): UserResponseDto {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
