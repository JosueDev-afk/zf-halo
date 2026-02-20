/**
 * Enum for Account Request Status
 */
export enum AccountRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

/**
 * Domain Entity: AccountRequest
 * Represents a user's request to join the platform.
 */
export interface AccountRequest {
    readonly id: string;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly status: AccountRequestStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
