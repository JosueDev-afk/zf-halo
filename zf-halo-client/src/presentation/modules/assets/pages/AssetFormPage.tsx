import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { assetsApi } from "@/infrastructure/http/assets.api"
import type { Asset, CreateAssetInput } from "@/domain/assets/models/asset.model"
import {
    MachineStatus as MachineStatusEnum,
    MachineStatusLabel,
    PurchaseType,
    PurchaseTypeLabel,
    NationalType,
    NationalTypeLabel,
} from "@/domain/assets/models/asset.model"
import { toast } from "sonner"

const defaultForm: CreateAssetInput = {
    identifier: 0,
    area: "",
    subArea: "",
    category: "",
    projectName: "",
    machineName: "",
    tag: "",
    serialNumber: "",
    model: "",
    brand: "",
    commercialValue: 0,
    purchaseType: PurchaseType.NATIONAL,
    machineStatus: MachineStatusEnum.OPERATIVE,
    isPurchased: false,
}

export default function AssetFormPage() {
    const params = useParams({ strict: false }) as { id?: string }
    const id = params.id
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const isEdit = !!id

    const [form, setForm] = useState<CreateAssetInput>(defaultForm)
    const [formPopulated, setFormPopulated] = useState(false)

    // Fetch existing asset for edit mode
    const { data: existingAsset, isLoading } = useQuery<Asset>({
        queryKey: ["assets", id],
        queryFn: () => assetsApi.getAssetById(id!),
        enabled: isEdit,
    })

    // Populate form when asset data arrives (only once)
    useMemo(() => {
        if (!existingAsset || formPopulated) return
        setForm({
            identifier: existingAsset.identifier,
            area: existingAsset.area,
            subArea: existingAsset.subArea,
            category: existingAsset.category,
            initialQuantity: existingAsset.initialQuantity,
            currentQuantity: existingAsset.currentQuantity,
            projectName: existingAsset.projectName,
            machineName: existingAsset.machineName,
            tag: existingAsset.tag,
            serialNumber: existingAsset.serialNumber,
            model: existingAsset.model,
            brand: existingAsset.brand,
            year: existingAsset.year,
            customsDocument: existingAsset.customsDocument,
            invoice: existingAsset.invoice,
            commercialValue: existingAsset.commercialValue,
            purchaseDate: existingAsset.purchaseDate,
            description: existingAsset.description,
            comments: existingAsset.comments,
            purchaseType: existingAsset.purchaseType,
            nationalType: existingAsset.nationalType,
            machineStatus: existingAsset.machineStatus,
            isPurchased: existingAsset.isPurchased,
        })
        setFormPopulated(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingAsset])

    const createMutation = useMutation({
        mutationFn: (data: CreateAssetInput) => assetsApi.createAsset(data),
        onSuccess: () => {
            toast.success("Asset created")
            void queryClient.invalidateQueries({ queryKey: ["assets"] })
            void navigate({ to: "/assets" })
        },
        onError: () => toast.error("Failed to create asset"),
    })

    const updateMutation = useMutation({
        mutationFn: (data: CreateAssetInput) => assetsApi.updateAsset(id!, data),
        onSuccess: () => {
            toast.success("Asset updated")
            void queryClient.invalidateQueries({ queryKey: ["assets"] })
            void navigate({ to: `/assets/${id}` })
        },
        onError: () => toast.error("Failed to update asset"),
    })

    const isSaving = createMutation.isPending || updateMutation.isPending

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (isEdit) {
            updateMutation.mutate(form)
        } else {
            createMutation.mutate(form)
        }
    }

    function updateField(key: keyof CreateAssetInput, value: unknown) {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    if (isEdit && isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    const allStatuses = Object.values(MachineStatusEnum)

    return (
        <div className="container max-w-3xl px-4 py-6 md:py-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 flex items-center gap-3"
            >
                <button
                    onClick={() => void navigate({ to: isEdit ? `/assets/${id}` : "/assets" })}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <h1 className="text-xl font-bold tracking-tight">
                    {isEdit ? "Edit Asset" : "New Asset"}
                </h1>
            </motion.div>

            {/* Form */}
            <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                onSubmit={handleSubmit}
                className="rounded-2xl border border-white/[0.1] bg-white/[0.05] p-5 backdrop-blur-sm"
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput label="Identifier" type="number" value={form.identifier} onChange={v => updateField("identifier", Number(v))} required />
                    <FormInput label="Tag (QR Code)" value={form.tag} onChange={v => updateField("tag", v)} required />
                    <FormInput label="Machine Name" value={form.machineName} onChange={v => updateField("machineName", v)} required />
                    <FormInput label="Project Name" value={form.projectName} onChange={v => updateField("projectName", v)} required />
                    <FormInput label="Brand" value={form.brand} onChange={v => updateField("brand", v)} required />
                    <FormInput label="Model" value={form.model} onChange={v => updateField("model", v)} required />
                    <FormInput label="Serial Number" value={form.serialNumber} onChange={v => updateField("serialNumber", v)} required />
                    <FormInput label="Area" value={form.area} onChange={v => updateField("area", v)} required />
                    <FormInput label="Sub Area" value={form.subArea} onChange={v => updateField("subArea", v)} required />
                    <FormInput label="Category" value={form.category} onChange={v => updateField("category", v)} required />
                    <FormInput label="Year" type="number" value={form.year ?? ""} onChange={v => updateField("year", v ? Number(v) : null)} />
                    <FormInput label="Commercial Value" type="number" value={form.commercialValue} onChange={v => updateField("commercialValue", Number(v))} required />
                    <FormInput label="Purchase Date" type="date" value={form.purchaseDate ?? ""} onChange={v => updateField("purchaseDate", v || null)} />
                    <FormInput label="Customs Document" value={form.customsDocument ?? ""} onChange={v => updateField("customsDocument", v || null)} />
                    <FormInput label="Invoice" value={form.invoice ?? ""} onChange={v => updateField("invoice", v || null)} />
                    <FormInput label="Initial Quantity" type="number" value={form.initialQuantity ?? ""} onChange={v => updateField("initialQuantity", v ? Number(v) : null)} />
                    <FormInput label="Current Quantity" type="number" value={form.currentQuantity ?? ""} onChange={v => updateField("currentQuantity", v ? Number(v) : null)} />

                    {/* Selects */}
                    <FormSelect
                        label="Purchase Type"
                        value={form.purchaseType}
                        onChange={v => updateField("purchaseType", v)}
                        options={Object.values(PurchaseType).map(v => ({ value: v, label: PurchaseTypeLabel[v] }))}
                    />
                    {form.purchaseType === PurchaseType.NATIONAL ? (
                        <FormSelect
                            label="National Type"
                            value={form.nationalType ?? ""}
                            onChange={v => updateField("nationalType", v || null)}
                            options={[
                                { value: "", label: "— None —" },
                                ...Object.values(NationalType).map(v => ({ value: v, label: NationalTypeLabel[v] })),
                            ]}
                        />
                    ) : null}
                    <FormSelect
                        label="Machine Status"
                        value={form.machineStatus ?? MachineStatusEnum.OPERATIVE}
                        onChange={v => updateField("machineStatus", v)}
                        options={allStatuses.map(v => ({ value: v, label: MachineStatusLabel[v] }))}
                    />

                    {/* Purchased checkbox */}
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.isPurchased ?? false}
                            onChange={e => updateField("isPurchased", e.target.checked)}
                            className="h-4 w-4 rounded border-white/[0.1] bg-white/[0.03] text-primary focus:ring-primary/40"
                        />
                        Purchased
                    </label>
                </div>

                {/* Text areas */}
                <div className="mt-4 space-y-4">
                    <FormTextarea label="Description" value={form.description ?? ""} onChange={v => updateField("description", v || null)} />
                    <FormTextarea label="Comments" value={form.comments ?? ""} onChange={v => updateField("comments", v || null)} />
                </div>

                {/* Submit */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => void navigate({ to: isEdit ? `/assets/${id}` : "/assets" })}
                        className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.06]"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        ) : null}
                        {isEdit ? "Save Changes" : "Create Asset"}
                    </button>
                </div>
            </motion.form>
        </div>
    )
}

// ─── Sub-components ──────────────────────────────────

function FormInput({
    label, type = "text", value, onChange, required
}: {
    label: string; type?: string; value: string | number; onChange: (v: string) => void; required?: boolean
}) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                required={required}
                aria-label={label}
                className="h-9 w-full rounded-lg border border-white/[0.1] bg-white/[0.06] px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
        </div>
    )
}

function FormSelect({
    label, value, onChange, options
}: {
    label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                aria-label={label}
                className="h-9 w-full rounded-lg border border-white/[0.1] bg-white/[0.06] px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
                {options.map(o => (
                    <option key={o.value} value={o.value} className="bg-background">{o.label}</option>
                ))}
            </select>
        </div>
    )
}

function FormTextarea({
    label, value, onChange
}: {
    label: string; value: string; onChange: (v: string) => void
}) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                rows={2}
                aria-label={label}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.06] px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
        </div>
    )
}
