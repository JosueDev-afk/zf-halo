import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLoans, useAuthorizeLoan } from "@/application/loans/useLoans";
import { Button } from "@/presentation/components/ui/button";
import { LoansLayout } from "@/presentation/modules/loans/LoansLayout";
import type { Loan } from "@/domain/loans/loan.entity";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

export default function PendingLoansPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useLoans(page, limit, { status: "REQUESTED" });
  const authorizeMutation = useAuthorizeLoan();

  return (
    <LoansLayout>
      <motion.div
        key="pending"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="space-y-3"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border p-5 space-y-3"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-9 w-28" />
            </div>
          ))
        ) : data?.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium">Sin solicitudes pendientes</p>
            <p className="text-sm text-muted-foreground">
              Todas las solicitudes han sido procesadas
            </p>
          </div>
        ) : (
          data?.items.map((loan: Loan, i: number) => (
            <motion.div
              key={loan.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-foreground bg-muted px-2 py-0.5 rounded-md">
                      {loan.folio}
                    </span>
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Pendiente de autorización
                    </span>
                  </div>

                  <p className="text-base font-medium truncate">
                    {loan.asset?.machineName ?? loan.assetId}
                  </p>
                  {loan.asset?.tag && (
                    <p className="text-sm text-muted-foreground font-mono">
                      {loan.asset.tag}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                    <span>
                      <strong className="text-foreground/80">
                        Solicitante:
                      </strong>{" "}
                      {loan.requester?.firstName} {loan.requester?.lastName}
                    </span>
                    <span>
                      <strong className="text-foreground/80">Retorno:</strong>{" "}
                      {format(
                        new Date(loan.estimatedReturnDate),
                        "dd MMM yyyy",
                        { locale: es },
                      )}
                    </span>
                    {loan.destination?.name && (
                      <span>
                        <strong className="text-foreground/80">Destino:</strong>{" "}
                        {loan.destination.name}
                      </span>
                    )}
                    {loan.comments && (
                      <span className="w-full">
                        <strong className="text-foreground/80">Notas:</strong>{" "}
                        {loan.comments}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() =>
                      authorizeMutation.mutate({
                        id: loan.id,
                        data: { comments: "Autorizado desde panel" },
                      })
                    }
                    disabled={authorizeMutation.isPending}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Autorizar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                    disabled={authorizeMutation.isPending}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Rechazar
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}

        <AnimatePresence>
          {data && data.pages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between pt-2"
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
                <span className="text-sm">
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
