import { Module } from '@nestjs/common';
import { UsersController } from '../infrastructure/http/controllers/users.controller';
import { GetUsersUseCase } from '../application/use-cases/users/get-users.use-case';
import { GetUserByIdUseCase } from '../application/use-cases/users/get-user-by-id.use-case';
import { UpdateUserUseCase } from '../application/use-cases/users/update-user.use-case';
import { DeactivateUserUseCase } from '../application/use-cases/users/deactivate-user.use-case';
import { AuthModule } from './auth.module';
import { UserPrismaRepository } from '../infrastructure/persistence/prisma/user.prisma.repository';

import { USER_REPOSITORY } from '../domain/repositories/user.repository.interface';

@Module({
    imports: [AuthModule],
    controllers: [UsersController],
    providers: [
        GetUsersUseCase,
        GetUserByIdUseCase,
        UpdateUserUseCase,
        DeactivateUserUseCase,
        {
            provide: USER_REPOSITORY,
            useClass: UserPrismaRepository,
        },
    ],
    exports: [GetUsersUseCase, GetUserByIdUseCase],
})
export class UsersModule {}
