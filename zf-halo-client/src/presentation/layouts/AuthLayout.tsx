import { motion } from "framer-motion"
import { Globe } from "@/presentation/components/ui/globe"
import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card"

interface AuthLayoutProps {
    children: ReactNode
    title: string
    description: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-white">
            {/* Background Globe Layer */}
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 md:opacity-60">
                <Globe className="scale-[1.5] md:scale-125" />
            </div>

            {/* Background Overlay for text readability */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90" />

            {/* Branding Overlay */}
            <div className="absolute top-10 z-10 w-full text-center md:top-20">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl">
                        ZF <span className="text-blue-500">Engineering</span>
                    </h1>
                    <p className="mt-2 text-sm text-slate-300 md:text-base">
                        Next-Generation Asset Management System
                    </p>
                </motion.div>
            </div>

            {/* Content Card (Login/Register Form) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md px-4"
            >
                <Card className="border-white/10 bg-black/40 shadow-2xl backdrop-blur-xl">
                    <CardHeader className="space-y-1 text-center text-white">
                        <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
                        <CardDescription className="text-slate-400">{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-white">
                        {children}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
