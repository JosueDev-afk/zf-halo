import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { assetsApi } from "@/infrastructure/http/assets.api";
import {
  createAssetSchema,
  type Asset,
  type CreateAssetInput,
} from "@/domain/assets/models/asset.model";
import {
  MachineStatus as MachineStatusEnum,
  MachineStatusLabel,
  PurchaseType,
  PurchaseTypeLabel,
  NationalType,
  NationalTypeLabel,
} from "@/domain/assets/models/asset.model";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/presentation/components/ui/form";
import { Input } from "@/presentation/components/ui/input";
import { Textarea } from "@/presentation/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { Checkbox } from "@/presentation/components/ui/checkbox";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardContent } from "@/presentation/components/ui/card";

const defaultValues: Partial<z.input<typeof createAssetSchema>> = {
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
};

export default function AssetFormPage() {
  const params = useParams({ strict: false }) as { id?: string };
  const id = params.id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  // Use strictly typed React Hook Form
  const form = useForm<CreateAssetInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createAssetSchema as any),
    defaultValues,
  });

  const watchPurchaseType = useWatch({
    control: form.control,
    name: "purchaseType",
  });

  // Fetch existing asset for edit mode
  const { data: existingAsset, isLoading } = useQuery<Asset>({
    queryKey: ["assets", id],
    queryFn: () => assetsApi.getAssetById(id!),
    enabled: isEdit,
  });

  // Populate form data when it loads
  useEffect(() => {
    if (existingAsset) {
      form.reset({
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
        purchaseDate: existingAsset.purchaseDate
          ? new Date(existingAsset.purchaseDate).toISOString().split("T")[0]
          : null,
        description: existingAsset.description,
        comments: existingAsset.comments,
        purchaseType: existingAsset.purchaseType,
        nationalType: existingAsset.nationalType,
        machineStatus: existingAsset.machineStatus,
        isPurchased: existingAsset.isPurchased,
      });
    }
  }, [existingAsset, form]);

  const createMutation = useMutation({
    mutationFn: (data: CreateAssetInput) => assetsApi.createAsset(data),
    onSuccess: () => {
      toast.success("Asset created");
      void queryClient.invalidateQueries({ queryKey: ["assets"] });
      void navigate({ to: "/assets" });
    },
    onError: () => toast.error("Failed to create asset"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateAssetInput) => assetsApi.updateAsset(id!, data),
    onSuccess: () => {
      toast.success("Asset updated");
      void queryClient.invalidateQueries({ queryKey: ["assets"] });
      void navigate({ to: `/assets/${id}` });
    },
    onError: () => toast.error("Failed to update asset"),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: CreateAssetInput) {
    // Prepare payload - convert empty strings to null for optional strings if needed
    const payload: CreateAssetInput = {
      ...data,
      customsDocument: data.customsDocument || null,
      invoice: data.invoice || null,
      description: data.description || null,
      comments: data.comments || null,
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  }

  if (isEdit && isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl px-4 py-8 md:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 flex items-center gap-4"
      >
        <button
          onClick={() =>
            void navigate({ to: isEdit ? `/assets/${id}` : "/assets" })
          }
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-card border text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Edit Asset" : "New Asset"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit
              ? "Update the details of the selected asset."
              : "Enter the details for the new asset."}
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="border-border/50 shadow-sm backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 pb-2 border-b">
                  Core Information
                </h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identifier</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tag (QR Code)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter tag" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="machineName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Machine Name</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. Router CNC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Project X" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Brand name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="Model number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number</FormLabel>
                        <FormControl>
                          <Input placeholder="S/N" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="YYYY"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="machineStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Machine Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(MachineStatusEnum).map((status) => (
                              <SelectItem key={status} value={status}>
                                {MachineStatusLabel[status]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 pb-2 border-b">
                  Classification & Location
                </h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area</FormLabel>
                        <FormControl>
                          <Input placeholder="Main Area" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub Area</FormLabel>
                        <FormControl>
                          <Input placeholder="Sub Area" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Category" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 pb-2 border-b">
                  Purchase Details
                </h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="commercialValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commercial Value</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purchaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="purchaseType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(PurchaseType).map((pt) => (
                              <SelectItem key={pt} value={pt}>
                                {PurchaseTypeLabel[pt]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchPurchaseType === PurchaseType.NATIONAL && (
                    <FormField
                      control={form.control}
                      name="nationalType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>National Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select national type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(NationalType).map((nt) => (
                                <SelectItem key={nt} value={nt}>
                                  {NationalTypeLabel[nt]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="customsDocument"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customs Document</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Document ID"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="invoice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Invoice Number"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-end pb-3 sm:col-span-full">
                    <FormField
                      control={form.control}
                      name="isPurchased"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 border rounded-lg w-full">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Asset is fully purchased</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 pb-2 border-b">
                  Additional Info
                </h3>
                <div className="grid gap-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="initialQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currentQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add a detailed description..."
                            className="resize-y"
                            rows={3}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comments</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional comments or notes..."
                            className="resize-y"
                            rows={3}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void navigate({ to: isEdit ? `/assets/${id}` : "/assets" })
                }
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} size="lg">
                {isSaving ? (
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : null}
                {isEdit ? "Save Changes" : "Create Asset"}
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
