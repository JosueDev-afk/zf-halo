import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeftRight,
  Clock,
  PackageCheck,
  History,
  Plus,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/application/auth/auth.store";
import { useLoans } from "@/application/loans/useLoans";
import { LoanRequestSheet } from "@/presentation/modules/loans/LoanRequestSheet";
import { QRScannerSheet } from "@/presentation/modules/loans/QRScannerSheet";

interface LoansLayoutProps {
  children: React.ReactNode;
}

export function LoansLayout({ children }: LoansLayoutProps) {
  const { user } = useAuthStore();
  const canApprove = user?.role === "ADMIN" || user?.role === "MANAGER";
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  // Badge count for pending approvals
  const { data: pendingData } = useLoans(1, 1, { status: "REQUESTED" });
  const pendingCount = pendingData?.total ?? 0;

  const navItems = [
    {
      to: "/loans/active" as const,
      icon: PackageCheck,
      label: "Active",
      show: true,
    },
    {
      to: "/loans/pending" as const,
      icon: Clock,
      label: "Pending Approval",
      badge: pendingCount,
      show: canApprove,
    },
    {
      to: "/loans/history" as const,
      icon: History,
      label: "History",
      show: true,
    },
  ];

  return (
    <div className="container max-w-5xl px-4 py-6 md:py-10 space-y-6">
      {/* Module header */}
      <div className="flex items-center justify-between">
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
          <button
            onClick={() => setQrOpen(true)}
            className="flex h-9 w-9 md:hidden items-center justify-center rounded-xl border border-border bg-background hover:bg-accent transition-colors"
            title="Scan QR"
          >
            <QrCode className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Loan</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation */}
      <nav className="flex items-center gap-1 border-b border-border pb-0">
        {navItems
          .filter((i) => i.show)
          .map((item) => {
            const isActive = currentPath === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg border-b-2 -mb-px",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.badge != null && item.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
      </nav>

      {/* Page content */}
      {children}

      {/* FAB Mobile */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-24 right-4 z-40 md:hidden flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 text-primary-foreground hover:scale-105 active:scale-95 transition-transform"
        aria-label="New Loan"
      >
        <Plus className="h-6 w-6" />
      </button>

      <LoanRequestSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      <QRScannerSheet open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
}
