import { Module } from '@nestjs/common';
import { DestinationController } from '../infrastructure/http/controllers/destination.controller';
import { GetDestinationsUseCase } from '../application/use-cases/get-destinations.use-case';
import { DESTINATION_REPOSITORY } from '../domain/repositories/destination.repository.interface';
import { DestinationPrismaRepository } from '../infrastructure/persistence/prisma/destination.prisma.repository';
import { PrismaModule } from '../infrastructure/persistence/prisma/prisma.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DestinationController],
  providers: [
    {
      provide: DESTINATION_REPOSITORY,
      useClass: DestinationPrismaRepository,
    },
    GetDestinationsUseCase,
  ],
  exports: [DESTINATION_REPOSITORY, GetDestinationsUseCase],
})
export class DestinationsModule {}
