import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/persistence/prisma/prisma.service';
import { AuthResponseDto, UserResponseDto } from '../src/application/dtos/auth';
import * as bcrypt from 'bcrypt';

describe('Auth (e2e)', () => {
    let app: INestApplication<App>;
    let prisma: PrismaService;

    const testUser = {
        email: 'test@example.com',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'User',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        // Apply same configuration as main.ts
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );
        app.setGlobalPrefix('api/v1');

        await app.init();

        prisma = app.get(PrismaService);
    });

    beforeEach(async () => {
        // Clean database before each test
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.user.deleteMany();
        await app.close();
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            // Create user directly in DB
            const passwordHash = await bcrypt.hash(testUser.password, 10);
            await prisma.user.create({
                data: {
                    email: testUser.email.toLowerCase(),
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    passwordHash,
                    role: 'USER',
                    isActive: true,
                },
            });
        });

        it('should login successfully with valid credentials', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(200);

            const body = response.body as AuthResponseDto;
            expect(body).toHaveProperty('accessToken');
            expect(body.user.email).toBe(testUser.email.toLowerCase());
        });

        it('should reject invalid password', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword123',
                })
                .expect(401);
        });

        it('should reject non-existent user', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'TestPass123',
                })
                .expect(401);
        });
    });

    describe('GET /api/v1/auth/me', () => {
        let accessToken: string;

        beforeEach(async () => {
            // Seed User and get token
            const passwordHash = await bcrypt.hash(testUser.password, 10);
            await prisma.user.create({
                data: {
                    email: testUser.email.toLowerCase(),
                    firstName: testUser.firstName,
                    lastName: testUser.lastName,
                    passwordHash,
                    role: 'USER',
                    isActive: true,
                },
            });

            const loginRes = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({ email: testUser.email, password: testUser.password });

            accessToken = (loginRes.body as AuthResponseDto).accessToken;
        });

        it('should return current user with valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            const body = response.body as UserResponseDto;
            expect(body.email).toBe(testUser.email.toLowerCase());
            expect(body.firstName).toBe(testUser.firstName);
        });

        it('should reject request without token', async () => {
            await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .expect(401);
        });

        it('should reject invalid token', async () => {
            await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });
});
