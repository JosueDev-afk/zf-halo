import { Injectable, Inject } from '@nestjs/common';
import {
    type IUserRepository,
    USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class GetUsersUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) { }

    async execute(): Promise<User[]> {
        return this.userRepository.findAll();
    }
}
