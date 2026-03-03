import {
    Injectable,
    Inject,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import {
    UpdateUserDto,
    UpdateUserProfileDto,
} from '../../dtos/users/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(
        id: string,
        dto: UpdateUserDto | UpdateUserProfileDto,
        isAdmin: boolean,
    ): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!isAdmin) {
            // Prevent non-admins from updating sensitive fields
            if ('role' in dto || 'isActive' in dto) {
                throw new ForbiddenException(
                    'You are not allowed to update role or status',
                );
            }
        }

        return this.userRepository.update(id, dto);
    }
}
