import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/persistence/prisma/prisma.service';
import { Role } from '@generated/prisma';
import * as bcrypt from 'bcrypt';
import { AuthResponseDto } from '../src/application/dtos/auth';
import { AccountRequest } from '../src/domain/entities/account-request.entity';

describe('Accounts Module (E2E)', () => {
    let app: INestApplication<App>;
    let prisma: PrismaService;
    let adminToken: string;

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

        // Create Admin
        const passwordHash = await bcrypt.hash('admin123', 12);
        await prisma.user.create({
            data: {
                email: 'admin@zf-halo.com',
                firstName: 'System',
                lastName: 'Admin',
                passwordHash,
                role: Role.ADMIN,
                isActive: true,
            },
        });

        // Login to get token
        const loginRes = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({ email: 'admin@zf-halo.com', password: 'admin123' });

        adminToken = (loginRes.body as AuthResponseDto).accessToken;
    });

    afterAll(async () => {
        await prisma.accountRequest.deleteMany();
        await prisma.user.deleteMany();
        await app.close();
    });

    describe('POST /accounts/register', () => {
        it('should submit a registration request', async () => {
            const dto = {
                email: 'newuser@example.com',
                firstName: 'New',
                lastName: 'User',
                password: 'password123',
            };

            const hasRequiredLength = dto.password.length >= 8;
            expect(hasRequiredLength).toBe(true);

            const response = await request(app.getHttpServer())
                .post('/api/v1/accounts/register')
                .send(dto)
                .expect(201);

            expect(response.body).toHaveProperty('requestId');
            expect((response.body as { message: string }).message).toContain(
                'wait for admin approval',
            );

            // Verify DB
            const requestInDb = await prisma.accountRequest.findUnique({
                where: {
                    id: (response.body as { requestId: string }).requestId,
                },
            });
            expect(requestInDb).toBeDefined();
            expect(requestInDb?.status).toBe('PENDING');
        });

        it('should fail if email already exists', async () => {
            const dto = {
                email: 'newuser@example.com', // Same email
                firstName: 'Duplicate',
                lastName: 'User',
                password: 'password123',
            };

            await request(app.getHttpServer())
                .post('/api/v1/accounts/register')
                .send(dto)
                .expect(409);
        });
    });

    describe('PATCH /accounts/:id/approve', () => {
        let requestId: string;

        beforeAll(async () => {
            // Create a pending request
            const request = await prisma.accountRequest.create({
                data: {
                    email: 'tobeapproved@example.com',
                    firstName: 'To Be',
                    lastName: 'Approved',
                    passwordHash: 'somehash',
                    status: 'PENDING',
                },
            });
            requestId = request.id;
        });

        it('should fail without token', async () => {
            await request(app.getHttpServer())
                .patch(`/api/v1/accounts/${requestId}/approve`)
                .send({ role: Role.USER })
                .expect(401);
        });

        it('should approve request and create user', async () => {
            await request(app.getHttpServer())
                .patch(`/api/v1/accounts/${requestId}/approve`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ role: Role.MANAGER })
                .expect(200);

            // Verify Request Status
            const req = await prisma.accountRequest.findUnique({
                where: { id: requestId },
            });
            expect(req?.status).toBe('APPROVED');

            // Verify User Created
            const user = await prisma.user.findUnique({
                where: { email: 'tobeapproved@example.com' },
            });
            expect(user).toBeDefined();
            expect(user?.role).toBe(Role.MANAGER);
            expect(user?.isActive).toBe(true);
        });
    });

    describe('GET /accounts/requests', () => {
        it('should fail without token', async () => {
            await request(app.getHttpServer())
                .get('/api/v1/accounts/requests')
                .expect(401);
        });

        it('should return list of pending requests for admin', async () => {
            // Create a pending request
            await prisma.accountRequest.create({
                data: {
                    email: 'pending@example.com',
                    firstName: 'Pending',
                    lastName: 'User',
                    passwordHash: 'hash',
                    status: 'PENDING',
                },
            });

            const response = await request(app.getHttpServer())
                .get('/api/v1/accounts/requests')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            const requests = response.body as AccountRequest[];
            expect(Array.isArray(requests)).toBe(true);
            expect(requests.length).toBeGreaterThan(0);
            const req = requests.find((r) => r.email === 'pending@example.com');
            expect(req).toBeDefined();
            expect(req?.status).toBe('PENDING');
        });
    });
});
