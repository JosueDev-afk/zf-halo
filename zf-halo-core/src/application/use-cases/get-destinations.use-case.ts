import { Injectable, Inject } from '@nestjs/common';
import type { IDestinationRepository } from '../../domain/repositories/destination.repository.interface';
import { DESTINATION_REPOSITORY } from '../../domain/repositories/destination.repository.interface';
import { Destination } from '../../domain/entities/destination.entity';

@Injectable()
export class GetDestinationsUseCase {
  constructor(
    @Inject(DESTINATION_REPOSITORY)
    private readonly destinationRepository: IDestinationRepository,
  ) {}

  async execute(onlyActive = true): Promise<Destination[]> {
    return this.destinationRepository.findAll(onlyActive);
  }
}
