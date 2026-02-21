import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Package, Search, Plus, Tag, MapPin, DollarSign } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/application/auth/auth.store";
import { assetsApi } from "@/infrastructure/http/assets.api";
import type { Asset, MachineStatus } from "@/domain/assets/models/asset.model";
import {
  MachineStatus as MachineStatusEnum,
  MachineStatusLabel,
  MachineStatusColor,
} from "@/domain/assets/models/asset.model";
import { Role } from "@/domain/auth/models/user.model";
import type { PaginatedResult } from "@/domain/common/models/pagination.model";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";

export default function AssetsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === Role.ADMIN || user?.role === Role.MANAGER;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MachineStatus | "ALL">(
    "ALL",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [debouncedSearch] = useDebounce(search, 500);

  const { data: result, isLoading } = useQuery<PaginatedResult<Asset>>({
    queryKey: [
      "assets",
      currentPage,
      itemsPerPage,
      debouncedSearch,
      statusFilter,
    ],
    queryFn: () =>
      assetsApi.getAssets({ page: currentPage, limit: itemsPerPage }),
  });

  const assets = useMemo(() => {
    if (!result?.items) return [];

    // Fallback client-side filtering since API doesn't support complex queries yet
    return result.items.filter((a) => {
      const matchesSearch =
        !debouncedSearch ||
        `${a.machineName} ${a.tag} ${a.brand} ${a.serialNumber} ${a.area}`
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || a.machineStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [result, debouncedSearch, statusFilter]);

  const totalPages = result?.pages || 1;
  const totalItems = result?.total || 0;

  if (currentPage > totalPages && totalPages > 0 && currentPage !== 1) {
    setCurrentPage(1);
  }

  const allStatuses = Object.values(MachineStatusEnum);

  return (
    <div className="container max-w-7xl px-4 py-6 md:py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-blue-500/20 ring-1 ring-primary/20">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
            <p className="text-sm text-muted-foreground">
              {totalItems} registered asset{totalItems !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search assets"
              className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-56"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as MachineStatus | "ALL")
            }
            aria-label="Filter by status"
            className="h-10 rounded-xl border border-white/[0.1] bg-white/[0.06] px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="ALL" className="bg-background">
              All Statuses
            </option>
            {allStatuses.map((s) => (
              <option key={s} value={s} className="bg-background">
                {MachineStatusLabel[s]}
              </option>
            ))}
          </select>

          {/* Create button (RBAC) */}
          {isManager ? (
            <button
              onClick={() => void navigate({ to: "/assets/new" })}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Asset</span>
            </button>
          ) : null}
        </div>
      </motion.div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {assets.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              {search || statusFilter !== "ALL"
                ? "No assets match your filters"
                : "No assets registered yet"}
            </div>
          ) : null}

          {/* Asset Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset, i) => {
              const stock = asset.currentQuantity ?? 0;
              let stockColor = "bg-red-500/15 text-red-500 ring-red-500/20";
              if (stock > 10) {
                stockColor =
                  "bg-emerald-500/15 text-emerald-500 ring-emerald-500/20";
              } else if (stock > 5) {
                stockColor = "bg-amber-500/15 text-amber-500 ring-amber-500/20";
              }

              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 12) * 0.04 }}
                  onClick={() => void navigate({ to: `/assets/${asset.id}` })}
                  className="group relative cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-primary/10"
                >
                  {/* Status & Stock Badges */}
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-medium ring-1 shadow-sm",
                        MachineStatusColor[asset.machineStatus],
                      )}
                    >
                      {MachineStatusLabel[asset.machineStatus]}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ring-1 shadow-sm",
                        stockColor,
                      )}
                    >
                      Stock: {stock}
                    </span>
                  </div>

                  {/* Machine name + brand */}
                  <h3 className="mb-1 font-semibold leading-tight">
                    {asset.machineName}
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {asset.brand} — {asset.model}
                  </p>

                  {/* Quick info */}
                  <div className="mb-4 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3 w-3 shrink-0" />
                      <span className="truncate">{asset.tag}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>
                        {asset.area} / {asset.subArea}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 shrink-0" />
                      <span>
                        $
                        {asset.commercialValue.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 mb-4 flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-6 py-4 backdrop-blur-sm">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {totalItems}
                </span>{" "}
                results
              </span>

              <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 text-sm font-medium text-foreground transition-all hover:bg-white/[0.08] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="hidden items-center gap-1 sm:flex">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition-all active:scale-95",
                          currentPage === page
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-white/[0.08] hover:text-foreground",
                        )}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
                <span className="text-sm font-medium sm:hidden">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex h-9 cursor-pointer items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 text-sm font-medium text-foreground transition-all hover:bg-white/[0.08] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
