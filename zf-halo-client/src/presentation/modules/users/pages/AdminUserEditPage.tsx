import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";

import { adminApi } from "@/infrastructure/http/admin.api";
import {
  usersApi,
  type UpdateUserInput,
} from "@/infrastructure/http/users.api";
import type { User } from "@/domain/auth/models/user.model";
import { Role } from "@/domain/auth/models/user.model";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/presentation/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { Switch } from "@/presentation/components/ui/switch";

const userEditSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  role: z.nativeEnum(Role),
  isActive: z.boolean(),
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

export default function AdminUserEditPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["users", id],
    queryFn: () => adminApi.getUserById(id),
    enabled: !!id,
  });

  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      company: "",
      role: Role.USER,
      isActive: true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company || "",
        role: user.role,
        isActive: user.isActive,
      });
    }
  }, [user, form]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserInput) => usersApi.updateUser(id, data),
    onSuccess: () => {
      toast.success("User updated successfully");
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      void navigate({ to: `/users/${id}` });
    },
    onError: () => {
      toast.error("Failed to update user");
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-3xl px-4 py-10 text-center">
        <p className="text-muted-foreground">User not found</p>
        <button
          onClick={() => void navigate({ to: "/users" })}
          className="mt-4 text-sm text-primary hover:underline"
        >
          ← Back to Users
        </button>
      </div>
    );
  }

  const isSaving = updateMutation.isPending;

  function onSubmit(data: UserEditFormValues) {
    const payload: UpdateUserInput = {
      ...data,
      company: data.company || undefined,
    };
    updateMutation.mutate(payload);
  }

  return (
    <div className="container max-w-3xl px-4 py-6 md:py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => void navigate({ to: `/users/${id}` })}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
            aria-label="Back to details"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
            <p className="text-muted-foreground mt-1">
              Modifying {user.firstName} {user.lastName}'s account
            </p>
          </div>
        </div>
      </motion.div>

      {/* Editable Form */}
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
                  Account Details
                </h3>
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
                            autoComplete="given-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
                            autoComplete="family-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Acme Corp"
                            autoComplete="organization"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={Role.USER}>User</SelectItem>
                            <SelectItem value={Role.MANAGER}>
                              Manager
                            </SelectItem>
                            <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                            <SelectItem value={Role.AUDITOR}>
                              Auditor
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2 flex flex-row items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-semibold">
                            Account Status
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Activate or deactivate user's access to the system.
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void navigate({ to: `/users/${id}` })}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !form.formState.isDirty}
                className="shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
