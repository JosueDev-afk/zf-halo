import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronRight, Home } from "lucide-react"
import { motion } from "framer-motion"

const routeLabels: Record<string, string> = {
    "": "Dashboard",
    "assets": "Assets",
    "loans": "Loans",
    "users": "Users",
    "pending": "Pending Approvals",
    "profile": "My Profile",
    "notifications": "Notifications",
}

export function Breadcrumbs() {
    const router = useRouterState()
    const pathname = router.location.pathname

    const segments = pathname.split("/").filter(Boolean)

    if (segments.length === 0) {
        return (
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
                <Home className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-foreground">Dashboard</span>
            </nav>
        )
    }

    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
            <Link to="/" className="flex items-center text-muted-foreground transition-colors hover:text-primary">
                <Home className="h-3.5 w-3.5" />
            </Link>
            {segments.map((segment, index) => {
                const path = `/${segments.slice(0, index + 1).join("/")}`
                const isLast = index === segments.length - 1
                const label = routeLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)

                return (
                    <motion.span
                        key={path}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="flex items-center gap-1.5"
                    >
                        <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                        {isLast ? (
                            <span className="font-medium text-foreground">{label}</span>
                        ) : (
                            <Link to={path} className="text-muted-foreground transition-colors hover:text-primary">
                                {label}
                            </Link>
                        )}
                    </motion.span>
                )
            })}
        </nav>
    )
}
