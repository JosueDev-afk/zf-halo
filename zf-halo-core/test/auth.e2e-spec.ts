import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/persistence/prisma/prisma.service';

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

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(testUser)
                .expect(201);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user.email).toBe(testUser.email.toLowerCase());
            expect(response.body.user.firstName).toBe(testUser.firstName);
            expect(response.body.user.lastName).toBe(testUser.lastName);
            expect(response.body.user.role).toBe('USER');
            expect(response.body.user).not.toHaveProperty('passwordHash');
        });

        it('should reject duplicate email', async () => {
            // First registration
            await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(testUser)
                .expect(201);

            // Second registration with same email
            await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(testUser)
                .expect(409);
        });

        it('should reject weak password', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({ ...testUser, password: 'weak' })
                .expect(400);
        });

        it('should reject invalid email', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({ ...testUser, email: 'invalid-email' })
                .expect(400);
        });

        it('should reject missing required fields', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send({ email: testUser.email })
                .expect(400);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            // Register user before login tests
            await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(testUser);
        });

        it('should login successfully with valid credentials', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(200);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body.user.email).toBe(testUser.email.toLowerCase());
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
            // Register and login to get token
            const response = await request(app.getHttpServer())
                .post('/api/v1/auth/register')
                .send(testUser);
            accessToken = response.body.accessToken;
        });

        it('should return current user with valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.email).toBe(testUser.email.toLowerCase());
            expect(response.body.firstName).toBe(testUser.firstName);
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
