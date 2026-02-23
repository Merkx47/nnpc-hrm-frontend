import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, GraduationCap, ClipboardCheck, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermission } from '@/lib/rbac';
import { useAppStore } from '@/lib/store';
import { getFilteredStationIds } from '@/data/dashboard-data';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { salesTargets as staticSalesTargets } from '@/data/sales-targets';
import { performanceReviews as staticReviews } from '@/data/performance-reviews';
import { trainingAssignments as staticTrainingAssignments } from '@/data/training-modules';
import { useDataStore } from '@/lib/data-store';

type TimePeriod = 'daily' | 'weekly' | 'monthly';

const periodTabs: { key: TimePeriod; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

function getRatingColor(rating: number): string {
  if (rating >= 4) return 'text-green-600 dark:text-green-400';
  if (rating >= 3) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function getRatingBadgeColor(rating: number): string {
  if (rating >= 4) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  if (rating >= 3) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
}

export function KpiDashboardPage() {
  const canViewKpi = usePermission('view_kpi');
  const { selectedRegionId, selectedBranchId, selectedStationId } = useAppStore();
  const addedSalesTargets = useDataStore((s) => s.addedSalesTargets);
  const addedReviews = useDataStore((s) => s.addedReviews);
  const addedTrainingAssignments = useDataStore((s) => s.addedTrainingAssignments);
  const deletedSalesTargetIds = useDataStore((s) => s.deletedSalesTargetIds);
  const deletedReviewIds = useDataStore((s) => s.deletedReviewIds);
  const deletedTrainingAssignmentIds = useDataStore((s) => s.deletedTrainingAssignmentIds);
  const salesTargets = useMemo(() => {
    const d = new Set(deletedSalesTargetIds);
    return [...staticSalesTargets, ...addedSalesTargets].filter((st) => !d.has(st.id));
  }, [addedSalesTargets, deletedSalesTargetIds]);
  const performanceReviews = useMemo(() => {
    const d = new Set(deletedReviewIds);
    return [...staticReviews, ...addedReviews].filter((r) => !d.has(r.id));
  }, [addedReviews, deletedReviewIds]);
  const trainingAssignments = useMemo(() => {
    const d = new Set(deletedTrainingAssignmentIds);
    return [...staticTrainingAssignments, ...addedTrainingAssignments].filter((ta) => !d.has(ta.id));
  }, [addedTrainingAssignments, deletedTrainingAssignmentIds]);

  // Global filter: compute allowed station IDs
  const globalStationIds = useMemo(
    () => getFilteredStationIds(selectedRegionId || undefined, selectedBranchId || undefined, selectedStationId || undefined),
    [selectedRegionId, selectedBranchId, selectedStationId],
  );

  const isGlobalFilterActive = selectedRegionId || selectedBranchId || selectedStationId;

  const [activePeriod, setActivePeriod] = useState<TimePeriod>('monthly');

  // Compute average performance rating across all reviews
  const avgPerformanceRating = useMemo(() => {
    if (performanceReviews.length === 0) return 0;
    const sum = performanceReviews.reduce((acc, r) => acc + r.overallRating, 0);
    return sum / performanceReviews.length;
  }, []);

  // Total sales achievement % for the selected period
  const salesAchievement = useMemo(() => {
    const stationIdSet = isGlobalFilterActive ? new Set(globalStationIds) : null;
    const filtered = salesTargets.filter((t) => {
      if (t.period !== activePeriod) return false;
      if (stationIdSet && !stationIdSet.has(t.stationId)) return false;
      return true;
    });
    if (filtered.length === 0) return 0;
    const totalTarget = filtered.reduce((acc, t) => acc + t.targetAmount, 0);
    const totalActual = filtered.reduce((acc, t) => acc + t.actualAmount, 0);
    if (totalTarget === 0) return 0;
    return Math.round((totalActual / totalTarget) * 100);
  }, [activePeriod, isGlobalFilterActive, globalStationIds]);

  // Training compliance %
  const trainingCompliance = useMemo(() => {
    if (trainingAssignments.length === 0) return 0;
    const completed = trainingAssignments.filter((a) => a.status === 'completed').length;
    return Math.round((completed / trainingAssignments.length) * 100);
  }, []);

  // Active reviews count (most recent period)
  const activeReviewsCount = useMemo(() => {
    const periods = [...new Set(performanceReviews.map((r) => r.reviewPeriod))];
    const latestPeriod = periods.sort().pop();
    return performanceReviews.filter((r) => r.reviewPeriod === latestPeriod).length;
  }, []);

  // Top performers: aggregate per employee using latest review + sales data for the active period
  const topPerformers = useMemo(() => {
    // Get the latest review per employee
    const latestReviewMap = new Map<string, typeof performanceReviews[0]>();
    for (const review of performanceReviews) {
      const existing = latestReviewMap.get(review.employeeId);
      if (!existing || review.date > existing.date) {
        latestReviewMap.set(review.employeeId, review);
      }
    }

    // Get sales achievement per employee for active period, filtered by global station filter
    const salesByEmployee = new Map<string, { target: number; actual: number }>();
    const stationIdSet = isGlobalFilterActive ? new Set(globalStationIds) : null;
    const filteredSales = salesTargets.filter((t) => {
      if (t.period !== activePeriod) return false;
      if (stationIdSet && !stationIdSet.has(t.stationId)) return false;
      return true;
    });

    for (const sale of filteredSales) {
      const existing = salesByEmployee.get(sale.employeeId) || { target: 0, actual: 0 };
      existing.target += sale.targetAmount;
      existing.actual += sale.actualAmount;
      salesByEmployee.set(sale.employeeId, existing);
    }

    // Build performers list
    const performers = Array.from(latestReviewMap.values())
      .filter((review) => {
        if (!isGlobalFilterActive) return true;
        // Include employees that have sales in the filtered stations
        return salesByEmployee.has(review.employeeId);
      })
      .map((review) => {
        const sales = salesByEmployee.get(review.employeeId);
        const salesPct = sales && sales.target > 0
          ? Math.round((sales.actual / sales.target) * 100)
          : null;

        return {
          employeeId: review.employeeId,
          employeeName: review.employeeName,
          overallRating: review.overallRating,
          salesPct,
          punctualityRating: review.punctualityRating,
        };
      })
      .sort((a, b) => b.overallRating - a.overallRating);

    return performers;
  }, [activePeriod, isGlobalFilterActive, globalStationIds]);

  if (!canViewKpi) {
    return (
      <div className="space-y-6">
        <PageHeader title="KPI Dashboard" description="Key performance indicators across sales, training, and employee reviews" />
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <Lock className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
          <p className="text-sm font-medium text-[var(--foreground)] mb-1">Access Restricted</p>
          <p className="text-xs text-[var(--muted-foreground)]">You don't have permission to view KPI data. Contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="KPI Dashboard"
        description="Key performance indicators across sales, training, and employee reviews"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Performance Rating"
          value={avgPerformanceRating.toFixed(1)}
          subtitle="out of 5.0"
          icon={BarChart3}
          delay={0}
        />
        <StatCard
          title="Sales Achievement"
          value={`${salesAchievement}%`}
          subtitle={activePeriod}
          icon={TrendingUp}
          delay={0.05}
        />
        <StatCard
          title="Training Compliance"
          value={`${trainingCompliance}%`}
          subtitle="modules completed"
          icon={GraduationCap}
          delay={0.1}
        />
        <StatCard
          title="Active Reviews"
          value={activeReviewsCount}
          subtitle="current period"
          icon={ClipboardCheck}
          delay={0.15}
        />
      </div>

      {/* Time Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="border-b border-[var(--border)]">
          <nav className="flex gap-6">
            {periodTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActivePeriod(tab.key)}
                className={cn(
                  'pb-3 text-sm font-medium border-b-2 transition-colors',
                  activePeriod === tab.key
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Top Performers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
              Top Performers
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                    Overall Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                    Sales %
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                    Punctuality
                  </th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                      No performance data available for selected filters
                    </td>
                  </tr>
                ) : (
                  topPerformers.map((performer) => (
                    <tr
                      key={performer.employeeId}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-[var(--foreground)]">
                            {performer.employeeName}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {performer.employeeId}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={performer.overallRating.toFixed(1)}
                          colorClass={getRatingBadgeColor(performer.overallRating)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {performer.salesPct !== null ? (
                          <span
                            className={cn(
                              'text-sm font-medium',
                              performer.salesPct >= 100
                                ? 'text-green-600 dark:text-green-400'
                                : performer.salesPct >= 70
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-red-600 dark:text-red-400'
                            )}
                          >
                            {performer.salesPct}%
                          </span>
                        ) : (
                          <span className="text-sm text-[var(--muted-foreground)]">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-sm font-medium', getRatingColor(performer.punctualityRating))}>
                          {performer.punctualityRating}/5
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
