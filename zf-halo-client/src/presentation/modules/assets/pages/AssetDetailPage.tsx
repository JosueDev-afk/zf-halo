import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowLeft, Hash, Tag, Cpu, Factory, MapPin, Calendar, DollarSign, Pencil, Trash2 } from "lucide-react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useAuthStore } from "@/application/auth/auth.store"
import { assetsApi } from "@/infrastructure/http/assets.api"
import type { Asset } from "@/domain/assets/models/asset.model"
import {
    MachineStatusLabel, MachineStatusColor,
    PurchaseTypeLabel, NationalTypeLabel,
} from "@/domain/assets/models/asset.model"
import { Role } from "@/domain/auth/models/user.model"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useState } from "react"
import { AnimatePresence } from "framer-motion"

export default function AssetDetailPage() {
    const { id } = useParams({ strict: false }) as { id: string }
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const user = useAuthStore(s => s.user)
    const isManager = user?.role === Role.ADMIN || user?.role === Role.MANAGER
    const [showDelete, setShowDelete] = useState(false)

    const { data: asset, isLoading } = useQuery<Asset>({
        queryKey: ["assets", id],
        queryFn: () => assetsApi.getAssetById(id),
        enabled: !!id,
    })

    const deleteMutation = useMutation({
        mutationFn: (assetId: string) => assetsApi.deleteAsset(assetId),
        onSuccess: () => {
            toast.success("Asset deleted")
            void queryClient.invalidateQueries({ queryKey: ["assets"] })
            void navigate({ to: "/assets" })
        },
        onError: () => toast.error("Failed to delete asset"),
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!asset) {
        return (
            <div className="container max-w-3xl px-4 py-10 text-center">
                <p className="text-muted-foreground">Asset not found</p>
                <button onClick={() => void navigate({ to: "/assets" })} className="mt-4 text-sm text-primary hover:underline">
                    ← Back to Assets
                </button>
            </div>
        )
    }

    return (
        <div className="container max-w-3xl px-4 py-6 md:py-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => void navigate({ to: "/assets" })}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
                        aria-label="Back to assets"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{asset.machineName}</h1>
                        <p className="text-sm text-muted-foreground">{asset.brand} — {asset.model}</p>
                    </div>
                </div>

                {isManager ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => void navigate({ to: `/assets/${asset.id}/edit` })}
                            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-500/10 px-3.5 py-2 text-sm font-medium text-blue-400 ring-1 ring-blue-500/20 transition-all hover:bg-blue-500/20 active:scale-95"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                        </button>
                        <button
                            onClick={() => setShowDelete(true)}
                            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-red-500/10 px-3.5 py-2 text-sm font-medium text-red-400 ring-1 ring-red-500/20 transition-all hover:bg-red-500/20 active:scale-95"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </button>
                    </div>
                ) : null}
            </motion.div>

            {/* Status + ID header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="mb-4 flex items-center justify-between"
            >
                <span className={cn(
                    "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ring-1",
                    MachineStatusColor[asset.machineStatus]
                )}>
                    {MachineStatusLabel[asset.machineStatus]}
                </span>
                <span className="text-sm text-muted-foreground">ID #{asset.identifier}</span>
            </motion.div>

            {/* Detail Grid */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="rounded-2xl border border-white/[0.1] bg-white/[0.05] p-5 backdrop-blur-sm"
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field icon={<Hash className="h-3.5 w-3.5" />} label="Identifier" value={`#${asset.identifier}`} />
                    <Field icon={<Tag className="h-3.5 w-3.5" />} label="Tag (QR)" value={asset.tag} />
                    <Field icon={<Cpu className="h-3.5 w-3.5" />} label="Serial Number" value={asset.serialNumber} />
                    <Field icon={<Factory className="h-3.5 w-3.5" />} label="Brand / Model" value={`${asset.brand} — ${asset.model}`} />
                    <Field icon={<MapPin className="h-3.5 w-3.5" />} label="Area" value={`${asset.area} / ${asset.subArea}`} />
                    <Field label="Category" value={asset.category} />
                    <Field label="Project" value={asset.projectName} />
                    <Field icon={<Calendar className="h-3.5 w-3.5" />} label="Year" value={asset.year?.toString() ?? "—"} />
                    <Field icon={<DollarSign className="h-3.5 w-3.5" />} label="Commercial Value" value={`$${asset.commercialValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
                    <Field label="Purchase Type" value={PurchaseTypeLabel[asset.purchaseType]} />
                    {asset.nationalType ? <Field label="National Type" value={NationalTypeLabel[asset.nationalType]} /> : null}
                    <Field label="Purchased" value={asset.isPurchased ? "Yes" : "No"} />
                    {asset.customsDocument ? <Field label="Customs (Pedimento)" value={asset.customsDocument} /> : null}
                    {asset.invoice ? <Field label="Invoice (Factura)" value={asset.invoice} /> : null}
                    {asset.initialQuantity != null ? <Field label="Initial Qty" value={asset.initialQuantity.toString()} /> : null}
                    {asset.currentQuantity != null ? <Field label="Current Qty" value={asset.currentQuantity.toString()} /> : null}
                </div>

                {asset.description ? (
                    <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
                        <p className="mb-1 text-xs font-semibold text-muted-foreground">Description</p>
                        <p className="text-sm">{asset.description}</p>
                    </div>
                ) : null}
                {asset.comments ? (
                    <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
                        <p className="mb-1 text-xs font-semibold text-muted-foreground">Comments</p>
                        <p className="text-sm">{asset.comments}</p>
                    </div>
                ) : null}

                {asset.purchaseDate ? (
                    <p className="mt-4 text-right text-xs text-muted-foreground">
                        Purchased: {new Date(asset.purchaseDate).toLocaleDateString()}
                    </p>
                ) : null}
            </motion.div>

            {/* Delete confirmation */}
            <AnimatePresence>
                {showDelete ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                        onClick={() => setShowDelete(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-background p-6 text-center shadow-2xl"
                        >
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
                                <Trash2 className="h-6 w-6 text-red-400" />
                            </div>
                            <h3 className="mb-2 font-semibold">Delete Asset</h3>
                            <p className="mb-6 text-sm text-muted-foreground">
                                Are you sure you want to delete <strong>{asset.machineName}</strong>?
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setShowDelete(false)}
                                    className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.06]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteMutation.mutate(asset.id)}
                                    disabled={deleteMutation.isPending}
                                    className="flex cursor-pointer items-center gap-2 rounded-xl bg-red-500/15 px-4 py-2 text-sm font-medium text-red-400 ring-1 ring-red-500/20 transition-all hover:bg-red-500/25 active:scale-95 disabled:opacity-50"
                                >
                                    {deleteMutation.isPending ? (
                                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                                    ) : null}
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    )
}

function Field({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
    return (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5">
            <p className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {icon ? icon : null}
                {label}
            </p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    )
}
