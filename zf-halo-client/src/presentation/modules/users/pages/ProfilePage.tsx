import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LogOut, Mail, Shield, Calendar, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { useAuthStore } from "@/application/auth/auth.store";
import {
  usersApi,
  type UpdateUserProfileInput,
} from "@/infrastructure/http/users.api";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/presentation/components/ui/form";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardContent } from "@/presentation/components/ui/card";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      company: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company || "",
      });
    }
  }, [user, form]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserProfileInput) => usersApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    void navigate({ to: "/login" });
  };

  const isSaving = updateMutation.isPending;

  function onSubmit(data: ProfileFormValues) {
    const payload: UpdateUserProfileInput = {
      ...data,
      company: data.company || undefined,
    };
    updateMutation.mutate(payload);
  }

  return (
    <div className="container max-w-3xl px-4 py-8 md:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-blue-500/20 text-2xl font-bold text-primary ring-1 ring-primary/20">
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your personal information
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="gap-2 rounded-xl transition-all duration-200 active:scale-95 shadow-sm shadow-destructive/20"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </motion.div>

      {/* Read-only Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <Card className="border-border/50 shadow-sm backdrop-blur-sm bg-white/[0.02]">
          <CardContent className="p-6">
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <div className="text-sm font-medium">{user.email}</div>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Role
                </label>
                <div className="text-sm font-medium">{user.role}</div>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </label>
                <div className="text-sm font-medium">
                  {new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(new Date(user.createdAt))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Editable Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="border-border/50 shadow-sm backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-6 pb-2 border-b">
                  Personal Details
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
                      <FormItem className="sm:col-span-2">
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
                </div>
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <div className="flex items-center justify-end pt-2">
              <Button
                type="submit"
                disabled={isSaving || !form.formState.isDirty}
                size="lg"
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
