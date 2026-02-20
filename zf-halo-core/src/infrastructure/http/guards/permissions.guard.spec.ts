import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsGuard } from './permissions.guard';
import { Reflector } from '@nestjs/core';
import { Permission } from '../../../domain/enums/permission.enum';
import { Role } from '@generated/prisma';
import { ExecutionContext } from '@nestjs/common';

describe('PermissionsGuard', () => {
    let guard: PermissionsGuard;
    let reflector: Reflector;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PermissionsGuard,
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<PermissionsGuard>(PermissionsGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should return true if no permissions are required', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
        const context = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
        } as unknown as ExecutionContext;

        expect(guard.canActivate(context)).toBe(true);
    });

    it('should return false if user is not present', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            Permission.ASSET_VIEW,
        ]);
        const context = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: () => ({
                getRequest: () => ({ user: null }),
            }),
        } as unknown as ExecutionContext;

        expect(guard.canActivate(context)).toBe(false);
    });

    it('should return true if user (USER) has required permission (ASSET_VIEW)', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            Permission.ASSET_VIEW,
        ]);
        const context = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: () => ({
                getRequest: () => ({ user: { role: Role.USER } }),
            }),
        } as unknown as ExecutionContext;

        expect(guard.canActivate(context)).toBe(true);
    });

    it('should return false if user (USER) lacks required permission (ACCOUNT_MANAGE)', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            Permission.ACCOUNT_MANAGE,
        ]);
        const context = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: () => ({
                getRequest: () => ({ user: { role: Role.USER } }),
            }),
        } as unknown as ExecutionContext;

        expect(guard.canActivate(context)).toBe(false);
    });

    it('should return true if user (ADMIN) has required permission (ACCOUNT_MANAGE)', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
            Permission.ACCOUNT_MANAGE,
        ]);
        const context = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: () => ({
                getRequest: () => ({ user: { role: Role.ADMIN } }),
            }),
        } as unknown as ExecutionContext;

        expect(guard.canActivate(context)).toBe(true);
    });
});
