import { motion } from "framer-motion"
import {
    LayoutDashboard, Package, Briefcase, Users, ClipboardCheck,
    TrendingUp, MapPin
} from "lucide-react"
import {
    Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
    Cell, PieChart, Pie, Legend
} from "recharts"
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/presentation/components/ui/card"
import {
    ChartContainer, ChartTooltipContent,
} from "@/presentation/components/ui/chart"
import {
    Map, MapMarker, MarkerContent, MarkerTooltip, MapControls
} from "@/presentation/components/ui/map"

// ─── Hardcoded KPI data ─────────────────────────────
const stats = [
    { label: "Total Assets", value: 128, icon: Package, color: "text-blue-400", bg: "from-blue-500/20 to-blue-600/10" },
    { label: "Active Loans", value: 34, icon: Briefcase, color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/10" },
    { label: "Users", value: 47, icon: Users, color: "text-purple-400", bg: "from-purple-500/20 to-purple-600/10" },
    { label: "Pending Approvals", value: 6, icon: ClipboardCheck, color: "text-amber-400", bg: "from-amber-500/20 to-amber-600/10" },
]

// ─── Bar chart: Assets by status ────────────────────
const assetsByStatus = [
    { status: "Operative", count: 72, fill: "hsl(160, 60%, 45%)" },
    { status: "Maintenance", count: 18, fill: "hsl(45, 80%, 55%)" },
    { status: "Out of Service", count: 8, fill: "hsl(0, 65%, 55%)" },
    { status: "Calibration", count: 12, fill: "hsl(210, 70%, 55%)" },
    { status: "Loaned", count: 10, fill: "hsl(270, 60%, 55%)" },
    { status: "In Transit", count: 5, fill: "hsl(190, 70%, 50%)" },
    { status: "Decommissioned", count: 3, fill: "hsl(0, 0%, 50%)" },
]

const barChartConfig = {
    count: { label: "Assets" },
} satisfies Record<string, { label: string }>

// ─── Pie chart: Loans by status ─────────────────────
const loansByStatus = [
    { name: "Active", value: 34, fill: "hsl(160, 60%, 45%)" },
    { name: "Pending", value: 6, fill: "hsl(45, 80%, 55%)" },
    { name: "Returned", value: 52, fill: "hsl(210, 70%, 55%)" },
    { name: "Overdue", value: 3, fill: "hsl(0, 65%, 55%)" },
]

const pieChartConfig = {
    value: { label: "Loans" },
} satisfies Record<string, { label: string }>

// ─── Map: Loan locations ────────────────────────────
const loanLocations = [
    { city: "Cd. Juárez", lat: 31.6904, lng: -106.4245, loans: 12 },
    { city: "Monterrey", lat: 25.6866, lng: -100.3161, loans: 8 },
    { city: "CDMX", lat: 19.4326, lng: -99.1332, loans: 6 },
    { city: "Chihuahua", lat: 28.6353, lng: -106.0889, loans: 4 },
    { city: "Guadalajara", lat: 20.6597, lng: -103.3496, loans: 3 },
    { city: "Puebla", lat: 19.0414, lng: -98.2063, loans: 1 },
]

// ─── Component ──────────────────────────────────────
export default function DashboardPage() {
    return (
        <div className="container max-w-7xl px-4 py-6 md:py-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 flex items-center gap-3"
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-blue-500/20 ring-1 ring-primary/20">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Overview of your asset management</p>
                </div>
            </motion.div>

            {/* ─── KPI Cards ─────────────────────── */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.05 }}
                    >
                        <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${s.bg} ring-1 ring-white/[0.06]`}>
                                    <s.icon className={`h-5 w-5 ${s.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* ─── Charts Row ────────────────────── */}
            <div className="mb-6 grid gap-4 lg:grid-cols-5">
                {/* Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="lg:col-span-3"
                >
                    <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                <CardTitle className="text-base">Assets by Status</CardTitle>
                            </div>
                            <CardDescription>Distribution of assets across operational statuses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={barChartConfig} className="h-[260px] w-full">
                                <BarChart data={assetsByStatus} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.15)" />
                                    <XAxis
                                        dataKey="status"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                                        tickMargin={8}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                                    />
                                    <ReTooltip
                                        content={<ChartTooltipContent />}
                                        cursor={{ fill: "hsl(var(--muted-foreground) / 0.06)" }}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                        {assetsByStatus.map((entry) => (
                                            <Cell key={entry.status} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="lg:col-span-2"
                >
                    <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-emerald-400" />
                                <CardTitle className="text-base">Loans Overview</CardTitle>
                            </div>
                            <CardDescription>Current loan status breakdown</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={pieChartConfig} className="h-[260px] w-full">
                                <PieChart>
                                    <Pie
                                        data={loansByStatus}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                        strokeWidth={2}
                                        stroke="hsl(var(--background))"
                                    >
                                        {loansByStatus.map((entry) => (
                                            <Cell key={entry.name} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <ReTooltip content={<ChartTooltipContent />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={(value: string) => (
                                            <span className="text-xs text-muted-foreground">{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ─── Map ───────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
            >
                <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-cyan-400" />
                            <CardTitle className="text-base">Active Loans by City</CardTitle>
                        </div>
                        <CardDescription>Hover markers to see loan count per location</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[350px] w-full">
                            <Map
                                theme="dark"
                                center={[-102.5, 24.5]}
                                zoom={4.5}
                                className="rounded-b-xl"
                            >
                                <MapControls position="bottom-right" showZoom />
                                {loanLocations.map((loc) => (
                                    <MapMarker
                                        key={loc.city}
                                        longitude={loc.lng}
                                        latitude={loc.lat}
                                    >
                                        <MarkerContent>
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/80 bg-primary text-[10px] font-bold text-primary-foreground shadow-lg shadow-primary/30">
                                                {loc.loans}
                                            </div>
                                        </MarkerContent>
                                        <MarkerTooltip>
                                            <div className="rounded-lg border bg-popover px-3 py-2 text-center text-popover-foreground shadow-md">
                                                <p className="font-semibold">{loc.city}</p>
                                                <p className="text-muted-foreground">{loc.loans} active loan{loc.loans !== 1 ? "s" : ""}</p>
                                            </div>
                                        </MarkerTooltip>
                                    </MapMarker>
                                ))}
                            </Map>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
