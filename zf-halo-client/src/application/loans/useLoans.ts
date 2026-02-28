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
      toast.success("Solicitud de préstamo creada");
      queryClient.invalidateQueries({ queryKey: ["loans"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["assets"], exact: false });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al crear la solicitud",
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
      toast.success("Préstamo autorizado correctamente");
      queryClient.invalidateQueries({ queryKey: ["loans"], exact: false });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al autorizar el préstamo",
      );
    },
  });
}

export function useCheckoutLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CheckOutLoanDto }) =>
      loansApi.checkoutLoan(id, data),
    onSuccess: () => {
      toast.success("Activo entregado al solicitante");
      queryClient.invalidateQueries({ queryKey: ["loans"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["assets"], exact: false });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al entregar el activo",
      );
    },
  });
}

export function useCheckinLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CheckInLoanDto }) =>
      loansApi.checkinLoan(id, data),
    onSuccess: () => {
      toast.success("Activo devuelto al inventario");
      queryClient.invalidateQueries({ queryKey: ["loans"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["assets"], exact: false });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al registrar la devolución",
      );
    },
  });
}
