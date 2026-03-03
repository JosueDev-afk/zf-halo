import { apiClient } from "./client";
import type {
  Loan,
  CreateLoanDto,
  AuthorizeLoanDto,
  CheckOutLoanDto,
  CheckInLoanDto,
} from "../../domain/loans/loan.entity";
import type { PaginatedResult } from "../../domain/common/models/pagination.model";

export const loansApi = {
  getLoans: async (
    page = 1,
    limit = 10,
    filters?: any,
  ): Promise<PaginatedResult<Loan>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    const response = await apiClient.get<PaginatedResult<Loan>>(
      `/loans?${params}`,
    );
    return response.data;
  },

  getLoanById: async (id: string): Promise<Loan> => {
    const response = await apiClient.get<Loan>(`/loans/${id}`);
    return response.data;
  },

  createLoan: async (data: CreateLoanDto): Promise<Loan> => {
    const response = await apiClient.post<Loan>("/loans", data);
    return response.data;
  },

  authorizeLoan: async (id: string, data: AuthorizeLoanDto): Promise<Loan> => {
    const response = await apiClient.patch<Loan>(
      `/loans/${id}/authorize`,
      data,
    );
    return response.data;
  },

  checkoutLoan: async (id: string, data: CheckOutLoanDto): Promise<Loan> => {
    const response = await apiClient.patch<Loan>(`/loans/${id}/checkout`, data);
    return response.data;
  },

  checkinLoan: async (id: string, data: CheckInLoanDto): Promise<Loan> => {
    const response = await apiClient.patch<Loan>(`/loans/${id}/checkin`, data);
    return response.data;
  },
};
