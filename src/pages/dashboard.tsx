import { useState, useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { ROLE_LABELS } from '@/lib/constants';
import { formatNaira, formatCompactNaira } from '@/lib/formatters';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar,
  // eslint-disable-next-line @typescript-eslint/no-deprecated
} from 'recharts';
import { cn } from '@/lib/utils';
import { StationMap } from '@/components/dashboard/station-map';
import {
  getFilteredStationIds,
  getFilteredMonthlyData,
  getFilteredTimeSeriesData,
  getTimeSeriesSummary,
  getLatestMonthKPIs,
  getTopPerformers,
  getRevenueBreakdown,
} from '@/data/dashboard-data';
import type { DateRangeKey } from '@/data/dashboard-data';

// ── Animated number counter ──────────────────────────────────────────
function useAnimatedValue(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const ref = useRef<number | undefined>(undefined);

  useEffect(() => {
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(target * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration]);

  return value;
}

// ── Inline SVG icons (custom, not from any library) ──────────────────
function IconPeople(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="7" r="4" fill="currentColor" opacity="0.15" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path d="M2 21v-2a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M2 21v-2a5 5 0 0 1 10 0v2" fill="currentColor" opacity="0.08" />
      <circle cx="17" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M22 21v-1a4 4 0 0 0-3.5-3.97" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconStation(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.1" />
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" stroke="currentColor" strokeWidth="1.25" opacity="0.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function IconActiveUser(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="10" cy="7" r="4" fill="currentColor" opacity="0.15" />
      <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 21v-2a5 5 0 0 1 5-5h4" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16 18l2 2 4-4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconRevenue(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.1" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      {/* Naira ₦ sign: N with two horizontal strokes */}
      <path d="M9 7v10M15 7v10M9 7l6 10" stroke="currentColor" strokeWidth="1.75" />
      <path d="M7.5 10.5h9M7.5 13.5h9" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function IconAttendance(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" fill="currentColor" opacity="0.1" />
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 16l2 2 4-4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconGrad(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3L1 9l11 6 9-4.91V17" stroke="currentColor" strokeWidth="1.75" />
      <path d="M5 13.18v4.82a10 10 0 0 0 14 0v-4.82" fill="currentColor" opacity="0.1" />
      <path d="M5 13.18v4.82a10 10 0 0 0 14 0v-4.82" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconTrophy(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M6 3h12v7a6 6 0 0 1-12 0V3z" fill="currentColor" opacity="0.1" />
      <path d="M6 3h12v7a6 6 0 0 1-12 0V3z" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 16v3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 22h8" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 22l1-3h6l1 3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconAlertRing(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="currentColor" opacity="0.12" />
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.75" />
      <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function IconCheckBadge(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.12" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconXMark(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.12" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconInfoCircle(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.12" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconClock(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.1" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconTrending(props: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="currentColor" strokeWidth="2" />
      <polyline points="16 7 22 7 22 13" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// ── Chart data ───────────────────────────────────────────────────────
const recentAlerts = [
  { title: 'Underperformance Alert', msg: 'Emeka Nwankwo — sales below target 3 consecutive days', type: 'error' as const, time: '2 min ago' },
  { title: 'Training Overdue', msg: 'Fire Safety module deadline passed for 5 attendants', type: 'warning' as const, time: '15 min ago' },
  { title: 'Absent — No Check-in', msg: 'Chioma Obi did not check in for morning shift', type: 'warning' as const, time: '45 min ago' },
  { title: 'New Application', msg: '3 new applications for Pump Attendant at Ikoyi station', type: 'info' as const, time: '1 hr ago' },
  { title: 'Promotion Eligible', msg: 'Olamide Bakare has met all criteria for Supervisor role', type: 'success' as const, time: '2 hrs ago' },
];

const alertConfig = {
  error:   { icon: IconXMark,     color: 'text-red-500',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
  warning: { icon: IconAlertRing, color: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  info:    { icon: IconInfoCircle,color: 'text-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  success: { icon: IconCheckBadge,color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

// ── Custom tooltip ───────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--popover)]/95 backdrop-blur-md px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-[var(--foreground)] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[11px] text-[var(--muted-foreground)]">{entry.name}:</span>
          <span className="text-[11px] font-mono font-bold text-[var(--foreground)]">
            {entry.value >= 1000
              ? formatCompactNaira(entry.value)
              : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Stat card component ──────────────────────────────────────────────
interface StatProps {
  icon: React.FC<React.SVGAttributes<SVGSVGElement>>;
  label: string;
  value: number;
  displayValue?: string;
  trend?: number;
  subtitle: string;
  iconColor: string;
  iconBg: string;
  delay: number;
}

function DashStat({ icon: Icon, label, value, displayValue, trend, subtitle, iconColor, iconBg, delay }: StatProps) {
  const animated = useAnimatedValue(value);
  const display = displayValue
    ? displayValue.replace(/[\d,]+/, animated.toLocaleString())
    : animated.toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)]/50 backdrop-blur-sm px-3.5 py-3 hover-elevate group"
    >
      <div className={cn('p-2 rounded-lg shrink-0 transition-transform group-hover:scale-110', iconBg)}>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-semibold text-[var(--muted-foreground)] uppercase tracking-[0.1em] leading-none">
          {label}
        </p>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <p className="text-lg font-bold font-mono tracking-tight text-[var(--foreground)] leading-tight">
            {display}
          </p>
          {trend !== undefined && (
            <span className={cn(
              'text-[10px] font-bold',
              trend >= 0 ? 'text-emerald-500' : 'text-red-500'
            )}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <p className="text-[10px] text-[var(--muted-foreground)] leading-none mt-0.5">{subtitle}</p>
      </div>
    </motion.div>
  );
}

// ── Chart card ───────────────────────────────────────────────────────
function ChartCard({ title, rightContent, children, delay = 0, className: cx }: {
  title: string;
  rightContent?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={cn(
        'rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 backdrop-blur-sm p-6',
        cx
      )}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-[var(--foreground)]">{title}</h3>
        {rightContent}
      </div>
      {children}
    </motion.div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────
export function DashboardPage() {
  const { currentUser } = useAppStore();
  if (!currentUser) return null;

  const role = currentUser.role;
  const isAdmin = ['admin', 'regional_manager', 'branch_manager'].includes(role);
  const isStation = ['dealer', 'supervisor'].includes(role);
  const isAttendant = role === 'attendant';

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // ── Global filter state (from Zustand store) ───────────────────
  const { selectedRegionId: regionFilter, selectedBranchId: branchFilter, selectedStationId: stationFilter } = useAppStore();
  const [revenueRange, setRevenueRange] = useState<DateRangeKey>('1y');

  // ── Computed data from filters ──────────────────────────────────
  const filteredStationIds = useMemo(
    () => getFilteredStationIds(regionFilter || undefined, branchFilter || undefined, stationFilter || undefined),
    [regionFilter, branchFilter, stationFilter]
  );

  const kpis = useMemo(
    () => getLatestMonthKPIs(regionFilter || undefined, branchFilter || undefined, stationFilter || undefined),
    [regionFilter, branchFilter, stationFilter]
  );

  const monthlyData = useMemo(
    () => getFilteredMonthlyData(regionFilter || undefined, branchFilter || undefined, stationFilter || undefined),
    [regionFilter, branchFilter, stationFilter]
  );

  const chartData = useMemo(
    () => getFilteredTimeSeriesData(revenueRange, regionFilter || undefined, branchFilter || undefined, stationFilter || undefined),
    [revenueRange, regionFilter, branchFilter, stationFilter]
  );

  const chartSummary = useMemo(
    () => getTimeSeriesSummary(revenueRange, chartData),
    [revenueRange, chartData]
  );

  const revBreakdown = useMemo(
    () => getRevenueBreakdown(regionFilter || undefined, branchFilter || undefined, stationFilter || undefined),
    [regionFilter, branchFilter, stationFilter]
  );

  const topPerformers = useMemo(
    () => getTopPerformers(regionFilter || undefined, branchFilter || undefined, stationFilter || undefined),
    [regionFilter, branchFilter, stationFilter]
  );

  // Chart data for attendance trend
  const attendanceChartData = useMemo(
    () => monthlyData.map(m => ({
      month: m.month,
      present: Math.round(m.employeeCount * m.attendanceRate / 100),
      late: Math.round(m.employeeCount * 0.05),
      absent: Math.round(m.employeeCount * (100 - m.attendanceRate) / 100),
    })),
    [monthlyData]
  );

  const hasFilter = regionFilter || branchFilter || stationFilter;

  return (
    <div className="max-w-[1920px] mx-auto">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {greeting}, {currentUser.employee.firstName}
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {ROLE_LABELS[role]} &middot; {dateStr}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-[var(--muted)]/50 px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-[var(--foreground)]">Live</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Admin / Manager Dashboard                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {isAdmin && (
        <div className="space-y-6">
          {/* ── KPI Cards ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            <DashStat
              icon={IconPeople}
              label="Total Staff"
              value={kpis.totalStaff}
              subtitle={`across ${kpis.totalStations} stations`}
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-500/10"
              delay={0.1}
            />
            <DashStat
              icon={IconStation}
              label="Active Stations"
              value={kpis.activeStations}
              subtitle={`${kpis.totalStations - kpis.activeStations} inactive`}
              iconColor="text-blue-600 dark:text-blue-400"
              iconBg="bg-blue-500/10"
              delay={0.12}
            />
            <DashStat
              icon={IconActiveUser}
              label="Checked In"
              value={kpis.checkedIn}
              trend={kpis.attendanceTrend}
              subtitle="active today"
              iconColor="text-amber-600 dark:text-amber-400"
              iconBg="bg-amber-500/10"
              delay={0.14}
            />
            <DashStat
              icon={IconRevenue}
              label="Monthly Revenue"
              value={kpis.totalRevenue}
              displayValue={formatCompactNaira(kpis.totalRevenue)}
              trend={kpis.revenueTrend}
              subtitle={`~${formatCompactNaira(kpis.dailyRevenue)}/day`}
              iconColor="text-green-600 dark:text-green-400"
              iconBg="bg-green-500/10"
              delay={0.16}
            />
            <DashStat
              icon={IconAttendance}
              label="Attendance"
              value={kpis.attendanceRate}
              displayValue={`${kpis.attendanceRate}%`}
              trend={kpis.attendanceTrend}
              subtitle="monthly average"
              iconColor="text-cyan-600 dark:text-cyan-400"
              iconBg="bg-cyan-500/10"
              delay={0.18}
            />
            <DashStat
              icon={IconGrad}
              label="Training"
              value={kpis.trainingCompliance}
              displayValue={`${kpis.trainingCompliance}%`}
              subtitle="compliance rate"
              iconColor="text-purple-600 dark:text-purple-400"
              iconBg="bg-purple-500/10"
              delay={0.2}
            />
          </div>

          {/* ── Station Map ────────────────────────────────────── */}
          <StationMap filteredStationIds={hasFilter ? filteredStationIds : undefined} highlightRegionId={regionFilter || undefined} />

          {/* ── Revenue Trend (FULL WIDTH) ──────────────────── */}
          <ChartCard
            title="Revenue Trend"
            delay={0.25}
            rightContent={
              <div className="flex flex-col items-end gap-2">
                {/* Cowrywise-style date range pills */}
                <div className="flex items-center gap-0.5 rounded-lg bg-[var(--muted)]/50 p-1">
                  {([
                    { key: 'today' as DateRangeKey, label: 'Today' },
                    { key: '1w' as DateRangeKey, label: '1W' },
                    { key: '30d' as DateRangeKey, label: '30D' },
                    { key: '1y' as DateRangeKey, label: '1Y' },
                    { key: '5y' as DateRangeKey, label: '5Y' },
                  ]).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setRevenueRange(key)}
                      className={cn(
                        'px-3 py-1 rounded-md text-xs font-semibold transition-all',
                        revenueRange === key
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
                          : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-6 rounded-full bg-emerald-500" />
                    <span className="text-[var(--muted-foreground)]">PMS (Petrol)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-6 rounded-full bg-blue-500" />
                    <span className="text-[var(--muted-foreground)]">AGO (Diesel)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-[2px] w-6 border-t-2 border-dashed border-amber-500" />
                    <span className="text-[var(--muted-foreground)]">Lubricant</span>
                  </div>
                </div>
              </div>
            }
          >
            <div className="h-[440px] rounded-xl overflow-hidden bg-gradient-to-b from-[var(--muted)]/30 to-transparent p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart key={revenueRange} data={chartData} margin={{ top: 16, right: 72, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pmsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.55} />
                      <stop offset="60%" stopColor="#22c55e" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="agoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} />
                      <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lubGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="60%" stopColor="#f59e0b" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="glowAmber" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={revenueRange === 'today' ? 3 : revenueRange === '30d' ? 4 : 0}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tickFormatter={(v: number) => formatCompactNaira(v)}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={65}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(v: number) => formatCompactNaira(v)}
                    tick={{ fill: '#f59e0b', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    width={65}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="pmsRevenue"
                    name="PMS Revenue"
                    stroke="#22c55e"
                    strokeWidth={3.5}
                    fill="url(#pmsGrad)"
                    isAnimationActive
                    animationDuration={1200}
                    animationEasing="ease-out"
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#22c55e' }}
                    filter="url(#glowGreen)"
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="agoRevenue"
                    name="AGO Revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#agoGrad)"
                    isAnimationActive
                    animationDuration={1200}
                    animationEasing="ease-out"
                    animationBegin={100}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                    filter="url(#glowBlue)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="lubricantRevenue"
                    name="Lubricant Revenue"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fill="url(#lubGrad)"
                    strokeDasharray="8 4"
                    isAnimationActive
                    animationDuration={1200}
                    animationEasing="ease-out"
                    animationBegin={200}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0, fill: '#f59e0b' }}
                    filter="url(#glowAmber)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">{chartSummary.periodLabel}</p>
                <p className="text-xl font-bold font-mono text-[var(--foreground)]">{formatCompactNaira(chartSummary.periodTotal)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[var(--muted-foreground)]">{chartSummary.avgLabel}</p>
                <p className="text-xl font-bold font-mono text-[var(--foreground)]">{formatCompactNaira(chartSummary.avgValue)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--muted-foreground)]">{chartSummary.trendLabel}</p>
                <p className={cn('text-xl font-bold font-mono', chartSummary.trendValue >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                  {chartSummary.trendValue >= 0 ? '+' : ''}{chartSummary.trendValue}%
                </p>
              </div>
            </div>
          </ChartCard>

          {/* ── Attendance Trend (FULL WIDTH) ─────────────────── */}
          <ChartCard
            title="Attendance Trend"
            delay={0.3}
            rightContent={
              <div className="flex items-center gap-3 text-[11px]">
                {[
                  { label: 'Present', color: '#22c55e' },
                  { label: 'Late', color: '#f59e0b' },
                  { label: 'Absent', color: '#ef4444' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: l.color }} />
                    <span className="text-[var(--muted-foreground)]">{l.label}</span>
                  </div>
                ))}
              </div>
            }
          >
            <div className="h-[440px] rounded-xl overflow-hidden bg-gradient-to-b from-[var(--muted)]/30 to-transparent p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceChartData} margin={{ top: 16, right: 10, left: 0, bottom: 0 }} barCategoryGap="30%">
                  <defs>
                    <linearGradient id="barPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="barLate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="barAbsent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="present" name="Present" fill="url(#barPresent)" radius={[0, 0, 0, 0]} stackId="att" isAnimationActive animationDuration={900} animationEasing="ease-out" />
                  <Bar dataKey="late" name="Late" fill="url(#barLate)" radius={[0, 0, 0, 0]} stackId="att" isAnimationActive animationDuration={900} animationEasing="ease-out" animationBegin={80} />
                  <Bar dataKey="absent" name="Absent" fill="url(#barAbsent)" radius={[6, 6, 0, 0]} stackId="att" isAnimationActive animationDuration={900} animationEasing="ease-out" animationBegin={160} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Avg Attendance</p>
                <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{kpis.attendanceRate}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[var(--muted-foreground)]">Total Staff</p>
                <p className="text-xl font-bold font-mono text-[var(--foreground)]">{kpis.totalStaff}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--muted-foreground)]">Incidents (month)</p>
                <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{kpis.incidentCount}</p>
              </div>
            </div>
          </ChartCard>

          {/* ── Revenue Breakdown + Training Compliance ───────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Product */}
            <ChartCard title="Revenue by Product" delay={0.33}>
              <div className="flex items-center gap-6">
                <div className="relative h-[200px] w-[200px] flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {revBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold font-mono text-[var(--foreground)]">{formatCompactNaira(kpis.totalRevenue)}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">Total</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {revBreakdown.map((item) => {
                    const total = revBreakdown.reduce((s, d) => s + d.value, 0);
                    const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                    return (
                      <div key={item.name} className="flex items-center justify-between gap-3 py-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-3 w-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-sm truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-medium">{formatCompactNaira(item.value)}</span>
                          <span className="text-xs text-[var(--muted-foreground)] w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ChartCard>

            {/* Training Compliance */}
            <ChartCard title="Training Compliance" delay={0.35}>
              <div className="flex items-center gap-6">
                <div className="relative h-[200px] w-[200px] flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="65%"
                      outerRadius="100%"
                      startAngle={180}
                      endAngle={-180}
                      data={[{ value: kpis.trainingCompliance, fill: '#a855f7' }]}
                    >
                      <RadialBar background dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold font-mono text-[var(--foreground)]">{kpis.trainingCompliance}%</span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">Compliant</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {[
                    { label: 'Completed', pct: kpis.trainingCompliance, color: '#22c55e' },
                    { label: 'In Progress', pct: Math.round(kpis.trainingCompliance * 0.3), color: '#3b82f6' },
                    { label: 'Overdue', pct: Math.round((100 - kpis.trainingCompliance) * 0.4), color: '#ef4444' },
                    { label: 'Not Started', pct: Math.round((100 - kpis.trainingCompliance) * 0.6), color: '#a855f7' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-[var(--foreground)]">{item.label}</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-[var(--foreground)]">{item.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--muted)]/50 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.pct}%` }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Top Performers" delay={0.38} rightContent={
              <span className="text-[11px] text-[var(--muted-foreground)]">{hasFilter ? `${filteredStationIds.length} stations` : 'All Stations'}</span>
            }>
              <div className="space-y-3">
                {topPerformers.length === 0 && (
                  <p className="text-sm text-[var(--muted-foreground)] text-center py-8">No performers for selected filter</p>
                )}
                {topPerformers.map((p, i) => {
                  const medals = ['bg-amber-500/20 text-amber-600 border-amber-500/30', 'bg-gray-300/20 text-gray-500 border-gray-300/30', 'bg-orange-500/20 text-orange-600 border-orange-500/30'];
                  return (
                    <motion.div
                      key={p.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      className={cn(
                        'flex items-center gap-3 rounded-lg p-3 transition-colors',
                        i < 3 ? 'bg-[var(--muted)]/30' : 'hover:bg-[var(--muted)]/20'
                      )}
                    >
                      <div className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold border',
                        i < 3 ? medals[i] : 'bg-[var(--muted)]/50 text-[var(--muted-foreground)] border-transparent'
                      )}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--foreground)] truncate">{p.name}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)]">{p.station} Station</p>
                      </div>
                      <div className="w-24 hidden sm:block">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-[var(--muted-foreground)]">Sales</span>
                          <span className="text-[11px] font-mono font-bold text-[var(--foreground)]">{p.sales}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[var(--muted)]/50 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${p.sales}%` }}
                            transition={{ delay: 0.7 + i * 0.08, duration: 0.6 }}
                            className="h-full rounded-full bg-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <IconTrophy className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs font-mono font-bold text-[var(--foreground)]">{p.rating}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ChartCard>
          </div>

          {/* ── Activity Feed ──────────────────────────────────── */}
          <ChartCard title="Activity Feed" delay={0.4} rightContent={
            <span className="text-[11px] text-[var(--muted-foreground)]">Today</span>
          }>
            <div className="space-y-1">
              {recentAlerts.map((alert, i) => {
                const config = alertConfig[alert.type];
                const AlertIcon = config.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                    className={cn(
                      'flex items-start gap-3 rounded-lg p-3 border transition-all cursor-pointer',
                      'bg-transparent border-transparent hover:bg-[var(--muted)]/30 hover:border-[var(--border)]'
                    )}
                  >
                    <div className={cn('p-2 rounded-lg flex-shrink-0', config.bg)}>
                      <AlertIcon className={cn('h-4 w-4', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--foreground)]">{alert.title}</p>
                        <span className={cn(
                          'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md',
                          config.bg, config.color
                        )}>
                          {alert.type}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{alert.msg}</p>
                    </div>
                    <span className="text-[10px] text-[var(--muted-foreground)] whitespace-nowrap flex-shrink-0 mt-0.5">
                      {alert.time}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </ChartCard>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Dealer / Supervisor Dashboard                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {isStation && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashStat icon={IconPeople} label="My Staff" value={38} subtitle="at your station" iconColor="text-emerald-600 dark:text-emerald-400" iconBg="bg-emerald-500/10" delay={0} />
            <DashStat icon={IconActiveUser} label="Present Today" value={34} trend={-5} subtitle="4 absent" iconColor="text-amber-600 dark:text-amber-400" iconBg="bg-amber-500/10" delay={0.05} />
            <DashStat icon={IconRevenue} label="Lubricant Sales" value={1450000} displayValue="₦1,450,000" subtitle="vs ₦2,000,000 target" iconColor="text-green-600 dark:text-green-400" iconBg="bg-green-500/10" delay={0.1} />
            <DashStat icon={IconClock} label="Pending Tasks" value={4} subtitle="overdue trainings & reviews" iconColor="text-red-600 dark:text-red-400" iconBg="bg-red-500/10" delay={0.15} />
          </div>

          <ChartCard title="Daily Sales — This Week" delay={0.2}>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { day: 'Mon', actual: 2850000, target: 3200000 },
                  { day: 'Tue', actual: 3100000, target: 3200000 },
                  { day: 'Wed', actual: 2680000, target: 3200000 },
                  { day: 'Thu', actual: 3450000, target: 3200000 },
                  { day: 'Fri', actual: 3900000, target: 3200000 },
                  { day: 'Sat', actual: 4200000, target: 3200000 },
                  { day: 'Sun', actual: 3500000, target: 3200000 },
                ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="stationSalesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(v: number) => `₦${(v / 1000000).toFixed(1)}M`} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} axisLine={false} width={55} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="actual" name="Sales" fill="url(#stationSalesGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Today's Shift Schedule" delay={0.25}>
            <div className="space-y-4">
              {[
                { name: 'Morning', time: '6:00 AM – 2:00 PM', staff: 14, color: 'bg-blue-500', lightBg: 'bg-blue-500/10', textColor: 'text-blue-600 dark:text-blue-400' },
                { name: 'Afternoon', time: '2:00 PM – 10:00 PM', staff: 14, color: 'bg-amber-500', lightBg: 'bg-amber-500/10', textColor: 'text-amber-600 dark:text-amber-400' },
                { name: 'Night', time: '10:00 PM – 6:00 AM', staff: 6, color: 'bg-purple-500', lightBg: 'bg-purple-500/10', textColor: 'text-purple-600 dark:text-purple-400' },
              ].map((shift, i) => (
                <motion.div
                  key={shift.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                  className={cn('flex items-center justify-between rounded-xl border border-[var(--border)] p-4', shift.lightBg)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('h-3 w-3 rounded-full', shift.color)} />
                    <div>
                      <span className={cn('text-sm font-bold', shift.textColor)}>{shift.name}</span>
                      <p className="text-[11px] text-[var(--muted-foreground)]">{shift.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold font-mono text-[var(--foreground)]">{shift.staff}</span>
                    <p className="text-[10px] text-[var(--muted-foreground)]">staff</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Attendant Dashboard                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {isAttendant && (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {currentUser.employee.firstName[0]}{currentUser.employee.lastName[0]}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[var(--card)]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--foreground)]">
                  {currentUser.employee.firstName} {currentUser.employee.lastName}
                </h2>
                <p className="text-sm font-mono text-[var(--muted-foreground)]">{currentUser.employee.id}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Pump Attendant &middot; {currentUser.employee.dealerName}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DashStat icon={IconClock} label="Today's Shift" value={6} displayValue="Morning" subtitle="6:00 AM – 2:00 PM · Pump 3" iconColor="text-blue-600 dark:text-blue-400" iconBg="bg-blue-500/10" delay={0.1} />
            <DashStat icon={IconTrending} label="My Sales Today" value={325000} displayValue="₦325,000" subtitle="vs ₦500,000 target (65%)" iconColor="text-green-600 dark:text-green-400" iconBg="bg-green-500/10" delay={0.15} />
            <DashStat icon={IconGrad} label="Training Due" value={2} subtitle="modules pending" iconColor="text-purple-600 dark:text-purple-400" iconBg="bg-purple-500/10" delay={0.2} />
          </div>

          <ChartCard title="Today's Sales Progress" delay={0.25}>
            <div className="flex items-center gap-8">
              <div className="h-[180px] w-[180px] flex-shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    startAngle={180}
                    endAngle={0}
                    data={[{ value: 65, fill: '#22c55e' }]}
                  >
                    <RadialBar background dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center mt-[-10px]">
                  <span className="text-3xl font-bold font-mono text-[var(--foreground)]">65%</span>
                  <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">of target</span>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Current Sales</p>
                  <p className="text-2xl font-bold font-mono text-[var(--foreground)]">{formatNaira(325000)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Daily Target</p>
                  <p className="text-xl font-bold font-mono text-[var(--muted-foreground)]">{formatNaira(500000)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Remaining</p>
                  <p className="text-lg font-bold font-mono text-amber-500">{formatNaira(175000)}</p>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
