import { Destination } from '../entities/destination.entity';

export const DESTINATION_REPOSITORY = Symbol('DESTINATION_REPOSITORY');

export interface IDestinationRepository {
  findAll(onlyActive?: boolean): Promise<Destination[]>;
  findById(id: string): Promise<Destination | null>;
}
