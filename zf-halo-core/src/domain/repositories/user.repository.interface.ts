import { User, CreateUserData } from '../entities/user.entity';
import { PaginatedResult } from '../../application/dtos/common/paginated-result.dto';

export interface UserFilters {
  search?: string;
  role?: string;
}

/**
 * Repository Interface (Port): IUserRepository
 * Defines the contract for user persistence operations.
 * Part of the hexagonal architecture ports layer.
 */
export interface IUserRepository {
  /**
   * Find a user by their unique ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by their email address
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find all users with pagination and optional filters
   */
  findAll(
    skip?: number,
    take?: number,
    filters?: UserFilters,
  ): Promise<PaginatedResult<User>>;

  /**
   * Create a new user in the persistence layer
   */
  create(data: CreateUserData): Promise<User>;

  /**
   * Update an existing user
   */
  update(id: string, data: Partial<CreateUserData>): Promise<User>;

  /**
   * Soft delete a user by setting isActive to false
   */
  deactivate(id: string): Promise<User>;
}

/**
 * Injection token for the user repository
 */
export const USER_REPOSITORY = Symbol('IUserRepository');
