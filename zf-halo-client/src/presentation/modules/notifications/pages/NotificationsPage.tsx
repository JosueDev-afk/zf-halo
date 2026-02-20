import { motion } from "framer-motion"
import { Bell } from "lucide-react"

export default function NotificationsPage() {
    return (
        <div className="container max-w-5xl px-4 py-6 md:py-10">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-blue-500/20 ring-1 ring-primary/20">
                    <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-sm text-muted-foreground">Stay updated with your alerts</p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center"
            >
                <p className="text-lg font-medium">Notifications coming soon</p>
                <p className="mt-1 text-sm text-muted-foreground">Alerts and activity feed will appear here</p>
            </motion.div>
        </div>
    )
}
