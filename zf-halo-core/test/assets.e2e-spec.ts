/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/persistence/prisma/prisma.service';
import { Role, MachineStatus, PurchaseType } from '@generated/prisma';
import * as bcrypt from 'bcrypt';
import { AuthResponseDto } from '../src/application/dtos/auth';

describe('Assets Module (E2E)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let managerToken: string;
  let userToken: string;
  let createdAssetId: string;

  beforeAll(async () => {
    process.env.REDIS_HOST = 'localhost';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // Cleanup
    await prisma.cleanDatabase();

    const passwordHash = await bcrypt.hash('password123', 12);

    // Create Admin
    await prisma.user.create({
      data: {
        email: 'admin-asset@zf-halo.com',
        firstName: 'Asset',
        lastName: 'Admin',
        passwordHash,
        role: Role.ADMIN,
        isActive: true,
      },
    });

    // Create Manager
    await prisma.user.create({
      data: {
        email: 'manager-asset@zf-halo.com',
        firstName: 'Asset',
        lastName: 'Manager',
        passwordHash,
        role: Role.MANAGER,
        isActive: true,
      },
    });

    // Create Regular User
    await prisma.user.create({
      data: {
        email: 'user-asset@zf-halo.com',
        firstName: 'Regular',
        lastName: 'User',
        passwordHash,
        role: Role.USER,
        isActive: true,
      },
    });

    // Get Tokens
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin-asset@zf-halo.com',
        password: 'password123',
      });
    adminToken = (adminLogin.body as AuthResponseDto).accessToken;

    const managerLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'manager-asset@zf-halo.com',
        password: 'password123',
      });
    managerToken = (managerLogin.body as AuthResponseDto).accessToken;

    const userLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'user-asset@zf-halo.com',
        password: 'password123',
      });
    userToken = (userLogin.body as AuthResponseDto).accessToken;
  });

  afterAll(async () => {
    await prisma.cleanDatabase();
    await app.close();
  });

  // ─── CREATE ───────────────────────────────────
  describe('POST /assets', () => {
    it('should allow admin to create an asset', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/assets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          identifier: 9001,
          area: 'Production',
          subArea: 'Line 1',
          category: 'Machinery',
          projectName: 'Test Project',
          machineName: 'Test Machine',
          tag: 'ZF-TEST-001',
          serialNumber: 'SN-TEST-001',
          model: 'TestModel X1',
          brand: 'TestBrand',
          commercialValue: 50000,
          purchaseType: PurchaseType.NATIONAL,
          machineStatus: MachineStatus.OPERATIVE,
          isPurchased: true,
        })
        .expect(201);

      expect(response.body.identifier).toBe(9001);
      expect(response.body.tag).toBe('ZF-TEST-001');
      expect(response.body.isActive).toBe(true);
      createdAssetId = response.body.id as string;
    });

    it('should allow manager to create an asset', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/assets')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          identifier: 9002,
          area: 'Quality',
          subArea: 'Lab',
          category: 'Measurement',
          projectName: 'Manager Project',
          machineName: 'Manager Machine',
          tag: 'ZF-MGR-002',
          serialNumber: 'SN-MGR-002',
          model: 'MgrModel Y1',
          brand: 'MgrBrand',
          commercialValue: 75000,
          purchaseType: PurchaseType.IMPORT,
        })
        .expect(201);

      expect(response.body.identifier).toBe(9002);
    });

    it('should forbid regular user from creating', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/assets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          identifier: 9003,
          area: 'Test',
          subArea: 'Test',
          category: 'Test',
          projectName: 'Test',
          machineName: 'Test',
          tag: 'ZF-USR-003',
          serialNumber: 'SN-USR-003',
          model: 'Test',
          brand: 'Test',
          commercialValue: 100,
          purchaseType: PurchaseType.NATIONAL,
        })
        .expect(403);
    });
  });

  // ─── READ ─────────────────────────────────────
  describe('GET /assets', () => {
    it('should allow any authenticated user to list assets', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/assets')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /assets/:id', () => {
    it('should return a single asset', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/assets/${createdAssetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdAssetId);
      expect(response.body.machineName).toBe('Test Machine');
    });

    it('should return 404 for non-existent asset', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/assets/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  // ─── UPDATE ───────────────────────────────────
  describe('PATCH /assets/:id', () => {
    it('should allow admin to update an asset', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/assets/${createdAssetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ machineName: 'Updated Machine' })
        .expect(200);

      expect(response.body.machineName).toBe('Updated Machine');
    });

    it('should forbid regular user from updating', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/assets/${createdAssetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ machineName: 'Hacked' })
        .expect(403);
    });
  });

  // ─── DELETE (soft) ────────────────────────────
  describe('DELETE /assets/:id', () => {
    it('should allow admin to soft-delete an asset', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/assets/${createdAssetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.isActive).toBe(false);
    });

    it('should forbid regular user from deleting', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/assets/${createdAssetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
