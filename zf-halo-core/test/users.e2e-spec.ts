import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/persistence/prisma/prisma.service';
import { Role } from '@generated/prisma';
import * as bcrypt from 'bcrypt';
import { AuthResponseDto } from '../src/application/dtos/auth';

describe('Users Module (E2E)', () => {
    let app: INestApplication<App>;
    let prisma: PrismaService;
    let adminToken: string;
    let userToken: string;
    let adminId: string;
    let userId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();

        prisma = app.get(PrismaService);

        // Cleanup
        await prisma.accountRequest.deleteMany();
        await prisma.user.deleteMany();

        const passwordHash = await bcrypt.hash('password123', 12);

        // Create Admin
        const admin = await prisma.user.create({
            data: {
                email: 'admin@zf-halo.com',
                firstName: 'System',
                lastName: 'Admin',
                passwordHash,
                role: Role.ADMIN,
                isActive: true,
            },
        });
        adminId = admin.id;

        // Create User
        const user = await prisma.user.create({
            data: {
                email: 'user@zf-halo.com',
                firstName: 'Regular',
                lastName: 'User',
                passwordHash,
                role: Role.USER,
                isActive: true,
            },
        });
        userId = user.id;

        // Get Tokens
        const adminLogin = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({ email: 'admin@zf-halo.com', password: 'password123' });
        adminToken = (adminLogin.body as AuthResponseDto).accessToken;

        const userLogin = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({ email: 'user@zf-halo.com', password: 'password123' });
        userToken = (userLogin.body as AuthResponseDto).accessToken;
    });

    afterAll(async () => {
        await prisma.accountRequest.deleteMany();
        await prisma.user.deleteMany();
        await app.close();
    });

    describe('GET /users/me', () => {
        it('should return profile for authenticated user', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/users/me')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.email).toBe('user@zf-halo.com');
            expect(response.body.id).toBe(userId);
        });
    });

    describe('PATCH /users/me', () => {
        it('should update own profile', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/users/me')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ firstName: 'Updated' })
                .expect(200);

            expect(response.body.firstName).toBe('Updated');
        });
    });

    describe('GET /users', () => {
        it('should allow admin to list users', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(2);
        });

        it('should forbid non-admin', async () => {
            await request(app.getHttpServer())
                .get('/api/v1/users')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);
        });
    });

    describe('GET /users/:id', () => {
        it('should allow admin to get user by id', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/users/${userId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.email).toBe('user@zf-halo.com');
        });
    });

    describe('PATCH /users/:id', () => {
        it('should allow admin to update user role', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/api/v1/users/${userId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ role: Role.MANAGER })
                .expect(200);

            expect(response.body.role).toBe(Role.MANAGER);
        });
    });

    describe('DELETE /users/:id', () => {
        it('should allow admin to deactivate user', async () => {
            const response = await request(app.getHttpServer())
                .delete(`/api/v1/users/${userId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.isActive).toBe(false);
        });
    });
});
