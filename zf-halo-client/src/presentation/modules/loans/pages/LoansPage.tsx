import { useState } from "react";
import {
  useLoans,
  useAuthorizeLoan,
  useCheckoutLoan,
  useCheckinLoan,
} from "@/application/loans/useLoans";
import { useAuthStore } from "@/application/auth/auth.store";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { motion } from "framer-motion";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);
import type { Loan, LoanStatus } from "@/domain/loans/loan.entity";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  PackageOpen,
  Undo2,
  ArrowLeftRight,
} from "lucide-react";
import { format } from "date-fns";

export default function LoansPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  const filters = search ? { folio: search } : {};

  const { data, isLoading } = useLoans(page, limit, filters);
  const authorizeMutation = useAuthorizeLoan();
  const checkoutMutation = useCheckoutLoan();
  const checkinMutation = useCheckinLoan();

  const handleAuthorize = (id: string) => {
    authorizeMutation.mutate({
      id,
      data: { comments: "Authorized via panel" },
    });
  };
  const handleCheckout = (id: string) => {
    checkoutMutation.mutate({
      id,
      data: { comments: "Checked out via panel" },
    });
  };
  const handleCheckin = (id: string) => {
    checkinMutation.mutate({ id, data: { comments: "Returned via panel" } });
  };

  const getStatusBadge = (status: LoanStatus) => {
    switch (status) {
      case "REQUESTED":
        return (
          <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full text-xs font-medium border border-blue-500/20">
            Requested
          </span>
        );
      case "AUTHORIZED":
        return (
          <span className="bg-purple-500/10 text-purple-500 px-2 py-1 rounded-full text-xs font-medium border border-purple-500/20">
            Authorized
          </span>
        );
      case "CHECKED_OUT":
        return (
          <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full text-xs font-medium border border-amber-500/20">
            In Use
          </span>
        );
      case "RETURNED":
        return (
          <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full text-xs font-medium border border-emerald-500/20">
            Returned
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-5xl px-4 py-6 md:py-10 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-blue-500/20 ring-1 ring-primary/20">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loans</h1>
            <p className="text-sm text-muted-foreground">
              Manage asset loan lifecycle
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by folio..."
            className="pl-9 bg-background/50 backdrop-blur-sm border-white/[0.06]"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border border-white/[0.06] bg-white/[0.02] shadow-xl backdrop-blur-xl overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-white/[0.02] border-b border-white/[0.06] text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium tracking-wider">
                      Folio
                    </th>
                    <th className="px-6 py-4 font-medium tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-4 font-medium tracking-wider">
                      Requester
                    </th>
                    <th className="px-6 py-4 font-medium tracking-wider">
                      Return Date
                    </th>
                    <th className="px-6 py-4 font-medium tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 font-medium tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {isLoading ? (
                    Array.from({ length: limit }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-24 bg-white/5" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-32 bg-white/5" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-24 bg-white/5" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-24 bg-white/5" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-20 rounded-full bg-white/5" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Skeleton className="h-8 w-24 ml-auto bg-white/5" />
                        </td>
                      </tr>
                    ))
                  ) : data?.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-muted-foreground"
                      >
                        No loans found
                      </td>
                    </tr>
                  ) : (
                    data?.items.map((loan: Loan, i: number) => (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={loan.id}
                        className="hover:bg-white/[0.04] transition-colors group"
                      >
                        <td className="px-6 py-4 font-medium text-foreground">
                          {loan.folio}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]">
                          {loan.asset?.model ||
                            loan.asset?.machineName ||
                            loan.assetId}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {loan.requester?.firstName} {loan.requester?.lastName}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {format(
                            new Date(loan.estimatedReturnDate),
                            "MMM dd, yyyy",
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(loan.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {(user?.role === "ADMIN" ||
                              user?.role === "MANAGER") &&
                              loan.status === "REQUESTED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-400 hover:text-purple-300"
                                  onClick={() => handleAuthorize(loan.id)}
                                >
                                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" />{" "}
                                  Authorize
                                </Button>
                              )}
                            {user?.role === "ADMIN" &&
                              loan.status === "AUTHORIZED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-400 hover:text-amber-300"
                                  onClick={() => handleCheckout(loan.id)}
                                >
                                  <PackageOpen className="mr-1.5 h-3.5 w-3.5" />{" "}
                                  Checkout
                                </Button>
                              )}
                            {user?.role === "ADMIN" &&
                              loan.status === "CHECKED_OUT" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400 hover:text-emerald-300"
                                  onClick={() => handleCheckin(loan.id)}
                                >
                                  <Undo2 className="mr-1.5 h-3.5 w-3.5" />{" "}
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
      </motion.div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(page - 1) * limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(page * limit, data.total)}
            </span>{" "}
            of <span className="font-medium text-foreground">{data.total}</span>{" "}
            loans
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="border-white/[0.06] bg-white/[0.02]"
              disabled={page === 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium text-muted-foreground">
              Page {page} of {data.pages}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="border-white/[0.06] bg-white/[0.02]"
              disabled={page === data.pages || isLoading}
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
