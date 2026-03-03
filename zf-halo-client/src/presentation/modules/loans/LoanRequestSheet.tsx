"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays } from "date-fns";
import {
  X,
  ArrowLeftRight,
  Package,
  MapPin,
  Calendar,
  User as UserIcon,
  Loader2,
  ChevronDown,
  Map,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { useCreateLoan } from "@/application/loans/useLoans";
import { useDestinations } from "@/application/loans/useDestinations";
import { useAuthStore } from "@/application/auth/auth.store";
import type { Destination } from "@/infrastructure/http/destinations.api";

// Queries for assets and users
import { assetsApi } from "@/infrastructure/http/assets.api";
import { usersApi } from "@/infrastructure/http/users.api";
import type { Asset } from "@/domain/assets/models/asset.model";
import type { User } from "@/domain/auth/models/user.model";

const loanSchema = z.object({
  assetId: z.string().uuid("Select an asset"),
  destinationId: z.string().uuid("Select a destination"),
  estimatedReturnDate: z.string().min(1, "Enter the return date"),
  quantity: z.number().min(1).optional(),
  comments: z.string().optional(),
  requesterId: z.string().uuid().optional(),
});

type LoanFormValues = z.infer<typeof loanSchema>;

interface LoanRequestSheetProps {
  open: boolean;
  onClose: () => void;
  preselectedAsset?: Asset | null;
}

export function LoanRequestSheet({
  open,
  onClose,
  preselectedAsset,
}: LoanRequestSheetProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";

  const createLoan = useCreateLoan();
  const { data: destinations = [] } = useDestinations();

  const [assetSearch, setAssetSearch] = useState("");
  const [assetResults, setAssetResults] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetSearching, setAssetSearching] = useState(false);

  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [showDestinationPicker, setShowDestinationPicker] = useState(false);

  const [userList, setUserList] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserPicker, setShowUserPicker] = useState(false);

  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      estimatedReturnDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
      quantity: 1,
    },
  });

  // Load admin user list
  useEffect(() => {
    if (isAdmin && open) {
      usersApi
        .getUsers({ limit: 100 })
        .then((res) => setUserList(res.items))
        .catch(() => {});
    }
  }, [isAdmin, open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      form.reset({
        estimatedReturnDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
        quantity: 1,
      });
      setSelectedAsset(null);
      setSelectedDestination(null);
      setSelectedUser(null);
      setAssetSearch("");
      setAssetResults([]);
    } else if (preselectedAsset) {
      // Pre-fill asset from AssetsPage loan button
      setSelectedAsset(preselectedAsset);
      form.setValue("assetId", preselectedAsset.id, { shouldValidate: true });
      setAssetSearch("");
      setAssetResults([]);
    }
  }, [open, form, preselectedAsset]);

  // Search assets by tag/name with debounce
  useEffect(() => {
    if (!assetSearch.trim() || assetSearch.length < 2) {
      setAssetResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setAssetSearching(true);
      try {
        const results = await assetsApi.getAssets({ limit: 8 });
        // Filter locally since backend may not support text search
        const filtered = results.items.filter(
          (a) =>
            a.tag.toLowerCase().includes(assetSearch.toLowerCase()) ||
            a.machineName.toLowerCase().includes(assetSearch.toLowerCase()) ||
            a.model.toLowerCase().includes(assetSearch.toLowerCase()),
        );
        setAssetResults(filtered.slice(0, 6));
      } catch {
        setAssetResults([]);
      } finally {
        setAssetSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [assetSearch]);

  const selectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    form.setValue("assetId", asset.id, { shouldValidate: true });
    setAssetSearch("");
    setAssetResults([]);
  };

  const selectDestination = (dest: Destination) => {
    setSelectedDestination(dest);
    form.setValue("destinationId", dest.id, { shouldValidate: true });
    setShowDestinationPicker(false);
  };

  const selectUser = (u: User) => {
    setSelectedUser(u);
    form.setValue("requesterId", u.id);
    setShowUserPicker(false);
  };

  const onSubmit = (data: LoanFormValues) => {
    const payload = {
      ...data,
      estimatedReturnDate: new Date(data.estimatedReturnDate).toISOString(),
      quantity:
        selectedAsset?.assetType === "BULK" ? (data.quantity ?? 1) : undefined,
    };
    createLoan.mutate(payload, { onSuccess: onClose });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — above BottomNav (z-50) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[61] rounded-t-3xl bg-card border-t border-border shadow-2xl max-h-[92dvh] overflow-y-auto"
          >
            {/* Drag handle */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-md pt-3 pb-2 px-6 border-b border-border z-10">
              <div className="flex justify-center mb-3">
                <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
                    <ArrowLeftRight className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground text-base">
                      Request Loan
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Complete the loan details
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="px-6 pt-5 pb-8 space-y-5"
            >
              {/* Admin: Select user */}
              {isAdmin && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5" /> Requester (Admin)
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowUserPicker(!showUserPicker)}
                    className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-background text-sm hover:bg-accent transition-colors"
                  >
                    <span
                      className={
                        selectedUser
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {selectedUser
                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                        : "Select user (default: you)"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {showUserPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-border bg-popover overflow-hidden max-h-40 overflow-y-auto shadow-xl"
                    >
                      {userList.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => selectUser(u)}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors border-b border-border last:border-0"
                        >
                          <span className="font-medium">
                            {u.firstName} {u.lastName}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {u.email}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Asset search */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" /> Asset
                </Label>
                {selectedAsset ? (
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {selectedAsset.machineName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedAsset.tag} · {selectedAsset.model}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 rounded-full"
                      onClick={() => {
                        setSelectedAsset(null);
                        form.setValue("assetId", "");
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Search by name, tag or model..."
                      value={assetSearch}
                      onChange={(e) => setAssetSearch(e.target.value)}
                      className="bg-background border-border"
                    />
                    {assetSearching && (
                      <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />{" "}
                        Searching...
                      </div>
                    )}
                    {assetResults.length > 0 && (
                      <div className="rounded-xl border border-border bg-popover overflow-hidden shadow-xl">
                        {assetResults.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => selectAsset(a)}
                            className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-0"
                          >
                            <p className="text-sm font-medium">
                              {a.machineName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {a.tag} · {a.assetType}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {form.formState.errors.assetId && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.assetId.message}
                  </p>
                )}
              </div>

              {/* Bulk quantity */}
              {selectedAsset?.assetType === "BULK" && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Quantity
                  </Label>
                  <Controller
                    name="quantity"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={1}
                        max={selectedAsset.currentQuantity ?? undefined}
                        className="bg-background border-border"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                      />
                    )}
                  />
                </div>
              )}

              {/* Destination */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Destination
                </Label>
                <button
                  type="button"
                  onClick={() =>
                    setShowDestinationPicker(!showDestinationPicker)
                  }
                  className="w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-background text-sm hover:bg-accent transition-colors"
                >
                  <span
                    className={
                      selectedDestination
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {selectedDestination
                      ? selectedDestination.name
                      : "Select destination..."}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {showDestinationPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border bg-popover overflow-hidden shadow-xl"
                  >
                    {destinations.map((dest) => (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => selectDestination(dest)}
                        className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-0"
                      >
                        <p className="text-sm font-medium">{dest.name}</p>
                        {dest.address && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {dest.address}
                          </p>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* Map preview for selected destination */}
                {selectedDestination?.latitude &&
                  selectedDestination?.longitude && (
                    <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2.5">
                      <Map className="h-4 w-4 text-blue-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-blue-300 font-medium truncate">
                          {selectedDestination.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedDestination.latitude.toFixed(5)},{" "}
                          {selectedDestination.longitude.toFixed(5)}
                        </p>
                      </div>
                    </div>
                  )}
                {form.formState.errors.destinationId && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.destinationId.message}
                  </p>
                )}
              </div>

              {/* Return date */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Return Date
                </Label>
                <Controller
                  name="estimatedReturnDate"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                      className="bg-background border-border"
                      {...field}
                    />
                  )}
                />
                {form.formState.errors.estimatedReturnDate && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.estimatedReturnDate.message}
                  </p>
                )}
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  Comments (optional)
                </Label>
                <Input
                  placeholder="Reason for loan..."
                  className="bg-background border-border"
                  {...form.register("comments")}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                disabled={createLoan.isPending}
              >
                {createLoan.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating
                    request...
                  </>
                ) : (
                  <>Request Loan</>
                )}
              </Button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
