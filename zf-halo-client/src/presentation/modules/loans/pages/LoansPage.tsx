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
import { motion, AnimatePresence } from "framer-motion";
import { LoanRequestSheet } from "@/presentation/modules/loans/LoanRequestSheet";
import { QRScannerSheet } from "@/presentation/modules/loans/QRScannerSheet";
import type { Loan, LoanStatus } from "@/domain/loans/loan.entity";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  PackageOpen,
  Undo2,
  ArrowLeftRight,
  Plus,
  QrCode,
  Clock,
  ListFilter,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

type Tab = "pending" | "all";

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
      label: "Checked Out",
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

export default function LoansPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";
  const canApprove = isAdmin || isManager;

  const [tab, setTab] = useState<Tab>(canApprove ? "pending" : "all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const limit = 10;

  // Pending tab: show REQUESTED + AUTHORIZED so managers can authorize AND checkout in one place.
  // No status filter → API returns all actionable loans sorted by creation date.
  const pendingFilters = search ? { search } : {};
  const allFilters = search ? { search } : {};
  const activeFilters = tab === "pending" ? pendingFilters : allFilters;

  const { data, isLoading } = useLoans(page, limit, activeFilters);
  const authorizeMutation = useAuthorizeLoan();
  const checkoutMutation = useCheckoutLoan();
  const checkinMutation = useCheckinLoan();

  // Badge: count REQUESTED loans (still pending approval)
  const { data: pendingData } = useLoans(1, 1, { status: "REQUESTED" });
  const pendingCount = pendingData?.total ?? 0;

  const handleAuthorize = (id: string) => {
    authorizeMutation.mutate({
      id,
      data: { comments: "Autorizado desde panel" },
    });
  };
  const handleCheckout = (id: string) => {
    checkoutMutation.mutate({
      id,
      data: { comments: "Entregado desde panel" },
    });
  };
  const handleCheckin = (id: string) => {
    checkinMutation.mutate({ id, data: { comments: "Devuelto desde panel" } });
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setPage(1);
    setSearch("");
  };

  return (
    <div className="container max-w-5xl px-4 py-6 md:py-10 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-blue-500/20 ring-1 ring-primary/20">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Loans</h1>
            <p className="text-sm text-muted-foreground">
              Asset loan lifecycle management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* QR Scanner — mobile only */}
          <Button
            id="btn-qr-scan"
            variant="outline"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => setQrOpen(true)}
            title="Scan QR"
          >
            <QrCode className="h-4 w-4" />
          </Button>

          <Button
            id="btn-new-loan"
            onClick={() => setSheetOpen(true)}
            className="gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Loan</span>
          </Button>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by folio or asset..."
              className="pl-9 bg-background/50 border-border"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                if (tab === "pending") setTab("all");
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Tabs — only shown to admins/managers */}
      {canApprove && (
        <div className="flex items-center gap-1 p-1 bg-muted rounded-xl w-fit">
          <button
            onClick={() => switchTab("pending")}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "pending"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Action Needed
            {pendingCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => switchTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "all"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListFilter className="h-3.5 w-3.5" />
            All
          </button>
        </div>
      )}

      {/* Pending requests — card view for admin */}
      {tab === "pending" && canApprove ? (
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
              <p className="font-medium">No pending requests</p>
              <p className="text-sm text-muted-foreground">
                All loan requests have been processed
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
                  {/* Left: info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-foreground bg-muted px-2 py-0.5 rounded-md">
                        {loan.folio}
                      </span>
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span
                        className={`text-xs font-medium ${
                          loan.status === "AUTHORIZED"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {STATUS_CONFIG[loan.status]?.label ?? loan.status}
                      </span>
                    </div>

                    <p className="text-base font-medium truncate">
                      {loan.asset?.machineName ?? loan.assetId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {loan.asset?.tag && (
                        <span className="font-mono mr-2">{loan.asset.tag}</span>
                      )}
                      {loan.asset?.model}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                      <span>
                        <strong className="text-foreground/80">
                          Requester:
                        </strong>{" "}
                        {loan.requester?.firstName} {loan.requester?.lastName}
                      </span>
                      <span>
                        <strong className="text-foreground/80">
                          Return by:
                        </strong>{" "}
                        {format(
                          new Date(loan.estimatedReturnDate),
                          "dd MMM yyyy",
                          { locale: es },
                        )}
                      </span>
                      {loan.destination?.name && (
                        <span>
                          <strong className="text-foreground/80">
                            Destination:
                          </strong>{" "}
                          {loan.destination.name}
                        </span>
                      )}
                      {loan.comments && (
                        <span className="w-full">
                          <strong className="text-foreground/80">Notes:</strong>{" "}
                          {loan.comments}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex gap-2 shrink-0">
                    {loan.status === "REQUESTED" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAuthorize(loan.id)}
                          disabled={authorizeMutation.isPending}
                          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Authorize
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                          disabled={authorizeMutation.isPending}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </>
                    )}
                    {loan.status === "AUTHORIZED" && isAdmin && (
                      <Button
                        size="sm"
                        onClick={() => handleCheckout(loan.id)}
                        disabled={checkoutMutation.isPending}
                        className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      >
                        <PackageOpen className="h-3.5 w-3.5" />
                        Checkout
                      </Button>
                    )}
                    {loan.status === "CHECKED_OUT" && isAdmin && (
                      <Button
                        size="sm"
                        onClick={() => handleCheckin(loan.id)}
                        disabled={checkinMutation.isPending}
                        className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                      >
                        <Undo2 className="h-3.5 w-3.5" />
                        Return
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      ) : (
        /* All loans — table view */
        <motion.div
          key="all"
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
                      <th className="px-5 py-3.5 font-medium">Status</th>
                      <th className="px-5 py-3.5 font-medium text-right">
                        Actions
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
                          key={loan.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          <td className="px-5 py-4 font-mono font-semibold text-foreground text-xs">
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
                            {loan.requester?.firstName}{" "}
                            {loan.requester?.lastName}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            {format(
                              new Date(loan.estimatedReturnDate),
                              "dd MMM yyyy",
                              { locale: es },
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                STATUS_CONFIG[loan.status]?.className ?? ""
                              }`}
                            >
                              {STATUS_CONFIG[loan.status]?.label ?? loan.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {canApprove && loan.status === "REQUESTED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                  onClick={() => handleAuthorize(loan.id)}
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Authorize
                                </Button>
                              )}
                              {isAdmin && loan.status === "AUTHORIZED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2.5 text-xs bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-600 dark:text-blue-400"
                                  onClick={() => handleCheckout(loan.id)}
                                >
                                  <PackageOpen className="mr-1 h-3 w-3" />
                                  Checkout
                                </Button>
                              )}
                              {isAdmin && loan.status === "CHECKED_OUT" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2.5 text-xs bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-600 dark:text-purple-400"
                                  onClick={() => handleCheckin(loan.id)}
                                >
                                  <Undo2 className="mr-1 h-3 w-3" />
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
      )}

      {/* Pagination */}
      <AnimatePresence>
        {data && data.pages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between"
          >
            <p className="text-sm text-muted-foreground">
              Mostrando{" "}
              <span className="font-medium text-foreground">
                {(page - 1) * limit + 1}
              </span>{" "}
              a{" "}
              <span className="font-medium text-foreground">
                {Math.min(page * limit, data.total)}
              </span>{" "}
              de{" "}
              <span className="font-medium text-foreground">{data.total}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                disabled={page === data.pages || isLoading}
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile FAB */}
      <button
        id="fab-new-loan"
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-24 right-4 z-40 md:hidden flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 text-primary-foreground hover:scale-105 active:scale-95 transition-transform"
        aria-label="New Loan"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Sheets */}
      <LoanRequestSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      <QRScannerSheet open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
}
