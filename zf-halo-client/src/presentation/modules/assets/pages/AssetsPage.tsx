import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Package, Search, Plus, Eye, Pencil, Tag, MapPin, DollarSign } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { useAuthStore } from "@/application/auth/auth.store"
import { assetsApi } from "@/infrastructure/http/assets.api"
import type { Asset, MachineStatus } from "@/domain/assets/models/asset.model"
import {
    MachineStatus as MachineStatusEnum,
    MachineStatusLabel,
    MachineStatusColor,
} from "@/domain/assets/models/asset.model"
import { Role } from "@/domain/auth/models/user.model"
import { cn } from "@/lib/utils"

export default function AssetsPage() {
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const isManager = user?.role === Role.ADMIN || user?.role === Role.MANAGER

    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<MachineStatus | "ALL">("ALL")

    const { data: assets = [], isLoading } = useQuery<Asset[]>({
        queryKey: ["assets"],
        queryFn: () => assetsApi.getAssets(),
    })

    const filtered = assets.filter(a => {
        const matchesSearch = `${a.machineName} ${a.tag} ${a.brand} ${a.serialNumber} ${a.area}`
            .toLowerCase()
            .includes(search.toLowerCase())
        const matchesStatus = statusFilter === "ALL" || a.machineStatus === statusFilter
        return matchesSearch && matchesStatus
    })

    const allStatuses = Object.values(MachineStatusEnum)

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
                            {assets.length} registered asset{assets.length !== 1 ? "s" : ""}
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
                            onChange={e => setSearch(e.target.value)}
                            aria-label="Search assets"
                            className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-56"
                        />
                    </div>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as MachineStatus | "ALL")}
                        aria-label="Filter by status"
                        className="h-10 rounded-xl border border-white/[0.1] bg-white/[0.06] px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                        <option value="ALL" className="bg-background">All Statuses</option>
                        {allStatuses.map(s => (
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
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                            {search || statusFilter !== "ALL"
                                ? "No assets match your filters"
                                : "No assets registered yet"}
                        </div>
                    ) : null}

                    {/* Asset Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((asset, i) => (
                            <motion.div
                                key={asset.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: Math.min(i, 10) * 0.03 }}
                                className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 transition-colors hover:bg-white/[0.06]"
                            >
                                {/* Status badge */}
                                <div className="mb-3 flex items-center justify-between">
                                    <span className={cn(
                                        "inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-medium ring-1",
                                        MachineStatusColor[asset.machineStatus]
                                    )}>
                                        {MachineStatusLabel[asset.machineStatus]}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        #{asset.identifier}
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
                                        <span>{asset.area} / {asset.subArea}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-3 w-3 shrink-0" />
                                        <span>${asset.commercialValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                {/* Actions — navigate to pages */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => void navigate({ to: `/assets/${asset.id}` })}
                                        className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                                        aria-label={`View ${asset.machineName}`}
                                    >
                                        <Eye className="h-3 w-3" />
                                        View
                                    </button>
                                    {isManager ? (
                                        <button
                                            onClick={() => void navigate({ to: `/assets/${asset.id}/edit` })}
                                            className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/10"
                                            aria-label={`Edit ${asset.machineName}`}
                                        >
                                            <Pencil className="h-3 w-3" />
                                            Edit
                                        </button>
                                    ) : null}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
