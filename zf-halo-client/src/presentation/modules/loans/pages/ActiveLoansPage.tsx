import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Undo2, ArrowLeftRight } from "lucide-react";
import { useLoans, useCheckinLoan } from "@/application/loans/useLoans";
import { useAuthStore } from "@/application/auth/auth.store";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { LoansLayout } from "@/presentation/modules/loans/LoansLayout";
import type { Loan } from "@/domain/loans/loan.entity";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

export default function ActiveLoansPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useLoans(page, limit, { status: "CHECKED_OUT" });
  const checkinMutation = useCheckinLoan();

  return (
    <LoansLayout>
      <motion.div
        key="active"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="border border-border bg-card shadow-xl overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">Folio</th>
                    <th className="px-5 py-3.5 font-medium">Activo</th>
                    <th className="px-5 py-3.5 font-medium">Solicitante</th>
                    <th className="px-5 py-3.5 font-medium">
                      Retorno estimado
                    </th>
                    <th className="px-5 py-3.5 font-medium">Destino</th>
                    <th className="px-5 py-3.5 font-medium text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: limit }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <Skeleton className="h-4 w-24" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : data?.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <ArrowLeftRight className="h-10 w-10 opacity-30" />
                          <p className="font-medium">Sin préstamos activos</p>
                          <p className="text-sm">
                            No hay activos en uso actualmente
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data?.items.map((loan: Loan, i: number) => (
                      <motion.tr
                        key={loan.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        <td className="px-5 py-4 font-mono font-semibold text-xs text-foreground">
                          {loan.folio}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-foreground truncate max-w-[180px]">
                            {loan.asset?.machineName ?? loan.assetId}
                          </p>
                          {loan.asset?.tag && (
                            <p className="text-xs text-muted-foreground font-mono">
                              {loan.asset.tag}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {loan.requester?.firstName} {loan.requester?.lastName}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {format(
                            new Date(loan.estimatedReturnDate),
                            "dd MMM yyyy",
                            { locale: es },
                          )}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground truncate max-w-[140px]">
                          {loan.destination?.name ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isAdmin && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-xs bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-600 dark:text-purple-400"
                                disabled={checkinMutation.isPending}
                                onClick={() =>
                                  checkinMutation.mutate({
                                    id: loan.id,
                                    data: { comments: "Devuelto desde panel" },
                                  })
                                }
                              >
                                <Undo2 className="mr-1 h-3 w-3" />
                                Devolver
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <AnimatePresence>
          {data && data.pages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mt-4"
            >
              <p className="text-sm text-muted-foreground">
                {(page - 1) * limit + 1}–{Math.min(page * limit, data.total)} de{" "}
                {data.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {data.pages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page === data.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </LoansLayout>
  );
}
