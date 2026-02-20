import { Injectable, ConflictException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { AccountRequestRepository } from '../../../domain/repositories/account-request.repository.interface';
import { SubmitRegistrationDto } from '../../dtos/accounts/submit-registration.dto';
import { AccountRequest } from '../../../domain/entities/account-request.entity';

@Injectable()
export class SubmitRegistrationUseCase {
    private readonly SALT_ROUNDS = 12;

    constructor(
        @Inject('AccountRequestRepository')
        private readonly accountRequestRepository: AccountRequestRepository,
    ) {}

    async execute(dto: SubmitRegistrationDto): Promise<AccountRequest> {
        // Check if email already exists in requests
        const existingRequest = await this.accountRequestRepository.findByEmail(
            dto.email.toLowerCase(),
        );
        if (existingRequest) {
            throw new ConflictException(
                'Email already registered or pending approval',
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

        // Create request
        return this.accountRequestRepository.create({
            email: dto.email.toLowerCase(),
            firstName: dto.firstName,
            lastName: dto.lastName,
            passwordHash,
        });
    }
}
