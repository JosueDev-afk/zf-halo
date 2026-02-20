import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, Clock, Check, Mail, X } from "lucide-react"
import { adminApi, type AccountRequest } from "@/infrastructure/http/admin.api"
import { Role } from "@/domain/auth/models/user.model"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function PendingApprovalsPage() {
    const [requests, setRequests] = useState<AccountRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [approving, setApproving] = useState<string | null>(null)
    const [selectedRole, setSelectedRole] = useState<Record<string, Role>>({})

    useEffect(() => {
        loadRequests()
    }, [])

    const loadRequests = async () => {
        try {
            setLoading(true)
            const data = await adminApi.getAccountRequests()
            setRequests(data)
        } catch {
            toast.error("Failed to load account requests")
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id: string) => {
        const role = selectedRole[id] ?? Role.USER
        try {
            setApproving(id)
            await adminApi.approveAccount(id, role)
            toast.success("Account approved successfully")
            await loadRequests()
        } catch {
            toast.error("Failed to approve account")
        } finally {
            setApproving(null)
        }
    }

    const pendingRequests = requests.filter(r => r.status === "PENDING")
    const processedRequests = requests.filter(r => r.status !== "PENDING")

    const roles = [Role.USER, Role.MANAGER, Role.AUDITOR, Role.ADMIN]

    return (
        <div className="container max-w-4xl px-4 py-6 md:py-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 flex items-center gap-3"
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 ring-1 ring-amber-500/20">
                    <UserPlus className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pending Approvals</h1>
                    <p className="text-sm text-muted-foreground">
                        {pendingRequests.length} pending request{pendingRequests.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </motion.div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            )}

            {!loading && (
                <>
                    {/* Pending Section */}
                    {pendingRequests.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center"
                        >
                            <Check className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
                            <p className="font-medium">All caught up!</p>
                            <p className="text-sm text-muted-foreground">No pending requests</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {pendingRequests.map((req, i) => (
                                    <motion.div
                                        key={req.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2, delay: i * 0.05 }}
                                        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            {/* User Info */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-sm font-bold text-amber-400 ring-1 ring-amber-500/20">
                                                    {req.firstName.charAt(0)}{req.lastName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{req.firstName} {req.lastName}</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Mail className="h-3 w-3" />
                                                        {req.email}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(req.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-3">
                                                {/* Role Selector */}
                                                <select
                                                    value={selectedRole[req.id] ?? Role.USER}
                                                    onChange={e => setSelectedRole(prev => ({ ...prev, [req.id]: e.target.value as Role }))}
                                                    className="h-9 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                                >
                                                    {roles.map(r => (
                                                        <option key={r} value={r} className="bg-background">{r}</option>
                                                    ))}
                                                </select>

                                                {/* Approve */}
                                                <button
                                                    onClick={() => void handleApprove(req.id)}
                                                    disabled={approving === req.id}
                                                    className={cn(
                                                        "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all active:scale-95",
                                                        "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/25",
                                                        approving === req.id && "opacity-50 pointer-events-none"
                                                    )}
                                                >
                                                    {approving === req.id ? (
                                                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
                                                    ) : (
                                                        <Check className="h-3.5 w-3.5" />
                                                    )}
                                                    Approve
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Processed Requests */}
                    {processedRequests.length > 0 && (
                        <div className="mt-8">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                                Previously Processed
                            </p>
                            <div className="space-y-2">
                                {processedRequests.map(req => (
                                    <div
                                        key={req.id}
                                        className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-3 opacity-60"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04] text-xs font-bold text-muted-foreground">
                                                {req.firstName.charAt(0)}{req.lastName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{req.firstName} {req.lastName}</p>
                                                <p className="text-xs text-muted-foreground">{req.email}</p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium",
                                            req.status === "APPROVED"
                                                ? "bg-emerald-500/10 text-emerald-400"
                                                : "bg-red-500/10 text-red-400"
                                        )}>
                                            {req.status === "APPROVED" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            {req.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
