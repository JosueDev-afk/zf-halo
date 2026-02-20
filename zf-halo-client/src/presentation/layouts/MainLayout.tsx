import { useState, useEffect } from "react"
import { Outlet, useRouterState } from "@tanstack/react-router"
import { motion, AnimatePresence } from "framer-motion"
import { Menu } from "lucide-react"
import { BottomNav } from "@/presentation/components/ui/BottomNav"
import { Sidebar } from "@/presentation/components/ui/Sidebar"
import { Breadcrumbs } from "@/presentation/components/ui/Breadcrumbs"
import { useAuthStore } from "@/application/auth/auth.store"

export default function MainLayout() {
    const { isAuthenticated } = useAuthStore()
    const router = useRouterState()
    const isAuthRoute = router.location.pathname === '/login' || router.location.pathname === '/register'

    const showNav = isAuthenticated && !isAuthRoute

    // Desktop: sidebar open by default. Mobile: closed by default.
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isDesktop, setIsDesktop] = useState(false)

    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)")
        const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsDesktop(e.matches)
            setSidebarOpen(e.matches)
        }
        onChange(mq)
        mq.addEventListener("change", onChange)
        return () => mq.removeEventListener("change", onChange)
    }, [])

    return (
        <div className="dark min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            {/* Gradient Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />
            </div>

            {showNav && (
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
            )}

            {/* Content area — shifts right when sidebar is open on desktop */}
            <div
                className="flex min-h-screen flex-col transition-[margin] duration-300 ease-in-out"
                style={{ marginLeft: showNav && sidebarOpen && isDesktop ? "18rem" : "0" }}
            >
                {/* Top Header Bar */}
                {showNav && (
                    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-white/[0.06] bg-background/60 px-4 backdrop-blur-xl">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="group flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-white/10 hover:text-foreground active:scale-95"
                            aria-label="Toggle sidebar"
                        >
                            <Menu className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                        </button>
                        <Breadcrumbs />
                    </header>
                )}

                <AnimatePresence mode="wait">
                    <motion.main
                        key={router.location.pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative flex flex-1 flex-col pb-20 md:pb-0"
                    >
                        <Outlet />
                    </motion.main>
                </AnimatePresence>

                {showNav && <BottomNav />}
            </div>
        </div>
    )
}
