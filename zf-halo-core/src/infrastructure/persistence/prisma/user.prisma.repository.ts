import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User, CreateUserData } from '../../../domain/entities/user.entity';

/**
 * Repository Implementation (Adapter): UserPrismaRepository
 * Infrastructure layer adapter implementing the IUserRepository port.
 */
@Injectable()
export class UserPrismaRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
    }

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(data: CreateUserData): Promise<User> {
        return this.prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                passwordHash: data.passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role || 'USER',
            },
        });
    }

    async update(id: string, data: Partial<CreateUserData>): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data: {
                ...(data.email && { email: data.email.toLowerCase() }),
                ...(data.passwordHash && { passwordHash: data.passwordHash }),
                ...(data.firstName && { firstName: data.firstName }),
                ...(data.lastName && { lastName: data.lastName }),
                ...(data.role && { role: data.role }),
            },
        });
    }

    async deactivate(id: string): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
