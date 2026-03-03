import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Shield, Calendar, Building2 } from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { adminApi } from "@/infrastructure/http/admin.api";
import type { User } from "@/domain/auth/models/user.model";
import { Role } from "@/domain/auth/models/user.model";
import { useAuthStore } from "@/application/auth/auth.store";
import { cn } from "@/lib/utils";

export default function UserDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === Role.ADMIN;

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["users", id],
    queryFn: () => adminApi.getUserById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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

  const roleBadgeColor: Record<string, string> = {
    [Role.ADMIN]: "bg-red-500/15 text-red-400 ring-red-500/20",
    [Role.MANAGER]: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
    [Role.AUDITOR]: "bg-purple-500/15 text-purple-400 ring-purple-500/20",
    [Role.USER]: "bg-blue-500/15 text-blue-400 ring-blue-500/20",
  };

  return (
    <div className="container max-w-3xl px-4 py-6 md:py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => void navigate({ to: "/users" })}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
            aria-label="Back to users"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-blue-500/20 text-xl font-bold text-primary ring-1 ring-primary/20">
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => void navigate({ to: `/users/${user.id}/edit` })}
            className="rounded-xl bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 ring-1 ring-blue-500/20 transition-all hover:bg-blue-500/20 active:scale-95"
          >
            Edit User
          </button>
        ) : null}
      </motion.div>

      {/* Read-only Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-2xl border border-white/[0.1] bg-white/[0.05] p-6 backdrop-blur-sm"
      >
        <div className="mb-6 flex items-center justify-between border-b border-white/[0.1] pb-4">
          <h2 className="text-base font-semibold">User Details</h2>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ring-1",
              roleBadgeColor[user.role] ?? roleBadgeColor[Role.USER],
            )}
          >
            <Shield className="h-3 w-3" />
            {user.role}
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Mail className="h-4 w-4" />
              Email Address
            </label>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium">
              {user.email}
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Building2 className="h-4 w-4" />
              Company / Department
            </label>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium">
              {user.company || "—"}
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Member Since
            </label>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              Status
            </label>
            <div className="flex h-11 items-center rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm font-medium">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5",
                  user.isActive ? "text-emerald-400" : "text-red-400",
                )}
              >
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    user.isActive ? "bg-emerald-400" : "bg-red-400",
                  )}
                />
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
