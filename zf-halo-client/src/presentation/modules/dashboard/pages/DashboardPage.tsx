import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Users,
  ClipboardCheck,
  TrendingUp,
  MapPin,
  AlertTriangle,
  PackageCheck,
  Wrench,
  RefreshCw,
  Activity,
} from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/presentation/components/ui/chart";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MapControls,
} from "@/presentation/components/ui/map";
import { useDashboardStats } from "@/application/dashboard/useDashboard";
import { useAuthStore } from "@/application/auth/auth.store";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
);

const ASSET_STATUS_COLORS: Record<string, string> = {
  OPERATIVE: "hsl(160, 60%, 45%)",
  MAINTENANCE: "hsl(45, 80%, 55%)",
  OUT_OF_SERVICE: "hsl(0, 65%, 55%)",
  CALIBRATION: "hsl(210, 70%, 55%)",
  LOANED: "hsl(270, 60%, 55%)",
  IN_TRANSIT: "hsl(190, 70%, 50%)",
  DECOMMISSIONED: "hsl(0, 0%, 50%)",
};

const ASSET_STATUS_LABELS: Record<string, string> = {
  OPERATIVE: "Operative",
  MAINTENANCE: "Maintenance",
  OUT_OF_SERVICE: "Out of Service",
  CALIBRATION: "Calibration",
  LOANED: "Loaned",
  IN_TRANSIT: "In Transit",
  DECOMMISSIONED: "Decommissioned",
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { user } = useAuthStore();
  const role = user?.role ?? "USER";
  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";
  const isAuditor = role === "AUDITOR";

  // Build bar chart data from real asset status
  const assetChartData = stats
    ? Object.entries(stats.assets.byStatus).map(([status, count]) => ({
        status: ASSET_STATUS_LABELS[status] ?? status,
        count,
        fill: ASSET_STATUS_COLORS[status] ?? "hsl(var(--primary))",
      }))
    : [];

  // Build pie chart data from real loan status
  const loanPieData = stats
    ? [
        {
          name: "Checked Out",
          value: stats.loans.checkedOut,
          fill: "hsl(210, 70%, 55%)",
        },
        {
          name: "Authorized",
          value: stats.loans.authorized,
          fill: "hsl(270, 60%, 55%)",
        },
        {
          name: "Requested",
          value: stats.loans.requested,
          fill: "hsl(45, 80%, 55%)",
        },
        {
          name: "Returned",
          value: stats.loans.returned,
          fill: "hsl(160, 60%, 45%)",
        },
        {
          name: "Rejected",
          value: stats.loans.rejected,
          fill: "hsl(0, 65%, 55%)",
        },
      ].filter((d) => d.value > 0)
    : [];

  // KPI cards definition per role
  type KPICard = {
    label: string;
    value: number | string;
    sublabel?: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    alert?: boolean;
  };

  const adminKPIs: KPICard[] = stats
    ? [
        {
          label: "Total Assets",
          value: stats.assets.total.toLocaleString(),
          sublabel: `${stats.assets.utilizationRate}% utilization`,
          icon: Package,
          color: "text-blue-400",
          bg: "from-blue-500/20 to-blue-600/10",
        },
        {
          label: "Active Loans",
          value: stats.loans.checkedOut + stats.loans.authorized,
          sublabel: `${stats.loans.requested} pending approval`,
          icon: ArrowLeftRight,
          color: "text-emerald-400",
          bg: "from-emerald-500/20 to-emerald-600/10",
        },
        {
          label: "Overdue",
          value: stats.loans.overdue,
          sublabel: "Past return date",
          icon: AlertTriangle,
          color: stats.loans.overdue > 0 ? "text-red-400" : "text-gray-400",
          bg:
            stats.loans.overdue > 0
              ? "from-red-500/20 to-red-600/10"
              : "from-gray-500/20 to-gray-600/10",
          alert: stats.loans.overdue > 0,
        },
        {
          label: "Active Users",
          value: stats.users.active,
          sublabel: `of ${stats.users.total} total`,
          icon: Users,
          color: "text-purple-400",
          bg: "from-purple-500/20 to-purple-600/10",
        },
      ]
    : [];

  const managerKPIs: KPICard[] = stats
    ? [
        {
          label: "Pending Approval",
          value: stats.loans.requested,
          sublabel: "Awaiting your action",
          icon: ClipboardCheck,
          color: "text-amber-400",
          bg: "from-amber-500/20 to-amber-600/10",
          alert: stats.loans.requested > 0,
        },
        {
          label: "Authorized",
          value: stats.loans.authorized,
          sublabel: "Ready for checkout",
          icon: PackageCheck,
          color: "text-purple-400",
          bg: "from-purple-500/20 to-purple-600/10",
        },
        {
          label: "Checked Out",
          value: stats.loans.checkedOut,
          sublabel: "Currently in use",
          icon: ArrowLeftRight,
          color: "text-blue-400",
          bg: "from-blue-500/20 to-blue-600/10",
        },
        {
          label: "Overdue",
          value: stats.loans.overdue,
          sublabel: "Needs follow-up",
          icon: AlertTriangle,
          color: stats.loans.overdue > 0 ? "text-red-400" : "text-gray-400",
          bg:
            stats.loans.overdue > 0
              ? "from-red-500/20 to-red-600/10"
              : "from-gray-500/20 to-gray-600/10",
          alert: stats.loans.overdue > 0,
        },
      ]
    : [];

  const userKPIs: KPICard[] = stats
    ? [
        {
          label: "Total Assets",
          value: stats.assets.total.toLocaleString(),
          sublabel: "Available to request",
          icon: Package,
          color: "text-blue-400",
          bg: "from-blue-500/20 to-blue-600/10",
        },
        {
          label: "Assets in Use",
          value: stats.loans.checkedOut,
          sublabel: "Currently loaned out",
          icon: Wrench,
          color: "text-emerald-400",
          bg: "from-emerald-500/20 to-emerald-600/10",
        },
        {
          label: "Operative",
          value: stats.assets.byStatus["OPERATIVE"] ?? 0,
          sublabel: "Ready for use",
          icon: Activity,
          color: "text-green-400",
          bg: "from-green-500/20 to-green-600/10",
        },
        {
          label: "In Maintenance",
          value: stats.assets.byStatus["MAINTENANCE"] ?? 0,
          sublabel: "Temporarily unavailable",
          icon: RefreshCw,
          color: "text-amber-400",
          bg: "from-amber-500/20 to-amber-600/10",
        },
      ]
    : [];

  const auditorKPIs: KPICard[] = stats
    ? [
        {
          label: "Total Assets",
          value: stats.assets.total.toLocaleString(),
          sublabel: `${stats.assets.utilizationRate}% utilization`,
          icon: Package,
          color: "text-blue-400",
          bg: "from-blue-500/20 to-blue-600/10",
        },
        {
          label: "Total Loans",
          value: stats.loans.total.toLocaleString(),
          sublabel: "All-time records",
          icon: ArrowLeftRight,
          color: "text-emerald-400",
          bg: "from-emerald-500/20 to-emerald-600/10",
        },
        {
          label: "Active Users",
          value: stats.users.active,
          sublabel: `of ${stats.users.total} total`,
          icon: Users,
          color: "text-purple-400",
          bg: "from-purple-500/20 to-purple-600/10",
        },
        {
          label: "Overdue",
          value: stats.loans.overdue,
          sublabel: "Compliance risk",
          icon: AlertTriangle,
          color: stats.loans.overdue > 0 ? "text-red-400" : "text-gray-400",
          bg:
            stats.loans.overdue > 0
              ? "from-red-500/20 to-red-600/10"
              : "from-gray-500/20 to-gray-600/10",
          alert: stats.loans.overdue > 0,
        },
      ]
    : [];

  const kpis =
    role === "ADMIN"
      ? adminKPIs
      : role === "MANAGER"
        ? managerKPIs
        : role === "AUDITOR"
          ? auditorKPIs
          : userKPIs;

  const roleLabel =
    role === "ADMIN"
      ? "Administrator"
      : role === "MANAGER"
        ? "Manager"
        : role === "AUDITOR"
          ? "Auditor"
          : "User";

  return (
    <div className="container max-w-7xl px-4 py-6 md:py-10 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-blue-500/20 ring-1 ring-primary/20">
          <LayoutDashboard className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {roleLabel} view · Asset management overview
          </p>
        </div>
      </motion.div>

      {/* ─── KPI Cards ───────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))
          : kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.06 }}
              >
                <Card
                  className={`border-white/[0.08] bg-white/[0.04] backdrop-blur-sm ${kpi.alert ? "ring-1 ring-red-500/30" : ""}`}
                >
                  <CardContent className="flex items-center gap-4 p-5">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${kpi.bg} ring-1 ring-white/[0.06]`}
                    >
                      <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold tracking-tight">
                        {kpi.value}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {kpi.label}
                      </p>
                      {kpi.sublabel && (
                        <p className="text-[10px] text-muted-foreground/70 truncate">
                          {kpi.sublabel}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* ─── Quick Stats Row (admin/auditor) ─────── */}
      {(isAdminOrManager || isAuditor) && stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                Loan Pipeline
              </p>
              <div className="space-y-2">
                {[
                  {
                    label: "Requested",
                    value: stats?.loans?.requested ?? 0,
                    color: "bg-amber-500",
                  },
                  {
                    label: "Authorized",
                    value: stats?.loans?.authorized ?? 0,
                    color: "bg-purple-500",
                  },
                  {
                    label: "Checked Out",
                    value: stats?.loans?.checkedOut ?? 0,
                    color: "bg-blue-500",
                  },
                  {
                    label: "Returned",
                    value: stats?.loans?.returned ?? 0,
                    color: "bg-emerald-500",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${item.color} shrink-0`}
                    />
                    <span className="text-xs text-muted-foreground flex-1">
                      {item.label}
                    </span>
                    <span className="text-xs font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                Asset Health
              </p>
              <div className="space-y-2">
                {stats?.assets?.byStatus &&
                  Object.entries(stats.assets.byStatus)
                    .slice(0, 5)
                    .map(([status, count]) => {
                      const pct =
                        (stats?.assets?.total ?? 0) > 0
                          ? Math.round(
                              (count / (stats?.assets?.total ?? 1)) * 100,
                            )
                          : 0;
                      return (
                        <div key={status}>
                          <div className="flex items-center justify-between text-xs mb-0.5">
                            <span className="text-muted-foreground">
                              {ASSET_STATUS_LABELS[status] ?? status}
                            </span>
                            <span className="font-semibold">{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor:
                                  ASSET_STATUS_COLORS[status] ??
                                  "hsl(var(--primary))",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                System Summary
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Asset Utilization
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {stats?.assets?.utilizationRate ?? 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Total Loans (all time)
                  </span>
                  <span className="text-sm font-bold">
                    {stats?.loans?.total?.toLocaleString() ?? "0"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Active Users
                  </span>
                  <span className="text-sm font-bold">
                    {stats?.users?.active ?? 0} / {stats?.users?.total ?? 0}
                  </span>
                </div>
                {(stats?.loans?.overdue ?? 0) > 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                    <span className="text-xs text-red-400 font-medium">
                      {stats?.loans?.overdue ?? 0} overdue loan
                      {(stats?.loans?.overdue ?? 0) !== 1 ? "s" : ""} need
                      attention
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ─── Charts Row ──────────────────────────────── */}
      {(isAdminOrManager || isAuditor) && (
        <div className="grid gap-4 lg:grid-cols-5">
          {/* Bar Chart: assets by status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Assets by Status</CardTitle>
                </div>
                <CardDescription>
                  Distribution across operational statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[260px] w-full" />
                ) : (
                  <ChartContainer
                    config={{ count: { label: "Assets" } }}
                    className="h-[260px] w-full"
                  >
                    <BarChart
                      data={assetChartData}
                      margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                        stroke="hsl(var(--muted-foreground) / 0.15)"
                      />
                      <XAxis
                        dataKey="status"
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 10,
                        }}
                        tickMargin={8}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 11,
                        }}
                      />
                      <ReTooltip
                        content={<ChartTooltipContent />}
                        cursor={{
                          fill: "hsl(var(--muted-foreground) / 0.06)",
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {assetChartData.map((entry) => (
                          <Cell key={entry.status} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pie Chart: loans by status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-emerald-400" />
                  <CardTitle className="text-base">Loans Overview</CardTitle>
                </div>
                <CardDescription>Current loan status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[260px] w-full" />
                ) : (
                  <ChartContainer
                    config={{ value: { label: "Loans" } }}
                    className="h-[260px] w-full"
                  >
                    <PieChart>
                      <Pie
                        data={loanPieData}
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={2}
                        stroke="hsl(var(--background))"
                      >
                        {loanPieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ReTooltip content={<ChartTooltipContent />} />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value: string) => (
                          <span className="text-xs text-muted-foreground">
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* ─── Map ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card className="border-white/[0.08] bg-white/[0.04] backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cyan-400" />
                <CardTitle className="text-base">
                  Active Loans by Location
                </CardTitle>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block" />
                  Active
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />
                  Overdue
                </span>
              </div>
            </div>
            <CardDescription>
              Destinations with active or overdue loans · hover for details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[380px] w-full">
              {isLoading ? (
                <Skeleton className="h-full w-full rounded-none" />
              ) : (
                <Map
                  theme="dark"
                  center={[-102.5, 24.5]}
                  zoom={4.5}
                  className="rounded-b-xl"
                >
                  <MapControls position="bottom-right" showZoom />
                  {stats?.map?.activeLoans?.map((loc) => {
                    const hasOverdue = loc.overdue > 0;
                    return (
                      <MapMarker
                        key={loc.destinationId}
                        longitude={loc.longitude}
                        latitude={loc.latitude}
                      >
                        <MarkerContent>
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-[11px] font-bold text-white shadow-lg transition-transform hover:scale-110 ${
                              hasOverdue
                                ? "bg-red-500 border-red-300 shadow-red-500/40"
                                : "bg-primary border-primary/60 shadow-primary/30"
                            }`}
                          >
                            {loc.count}
                          </div>
                        </MarkerContent>
                        <MarkerTooltip>
                          <div className="rounded-xl border bg-popover px-4 py-3 text-popover-foreground shadow-xl min-w-[160px]">
                            <p className="font-semibold text-sm">
                              {loc.destinationName}
                            </p>
                            <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                              <p>
                                <span className="text-primary font-medium">
                                  {loc.count}
                                </span>{" "}
                                active loan{loc.count !== 1 ? "s" : ""}
                              </p>
                              {loc.overdue > 0 && (
                                <p className="text-red-400 font-medium">
                                  ⚠ {loc.overdue} overdue
                                </p>
                              )}
                            </div>
                          </div>
                        </MarkerTooltip>
                      </MapMarker>
                    );
                  })}
                </Map>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
