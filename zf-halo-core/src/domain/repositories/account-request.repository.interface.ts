import { AccountRequest } from '../entities/account-request.entity';

export interface AccountRequestRepository {
    create(data: {
        email: string;
        firstName: string;
        lastName: string;
        passwordHash: string;
    }): Promise<AccountRequest>;
    findById(id: string): Promise<AccountRequest | null>;
    findByEmail(email: string): Promise<AccountRequest | null>;
    updateStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<void>;
    findPending(): Promise<AccountRequest[]>;
    getPasswordHash(id: string): Promise<string | null>; // Needed for creating user on approval
}
