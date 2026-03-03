/**
 * Domain Entity: User
 * Pure domain object representing a user in the system.
 * Framework-agnostic, no Prisma or NestJS dependencies.
 */
export interface User {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly company?: string;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  readonly locationName?: string | null;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * User roles as defined in the ZF-HALO requirements (22% rubric)
 */
export type UserRole = 'USER' | 'MANAGER' | 'ADMIN' | 'AUDITOR';

/**
 * User creation data (without auto-generated fields)
 */
export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  company?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
  role?: UserRole;
  isActive?: boolean;
}
