import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Undo2, ArrowLeftRight, PackageOpen } from "lucide-react";
import {
  useLoans,
  useCheckinLoan,
  useCheckoutLoan,
} from "@/application/loans/useLoans";
import { useAuthStore } from "@/application/auth/auth.store";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { LoansLayout } from "@/presentation/modules/loans/LoansLayout";
import type { Loan } from "@/domain/loans/loan.entity";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

const STATUS_BADGE: Record<string, string> = {
  AUTHORIZED:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
  CHECKED_OUT:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
};

const STATUS_LABEL: Record<string, string> = {
  AUTHORIZED: "Authorized",
  CHECKED_OUT: "Checked Out",
};

export default function ActiveLoansPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";
  const canAction = isAdmin || isManager;

  // Fetch AUTHORIZED and CHECKED_OUT separately so pagination doesn't hide either.
  // Large limit (100) since these are actionable items that need to be visible.
  const { data: authorizedData, isLoading: loadingAuthorized } = useLoans(
    1,
    100,
    { status: "AUTHORIZED" },
  );
  const { data: checkedOutData, isLoading: loadingCheckedOut } = useLoans(
    1,
    100,
    { status: "CHECKED_OUT" },
  );

  const checkoutMutation = useCheckoutLoan();
  const checkinMutation = useCheckinLoan();

  const isLoading = loadingAuthorized || loadingCheckedOut;

  // Combine both lists: AUTHORIZED first (needs action), then CHECKED_OUT
  const activeItems: Loan[] = [
    ...(authorizedData?.items ?? []),
    ...(checkedOutData?.items ?? []),
  ];

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
                    <th className="px-5 py-3.5 font-medium">Asset</th>
                    <th className="px-5 py-3.5 font-medium">Requester</th>
                    <th className="px-5 py-3.5 font-medium">Return By</th>
                    <th className="px-5 py-3.5 font-medium">Destination</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                    <th className="px-5 py-3.5 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <Skeleton className="h-4 w-24" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : activeItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <ArrowLeftRight className="h-10 w-10 opacity-30" />
                          <p className="font-medium">No active loans</p>
                          <p className="text-sm">
                            No assets are currently authorized or checked out
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    activeItems.map((loan: Loan, i: number) => (
                      <motion.tr
                        key={loan.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="hover:bg-muted/30 transition-colors"
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
                            { locale: enUS },
                          )}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground truncate max-w-[140px]">
                          {loan.destination?.name ?? "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[loan.status] ?? ""}`}
                          >
                            {STATUS_LABEL[loan.status] ?? loan.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canAction && loan.status === "AUTHORIZED" && (
                              <Button
                                size="sm"
                                disabled={checkoutMutation.isPending}
                                onClick={() =>
                                  checkoutMutation.mutate({
                                    id: loan.id,
                                    data: {
                                      comments: "Checked out from panel",
                                    },
                                  })
                                }
                                className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
                              >
                                <PackageOpen className="h-3 w-3" />
                                Checkout
                              </Button>
                            )}
                            {canAction && loan.status === "CHECKED_OUT" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-3 text-xs bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-600 dark:text-purple-400 gap-1"
                                disabled={checkinMutation.isPending}
                                onClick={() =>
                                  checkinMutation.mutate({
                                    id: loan.id,
                                    data: { comments: "Returned from panel" },
                                  })
                                }
                              >
                                <Undo2 className="h-3 w-3" />
                                Return
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

        {/* Summary counts */}
        <AnimatePresence>
          {!isLoading && activeItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4 text-sm text-muted-foreground"
            >
              <span>
                <span className="font-medium text-purple-500">
                  {authorizedData?.total ?? 0}
                </span>{" "}
                awaiting checkout
              </span>
              <span>
                <span className="font-medium text-blue-500">
                  {checkedOutData?.total ?? 0}
                </span>{" "}
                checked out
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </LoansLayout>
  );
}
