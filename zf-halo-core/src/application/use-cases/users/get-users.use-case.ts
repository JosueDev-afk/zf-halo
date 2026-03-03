import { Injectable, Inject } from '@nestjs/common';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { GetUsersQueryDto } from '../../dtos/users/get-users-query.dto';
import { PaginatedResult } from '../../dtos/common/paginated-result.dto';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUsersQueryDto): Promise<PaginatedResult<User>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    return this.userRepository.findAll(skip, limit, {
      search: query.search,
      role: query.role,
    });
  }
}
