import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Users, Search, Shield, Mail, ToggleLeft, ToggleRight } from "lucide-react"
import type { User } from "@/domain/auth/models/user.model"
import { Role } from "@/domain/auth/models/user.model"
import { adminApi } from "@/infrastructure/http/admin.api"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function UsersPage() {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState("")

    const { data: users = [], isLoading: loading } = useQuery<User[]>({
        queryKey: ["users"],
        queryFn: () => adminApi.getUsers(),
    })

    const deactivateMutation = useMutation({
        mutationFn: (userId: string) => adminApi.deactivateUser(userId),
        onSuccess: () => {
            toast.success("User deactivated")
            void queryClient.invalidateQueries({ queryKey: ["users"] })
        },
        onError: () => {
            toast.error("Failed to deactivate user")
        },
    })

    const filtered = users.filter(u =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
    )

    const roleBadgeColor: Record<string, string> = {
        [Role.ADMIN]: "bg-red-500/15 text-red-400 ring-red-500/20",
        [Role.MANAGER]: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
        [Role.AUDITOR]: "bg-purple-500/15 text-purple-400 ring-purple-500/20",
        [Role.USER]: "bg-blue-500/15 text-blue-400 ring-blue-500/20",
    }

    return (
        <div className="container max-w-5xl px-4 py-6 md:py-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-blue-500/20 ring-1 ring-primary/20">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
                        <p className="text-sm text-muted-foreground">{users.length} registered users</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        aria-label="Search users"
                        className="h-10 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-64"
                    />
                </div>
            </motion.div>

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="space-y-2"
                >
                    {/* Desktop Header */}
                    <div className="hidden rounded-xl bg-white/[0.06] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-12 md:gap-4">
                        <div className="col-span-4">User</div>
                        <div className="col-span-3">Email</div>
                        <div className="col-span-2">Role</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                            {search ? "No users match your search" : "No users found"}
                        </div>
                    ) : null}

                    {filtered.map((user, i) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: Math.min(i, 10) * 0.03 }}
                            className="group rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.06] md:grid md:grid-cols-12 md:items-center md:gap-4"
                        >
                            {/* User Info */}
                            <div className="col-span-4 mb-2 flex items-center gap-3 md:mb-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-blue-500/10 text-sm font-bold text-primary ring-1 ring-primary/20">
                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                                    <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                                </div>
                            </div>

                            {/* Email — desktop */}
                            <div className="col-span-3 hidden items-center gap-2 text-sm text-muted-foreground md:flex">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="truncate">{user.email}</span>
                            </div>

                            {/* Role */}
                            <div className="col-span-2 mb-2 md:mb-0">
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ring-1",
                                    roleBadgeColor[user.role] ?? roleBadgeColor[Role.USER]
                                )}>
                                    <Shield className="h-3 w-3" />
                                    {user.role}
                                </span>
                            </div>

                            {/* Status */}
                            <div className="col-span-1 mb-2 md:mb-0">
                                <span className={cn(
                                    "inline-flex items-center gap-1 text-xs font-medium",
                                    user.isActive ? "text-emerald-400" : "text-red-400"
                                )}>
                                    <div className={cn(
                                        "h-1.5 w-1.5 rounded-full",
                                        user.isActive ? "bg-emerald-400" : "bg-red-400"
                                    )} />
                                    {user.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="col-span-2 flex justify-end">
                                {user.isActive ? (
                                    <button
                                        onClick={() => deactivateMutation.mutate(user.id)}
                                        disabled={deactivateMutation.isPending}
                                        className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500/10 active:scale-95"
                                    >
                                        <ToggleRight className="h-3.5 w-3.5" />
                                        Deactivate
                                    </button>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground">
                                        <ToggleLeft className="h-3.5 w-3.5" />
                                        Deactivated
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    )
}

