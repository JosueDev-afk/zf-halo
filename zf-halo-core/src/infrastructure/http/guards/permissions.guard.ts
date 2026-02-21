import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../../../domain/enums/permission.enum';
import { ROLE_PERMISSIONS } from '../../../domain/maps/role-permissions.map';
import { Role } from '@generated/prisma';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user: { role: Role } }>();

    if (!user || !user.role) {
      return false;
    }

    const userPermissions = ROLE_PERMISSIONS[user.role] || [];

    // Check if user has ALL required permissions
    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
