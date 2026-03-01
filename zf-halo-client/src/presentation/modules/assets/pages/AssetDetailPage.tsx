import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Hash,
  Tag,
  Cpu,
  Factory,
  MapPin,
  Calendar,
  DollarSign,
  Pencil,
  Trash2,
  PackagePlus,
} from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useAuthStore } from "@/application/auth/auth.store";
import { assetsApi } from "@/infrastructure/http/assets.api";
import type { Asset } from "@/domain/assets/models/asset.model";
import {
  MachineStatusLabel,
  MachineStatusColor,
  PurchaseTypeLabel,
  NationalTypeLabel,
} from "@/domain/assets/models/asset.model";
import { Role } from "@/domain/auth/models/user.model";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { LoanRequestSheet } from "@/presentation/modules/loans/LoanRequestSheet";

export default function AssetDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === Role.ADMIN || user?.role === Role.MANAGER;
  const [showDelete, setShowDelete] = useState(false);
  const [showLoanSheet, setShowLoanSheet] = useState(false);

  const { data: asset, isLoading } = useQuery<Asset>({
    queryKey: ["assets", id],
    queryFn: () => assetsApi.getAssetById(id),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: (assetId: string) => assetsApi.deleteAsset(assetId),
    onSuccess: () => {
      toast.success("Asset deleted successfully");
      navigate({ to: "/assets" });
    },
    onError: () => {
      toast.error("Failed to delete asset");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container max-w-3xl px-4 py-10 text-center">
        <p className="text-muted-foreground">Asset not found</p>
        <button
          onClick={() => void navigate({ to: "/assets" })}
          className="mt-4 text-sm text-primary hover:underline"
        >
          ← Back to Assets
        </button>
      </div>
    );
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
            <h1 className="text-xl font-bold tracking-tight">
              {asset.machineName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {asset.brand} — {asset.model}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Request Loan — opens bottom sheet */}
          <button
            onClick={() => setShowLoanSheet(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary/10 px-3.5 py-2 text-sm font-medium text-primary ring-1 ring-primary/20 transition-all hover:bg-primary/20 active:scale-95"
          >
            <PackagePlus className="h-3.5 w-3.5" />
            Request Loan
          </button>

          {isManager ? (
            <>
              <button
                onClick={() =>
                  void navigate({ to: `/assets/${asset.id}/edit` })
                }
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
            </>
          ) : null}
        </div>
      </motion.div>

      {/* Status + ID header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="mb-4 flex items-center justify-between"
      >
        <span
          className={cn(
            "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ring-1",
            MachineStatusColor[asset.machineStatus],
          )}
        >
          {MachineStatusLabel[asset.machineStatus]}
        </span>
        <span className="text-sm text-muted-foreground">
          ID #{asset.identifier}
        </span>
      </motion.div>

      {/* Detail Layout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-6"
      >
        {/* Core Information */}
        <Card className="border-border/50 shadow-sm backdrop-blur-sm bg-white/[0.02]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-border/50">
              Core Information
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                icon={<Hash className="h-3.5 w-3.5" />}
                label="Identifier"
                value={`#${asset.identifier}`}
              />
              <Field
                icon={<Tag className="h-3.5 w-3.5" />}
                label="Tag (QR)"
                value={asset.tag}
              />
              <Field label="Machine Name" value={asset.machineName} />
              <Field label="Project Name" value={asset.projectName} />
              <Field
                icon={<Factory className="h-3.5 w-3.5" />}
                label="Brand"
                value={asset.brand}
              />
              <Field label="Model" value={asset.model} />
              <Field
                icon={<Cpu className="h-3.5 w-3.5" />}
                label="Serial Number"
                value={asset.serialNumber}
              />
              <Field
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="Year"
                value={asset.year?.toString() ?? "—"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Classification & Location */}
        <Card className="border-border/50 shadow-sm backdrop-blur-sm bg-white/[0.02]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-border/50">
              Classification & Location
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                icon={<MapPin className="h-3.5 w-3.5" />}
                label="Area"
                value={asset.area}
              />
              <Field label="Sub Area" value={asset.subArea} />
              <Field label="Category" value={asset.category} />
            </div>
          </CardContent>
        </Card>

        {/* Purchase Details */}
        <Card className="border-border/50 shadow-sm backdrop-blur-sm bg-white/[0.02]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-border/50">
              Purchase Details
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                icon={<DollarSign className="h-3.5 w-3.5" />}
                label="Commercial Value"
                value={`$${asset.commercialValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              />
              {asset.purchaseDate ? (
                <Field
                  label="Purchase Date"
                  value={new Date(asset.purchaseDate).toLocaleDateString()}
                />
              ) : null}
              <Field
                label="Purchase Type"
                value={PurchaseTypeLabel[asset.purchaseType]}
              />
              {asset.nationalType ? (
                <Field
                  label="National Type"
                  value={NationalTypeLabel[asset.nationalType]}
                />
              ) : null}
              {asset.customsDocument ? (
                <Field
                  label="Customs (Pedimento)"
                  value={asset.customsDocument}
                />
              ) : null}
              {asset.invoice ? (
                <Field label="Invoice (Factura)" value={asset.invoice} />
              ) : null}
              <Field
                label="Purchased"
                value={asset.isPurchased ? "Yes" : "No"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="border-border/50 shadow-sm backdrop-blur-sm bg-white/[0.02]">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-border/50">
              Additional Info
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {asset.initialQuantity != null ? (
                <Field
                  label="Initial Quantity"
                  value={asset.initialQuantity.toString()}
                />
              ) : null}
              {asset.currentQuantity != null ? (
                <Field
                  label="Current Quantity"
                  value={asset.currentQuantity.toString()}
                />
              ) : null}
              {asset.description ? (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 sm:col-span-2">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Description
                  </p>
                  <p className="text-sm font-medium">{asset.description}</p>
                </div>
              ) : null}
              {asset.comments ? (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 sm:col-span-2">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Comments
                  </p>
                  <p className="text-sm font-medium">{asset.comments}</p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
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
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 text-center shadow-2xl"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mb-2 font-semibold">Delete Asset</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Are you sure you want to delete{" "}
                <strong>{asset.machineName}</strong>?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDelete(false)}
                  className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
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

      {/* Loan Request Bottom Sheet */}
      <LoanRequestSheet
        open={showLoanSheet}
        onClose={() => setShowLoanSheet(false)}
        preselectedAsset={asset}
      />
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5">
      <p className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
        {icon ? icon : null}
        {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
