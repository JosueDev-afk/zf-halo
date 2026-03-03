import { useState, useSyncExternalStore, useEffect } from "react"
import { Outlet, useRouterState } from "@tanstack/react-router"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Menu } from "lucide-react"
import { BottomNav } from "@/presentation/components/ui/BottomNav"
import { Sidebar } from "@/presentation/components/ui/Sidebar"
import { Breadcrumbs } from "@/presentation/components/ui/Breadcrumbs"
import { useAuthStore } from "@/application/auth/auth.store"

// SSR-safe media query hook using useSyncExternalStore
function useMediaQuery(query: string): boolean {
    return useSyncExternalStore(
        (callback) => {
            const mq = window.matchMedia(query)
            mq.addEventListener("change", callback)
            return () => mq.removeEventListener("change", callback)
        },
        () => window.matchMedia(query).matches,
        () => false // Server snapshot
    )
}

export default function MainLayout() {
    const { isAuthenticated } = useAuthStore()
    const router = useRouterState()
    const isAuthRoute = router.location.pathname === '/login' || router.location.pathname === '/register'
    const prefersReducedMotion = useReducedMotion()

    const showNav = isAuthenticated && !isAuthRoute
    const isDesktop = useMediaQuery("(min-width: 768px)")
    // On desktop: sidebar defaults to open. On mobile: closed.
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== "undefined") {
            return window.matchMedia("(min-width: 768px)").matches
        }
        return false
    })

    // Sync sidebar state with screen size changes
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)")
        const handler = (e: MediaQueryListEvent) => {
            setSidebarOpen(e.matches)
        }
        mq.addEventListener("change", handler)
        return () => mq.removeEventListener("change", handler)
    }, [])

    const motionProps = prefersReducedMotion
        ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } }
        : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.2, ease: "easeOut" as const } }

    return (
        <div className="dark min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            {/* Gradient Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />
            </div>

            {showNav ? (
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
            ) : null}

            {/* Content area — shifts right when sidebar is open on desktop */}
            <div
                className="flex min-h-screen flex-col transition-[margin] duration-300 ease-in-out"
                style={{ marginLeft: showNav && sidebarOpen && isDesktop ? "18rem" : "0" }}
            >
                {/* Top Header Bar */}
                {showNav ? (
                    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-white/[0.06] bg-background/60 px-4 backdrop-blur-xl">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-white/10 hover:text-foreground active:scale-95"
                            aria-label="Toggle sidebar"
                        >
                            <Menu className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                        </button>
                        <Breadcrumbs />
                    </header>
                ) : null}

                <AnimatePresence mode="wait">
                    <motion.main
                        key={router.location.pathname}
                        {...motionProps}
                        className="relative flex flex-1 flex-col pb-20 md:pb-0"
                    >
                        <Outlet />
                    </motion.main>
                </AnimatePresence>

                {showNav ? <BottomNav /> : null}
            </div>
        </div>
    )
}

