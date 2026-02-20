import { useAuthStore } from "@/application/auth/auth.store"
import { Button } from "@/presentation/components/ui/button"
import { LogOut, User as UserIcon, Mail, Shield, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "@tanstack/react-router"

export default function ProfilePage() {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    if (!user) {
        return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>
    }

    const handleLogout = () => {
        logout()
        void navigate({ to: "/login" })
    }

    const fields = [
        { icon: UserIcon, label: "First Name", value: user.firstName },
        { icon: UserIcon, label: "Last Name", value: user.lastName },
        { icon: Mail, label: "Email Address", value: user.email },
        { icon: Shield, label: "Role", value: user.role },
        { icon: Calendar, label: "Member Since", value: new Date(user.createdAt).toLocaleDateString() },
    ]

    return (
        <div className="container max-w-2xl px-4 py-6 md:py-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-blue-500/20 text-xl font-bold text-primary ring-1 ring-primary/20">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{user.firstName} {user.lastName}</h1>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>
                <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="gap-2 rounded-xl transition-all duration-200 active:scale-95"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </motion.div>

            {/* Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm"
            >
                <h2 className="mb-5 text-base font-semibold">Personal Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    {fields.map((field, i) => (
                        <motion.div
                            key={field.label}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.15 + i * 0.05 }}
                            className={field.label === "Email Address" ? "sm:col-span-2" : ""}
                        >
                            <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <field.icon className="h-3.5 w-3.5" />
                                {field.label}
                            </label>
                            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm font-medium">
                                {field.value}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
