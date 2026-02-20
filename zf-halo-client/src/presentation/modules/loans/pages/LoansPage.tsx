import { motion } from "framer-motion"
import { ArrowLeftRight } from "lucide-react"

export default function LoansPage() {
    return (
        <div className="container max-w-5xl px-4 py-6 md:py-10">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-blue-500/20 ring-1 ring-primary/20">
                    <ArrowLeftRight className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Loans</h1>
                    <p className="text-sm text-muted-foreground">Track asset loans and returns</p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center"
            >
                <p className="text-lg font-medium">Loans module coming soon</p>
                <p className="mt-1 text-sm text-muted-foreground">Loan requests and approvals will appear here</p>
            </motion.div>
        </div>
    )
}
