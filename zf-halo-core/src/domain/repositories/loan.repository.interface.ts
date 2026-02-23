import { Loan, LoanStatus } from '../entities/loan.entity';
import { PaginatedResult } from '../../application/dtos/common/paginated-result.dto';

export interface CreateLoanData {
  folio: string;
  status: LoanStatus;
  quantity: number;
  estimatedReturnDate: Date;
  comments?: string | null;
  requesterId: string;
  assetId: string;
  destinationId: string;
}

export interface ILoanRepository {
  create(data: CreateLoanData): Promise<Loan>;
  findById(id: string): Promise<Loan | null>;
  findByFolio(folio: string): Promise<Loan | null>;
  findAll(
    skip?: number,
    take?: number,
    filters?: Record<string, any>,
  ): Promise<PaginatedResult<Loan>>;
  updateStatus(
    id: string,
    status: LoanStatus,
    extras?: Partial<Loan>,
  ): Promise<Loan>;
  checkout(
    id: string,
    departureDate: Date,
    extras?: Partial<Loan>,
  ): Promise<Loan>;
  checkin(
    id: string,
    actualReturnDate: Date,
    extras?: Partial<Loan>,
  ): Promise<Loan>;
  findOverdueLoans(): Promise<Loan[]>;
  getLastFolio(year: number): Promise<string | null>;
}

export const LOAN_REPOSITORY = Symbol('ILoanRepository');
