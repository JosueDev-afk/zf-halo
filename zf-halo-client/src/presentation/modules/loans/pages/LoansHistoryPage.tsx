import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { useLoans } from "@/application/loans/useLoans";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { LoansLayout } from "@/presentation/modules/loans/LoansLayout";
import type { Loan, LoanStatus } from "@/domain/loans/loan.entity";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

const STATUS_CONFIG: Record<LoanStatus, { label: string; className: string }> =
  {
    REQUESTED: {
      label: "Requested",
      className:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    },
    AUTHORIZED: {
      label: "Authorized",
      className:
        "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
    },
    CHECKED_OUT: {
      label: "In Use",
      className:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    },
    RETURNED: {
      label: "Returned",
      className:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    },
    REJECTED: {
      label: "Rejected",
      className:
        "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
    },
  };

export default function LoansHistoryPage() {
  const [page, setPage] = useState(1);
  const limit = 15;

  // History = all loans (server filters by user for non-admin)
  const { data, isLoading } = useLoans(page, limit, {});

  return (
    <LoansLayout>
      <motion.div
        key="history"
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
                    <th className="px-5 py-3.5 font-medium">Receipt</th>
                    <th className="px-5 py-3.5 font-medium">Asset</th>
                    <th className="px-5 py-3.5 font-medium">Requester</th>
                    <th className="px-5 py-3.5 font-medium">Created At</th>
                    <th className="px-5 py-3.5 font-medium">Return</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: limit }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <Skeleton className="h-4 w-20" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : data?.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <History className="h-10 w-10 opacity-30" />
                          <p className="font-medium">No History</p>
                          <p className="text-sm">No loans registered yet</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data?.items.map((loan: Loan, i: number) => (
                      <motion.tr
                        key={loan.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-5 py-4 font-mono font-semibold text-xs text-foreground">
                          {loan.folio}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium truncate max-w-[180px]">
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
                          {format(new Date(loan.createdAt), "MMM dd, yyyy")}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {format(
                            new Date(loan.estimatedReturnDate),
                            "MMM dd, yyyy",
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[loan.status]?.className ?? ""}`}
                          >
                            {STATUS_CONFIG[loan.status]?.label ?? loan.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {data && data.pages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mt-4"
            >
              <p className="text-sm text-muted-foreground">
                {(page - 1) * limit + 1}–{Math.min(page * limit, data.total)} of{" "}
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
