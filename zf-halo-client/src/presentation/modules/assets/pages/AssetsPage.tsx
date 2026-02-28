import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  Plus,
  Tag,
  MapPin,
  DollarSign,
  ArrowLeftRight,
} from "lucide-react";
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
import { LoanRequestSheet } from "@/presentation/modules/loans/LoanRequestSheet";
import { Paginator } from "@/presentation/components/ui/Paginator";

const ITEMS_PER_PAGE = 12;

export default function AssetsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === Role.ADMIN || user?.role === Role.MANAGER;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MachineStatus | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(1);
  const [loanAsset, setLoanAsset] = useState<Asset | null>(null);

  const [debouncedSearch] = useDebounce(search, 400);

  // Reset page whenever filters change
  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const handleStatus = (v: MachineStatus | "ALL") => {
    setStatusFilter(v);
    setPage(1);
  };

  const { data, isLoading } = useQuery<PaginatedResult<Asset>>({
    queryKey: ["assets", page, ITEMS_PER_PAGE, debouncedSearch, statusFilter],
    queryFn: () =>
      assetsApi.getAssets({
        page,
        limit: ITEMS_PER_PAGE,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
      }),
    placeholderData: (prev) => prev, // keep previous data while loading next page
  });

  const assets = data?.items ?? [];
  const totalPages = data?.pages ?? 1;
  const totalItems = data?.total ?? 0;

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
            <h1 className="text-2xl font-bold tracking-tight">Activos</h1>
            <p className="text-sm text-muted-foreground">
              {totalItems.toLocaleString()} activo{totalItems !== 1 ? "s" : ""}{" "}
              registrado{totalItems !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar activos..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              aria-label="Buscar activos"
              className="h-10 w-full rounded-xl border border-border bg-background/60 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-56"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              handleStatus(e.target.value as MachineStatus | "ALL")
            }
            aria-label="Filtrar por estado"
            className="h-10 rounded-xl border border-border bg-background/60 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="ALL" className="bg-background">
              Todos los estados
            </option>
            {allStatuses.map((s) => (
              <option key={s} value={s} className="bg-background">
                {MachineStatusLabel[s]}
              </option>
            ))}
          </select>

          {/* Create (RBAC) */}
          {isManager ? (
            <button
              onClick={() => void navigate({ to: "/assets/new" })}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Activo</span>
            </button>
          ) : null}
        </div>
      </motion.div>

      {/* Loading overlay */}
      {isLoading && assets.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : assets.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          {search || statusFilter !== "ALL"
            ? "Ningún activo coincide con los filtros."
            : "No hay activos registrados aún."}
        </div>
      ) : (
        <>
          {/* Grid — slightly faded while fetching next page */}
          <div
            className={cn(
              "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
              isLoading && "opacity-60 pointer-events-none",
            )}
          >
            {assets.map((asset, i) => {
              const stock = asset.currentQuantity ?? 0;
              const outOfStock =
                asset.assetType === "BULK"
                  ? stock <= 0
                  : asset.machineStatus === "LOANED";

              let stockColor = "bg-red-500/15 text-red-500 ring-red-500/20";
              if (stock > 10)
                stockColor =
                  "bg-emerald-500/15 text-emerald-500 ring-emerald-500/20";
              else if (stock > 0)
                stockColor = "bg-amber-500/15 text-amber-500 ring-amber-500/20";

              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i, 11) * 0.03 }}
                  className="group relative cursor-pointer rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/10"
                  onClick={() => void navigate({ to: `/assets/${asset.id}` })}
                >
                  {/* Status & Stock Badges */}
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-medium ring-1 shadow-sm truncate",
                        MachineStatusColor[asset.machineStatus],
                      )}
                    >
                      {MachineStatusLabel[asset.machineStatus]}
                    </span>
                    {asset.assetType === "BULK" && (
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center rounded-lg px-2.5 py-1 text-[11px] font-bold ring-1 shadow-sm",
                          stockColor,
                        )}
                      >
                        {stock}u
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1 font-semibold leading-tight line-clamp-2">
                    {asset.machineName}
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground truncate">
                    {asset.brand} — {asset.model}
                  </p>

                  <div className="mb-4 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3 w-3 shrink-0" />
                      <span className="truncate">{asset.tag}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {asset.area} / {asset.subArea}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 shrink-0" />
                      <span>
                        $
                        {asset.commercialValue.toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Request Loan Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLoanAsset(asset);
                    }}
                    disabled={outOfStock}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all active:scale-95",
                      outOfStock
                        ? "cursor-not-allowed bg-muted text-muted-foreground opacity-60"
                        : "cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 ring-1 ring-primary/20",
                    )}
                    title={
                      outOfStock ? "Sin stock disponible" : "Solicitar préstamo"
                    }
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    {outOfStock ? "Sin disponibilidad" : "Solicitar Préstamo"}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Paginator */}
          <Paginator
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setPage}
            className="mt-8 mb-4"
          />
        </>
      )}

      {/* Loan Request Sheet */}
      <LoanRequestSheet
        open={loanAsset !== null}
        onClose={() => setLoanAsset(null)}
        preselectedAsset={loanAsset}
      />
    </div>
  );
}
