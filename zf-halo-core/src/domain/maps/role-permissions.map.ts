import { Permission } from '../enums/permission.enum';
import { Role } from '@generated/prisma';

/**
 * Mapping of Roles to their specific Permissions.
 * This acts as the Source of Truth for RBAC+ capability resolution.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.USER]: [
        Permission.LOAN_VIEW_OWN,
        Permission.LOAN_REQUEST,
        Permission.ASSET_VIEW,
    ],
    [Role.MANAGER]: [
        Permission.LOAN_VIEW_DEPT,
        Permission.LOAN_APPROVE,
        Permission.LOAN_REJECT,
        Permission.ASSET_VIEW,
    ],
    [Role.ADMIN]: [
        Permission.LOAN_VIEW_ALL,
        Permission.LOAN_EDIT,
        Permission.ASSET_MANAGE,
        Permission.ACCOUNT_MANAGE,
        Permission.QR_GENERATE,
    ],
    [Role.AUDITOR]: [
        Permission.LOAN_VIEW_ALL,
        Permission.REPORT_EXPORT,
        Permission.ANALYTICS_VIEW,
        Permission.AUDIT_LOG_READ,
    ],
};
