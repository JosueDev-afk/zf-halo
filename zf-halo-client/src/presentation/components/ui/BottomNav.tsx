import { Link, useRouterState } from "@tanstack/react-router"
import { Home, Scan, User, ArrowLeftRight, Package } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
    const router = useRouterState()
    const currentPath = router.location.pathname

    const isActive = (path: string) => currentPath === path

    const items = [
        { to: "/" as const, icon: Home, label: "Home" },
        { to: "/assets" as const, icon: Package, label: "Assets" },
        { to: "/loans" as const, icon: ArrowLeftRight, label: "Loans" },
        { to: "/profile" as const, icon: User, label: "Profile" },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-background/80 backdrop-blur-xl pb-safe md:hidden">
            <nav className="flex h-16 items-center justify-around px-2">
                {items.slice(0, 2).map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                            "relative flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-all duration-200",
                            isActive(item.to)
                                ? "text-primary"
                                : "text-muted-foreground active:scale-95"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5 transition-transform duration-200", isActive(item.to) ? "scale-110" : "")} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                        {isActive(item.to) ? (
                            <div className="absolute bottom-0 h-0.5 w-6 rounded-full bg-primary" />
                        ) : null}
                    </Link>
                ))}

                {/* Center Scan Button */}
                <div className="-mt-6">
                    <button
                        className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-400 text-white shadow-lg shadow-primary/30 transition-all duration-200 hover:shadow-xl hover:shadow-primary/40 active:scale-90"
                        aria-label="Scan QR code"
                    >
                        <Scan className="h-6 w-6" />
                    </button>
                </div>

                {items.slice(2).map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                            "relative flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-all duration-200",
                            isActive(item.to)
                                ? "text-primary"
                                : "text-muted-foreground active:scale-95"
                        )}
                    >
                        <item.icon className={cn("h-5 w-5 transition-transform duration-200", isActive(item.to) ? "scale-110" : "")} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                        {isActive(item.to) ? (
                            <div className="absolute bottom-0 h-0.5 w-6 rounded-full bg-primary" />
                        ) : null}
                    </Link>
                ))}
            </nav>
        </div>
    )
}
