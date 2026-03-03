import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { loansApi } from "../../infrastructure/http/loans.api";
import type {
  CreateLoanDto,
  AuthorizeLoanDto,
  CheckOutLoanDto,
  CheckInLoanDto,
} from "../../domain/loans/loan.entity";

export function useLoans(page: number, limit: number, filters?: any) {
  return useQuery({
    queryKey: ["loans", page, limit, filters],
    queryFn: () => loansApi.getLoans(page, limit, filters),
  });
}

export function useLoan(id: string) {
  return useQuery({
    queryKey: ["loans", id],
    queryFn: () => loansApi.getLoanById(id),
    enabled: !!id,
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLoanDto) => loansApi.createLoan(data),
    onSuccess: () => {
      toast.success("Loan request created successfully");
      queryClient.invalidateQueries({ queryKey: ["loans"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["assets"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["dashboard"], exact: false });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create loan request",
      );
    },
  });
}

export function useAuthorizeLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AuthorizeLoanDto }) =>
      loansApi.authorizeLoan(id, data),
    onSuccess: () => {
      toast.success("Loan authorized successfully");
      queryClient.invalidateQueries({ queryKey: ["loans"], exact: false });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to authorize loan");
    },
  });
}

export function useCheckoutLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CheckOutLoanDto }) =>
      loansApi.checkoutLoan(id, data),
    onSuccess: () => {
      toast.success("Asset checked out to requester");
      queryClient.invalidateQueries({ queryKey: ["loans"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["assets"], exact: false });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to checkout asset");
    },
  });
}

export function useCheckinLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CheckInLoanDto }) =>
      loansApi.checkinLoan(id, data),
    onSuccess: () => {
      toast.success("Asset returned to inventory");
      queryClient.invalidateQueries({ queryKey: ["loans"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["assets"], exact: false });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to record return");
    },
  });
}
