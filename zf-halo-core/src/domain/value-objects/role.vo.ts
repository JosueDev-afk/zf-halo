import { UserRole } from '../entities/user.entity';

/**
 * Value Object: Role
 * Represents user roles with role hierarchy validation.
 * Following DDD patterns for immutable value objects.
 */
export class Role {
    private static readonly HIERARCHY: Record<UserRole, number> = {
        USER: 1,
        MANAGER: 2,
        AUDITOR: 3,
        ADMIN: 4,
    };

    private readonly _value: UserRole;

    private constructor(role: UserRole) {
        this._value = role;
    }

    static create(role: UserRole): Role {
        if (!Role.isValid(role)) {
            throw new Error(`Invalid role: ${role}`);
        }
        return new Role(role);
    }

    static isValid(role: string): role is UserRole {
        return ['USER', 'MANAGER', 'ADMIN', 'AUDITOR'].includes(role);
    }

    get value(): UserRole {
        return this._value;
    }

    /**
     * Check if this role has higher or equal authority than another role
     */
    hasAuthorityOver(other: Role): boolean {
        return Role.HIERARCHY[this._value] >= Role.HIERARCHY[other._value];
    }

    equals(other: Role): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}
