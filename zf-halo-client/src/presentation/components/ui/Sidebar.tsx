import { Link, useRouterState } from "@tanstack/react-router"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Users, UserPlus, User, Bell, Package, ArrowLeftRight, X } from "lucide-react"
import { useAuthStore } from "@/application/auth/auth.store"
import { Role } from "@/domain/auth/models/user.model"
import { cn } from "@/lib/utils"

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

interface NavItemProps {
    to: string
    icon: React.ReactNode
    label: string
    isActive: boolean
    onClick: () => void
}

function NavItem({ to, icon, label, isActive, onClick }: NavItemProps) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                    ? "bg-primary/15 text-primary shadow-sm shadow-primary/10"
                    : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
            )}
        >
            {/* Active indicator bar */}
            {isActive ? (
                <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
            ) : null}
            <span className={cn(
                "transition-transform duration-200",
                isActive ? "scale-110" : "group-hover:scale-110"
            )}>
                {icon}
            </span>
            <span>{label}</span>
        </Link>
    )
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user } = useAuthStore()
    const router = useRouterState()

    const isAdmin = user?.role === Role.ADMIN
    const currentPath = router.location.pathname

    const isActive = (path: string) => currentPath === path

    const handleNavClick = () => {
        if (window.innerWidth < 768) {
            onClose()
        }
    }

    return (
        <>
            {/* Backdrop overlay for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar panel */}
            <motion.aside
                initial={false}
                animate={{ x: isOpen ? 0 : -288 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.06] bg-background/80 backdrop-blur-2xl"
            >
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5">
                    <Link to="/" onClick={handleNavClick} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-400 shadow-lg shadow-primary/25">
                            <Package className="h-4.5 w-4.5 text-white" />
                        </div>
                        <div>
                            <span className="text-base font-bold tracking-tight">ZF HALO</span>
                            <p className="text-[10px] leading-none text-muted-foreground">Asset Management</p>
                        </div>
                    </Link>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-white/10 hover:text-foreground active:scale-90 md:hidden"
                        aria-label="Close sidebar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Main Navigation */}
                <div className="flex-1 overflow-y-auto px-3 py-4">
                    <nav className="flex flex-col gap-1">
                        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                            Main
                        </p>
                        <NavItem
                            to="/"
                            icon={<Home className="h-4 w-4" />}
                            label="Dashboard"
                            isActive={isActive("/")}
                            onClick={handleNavClick}
                        />
                        <NavItem
                            to="/assets"
                            icon={<Package className="h-4 w-4" />}
                            label="Assets"
                            isActive={isActive("/assets")}
                            onClick={handleNavClick}
                        />
                        <NavItem
                            to="/loans"
                            icon={<ArrowLeftRight className="h-4 w-4" />}
                            label="Loans"
                            isActive={isActive("/loans")}
                            onClick={handleNavClick}
                        />

                        {isAdmin ? (
                            <>
                                <div className="my-3 h-px bg-white/[0.06]" />
                                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                                    Admin
                                </p>
                                <NavItem
                                    to="/users"
                                    icon={<Users className="h-4 w-4" />}
                                    label="Users"
                                    isActive={isActive("/users")}
                                    onClick={handleNavClick}
                                />
                                <NavItem
                                    to="/users/pending"
                                    icon={<UserPlus className="h-4 w-4" />}
                                    label="Pending Approvals"
                                    isActive={isActive("/users/pending")}
                                    onClick={handleNavClick}
                                />
                            </>
                        ) : null}
                    </nav>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-white/[0.06] px-3 py-4">
                    <nav className="flex flex-col gap-1">
                        <NavItem
                            to="/notifications"
                            icon={<Bell className="h-4 w-4" />}
                            label="Notifications"
                            isActive={isActive("/notifications")}
                            onClick={handleNavClick}
                        />
                        <NavItem
                            to="/profile"
                            icon={<User className="h-4 w-4" />}
                            label="My Profile"
                            isActive={isActive("/profile")}
                            onClick={handleNavClick}
                        />
                    </nav>

                    {/* User card */}
                    {user ? (
                        <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5 border border-white/[0.06]">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-blue-500/20 text-sm font-bold text-primary ring-1 ring-primary/20">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate text-sm font-medium">{user.firstName} {user.lastName}</p>
                                <p className="truncate text-xs text-muted-foreground">{user.role}</p>
                            </div>
                        </div>
                    ) : null}
                </div>
            </motion.aside>
        </>
    )
}
