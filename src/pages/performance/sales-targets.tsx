import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Target, TrendingUp, Award, Filter, Plus, X, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubmitApproval } from '@/lib/use-submit-approval';
import { usePermission } from '@/lib/rbac';
import { useAppStore } from '@/lib/store';
import { getFilteredStationIds } from '@/data/dashboard-data';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableWrapper } from '@/components/shared/table-wrapper';
import { salesTargets } from '@/data/sales-targets';
import { formatNaira } from '@/lib/formatters';

type Period = 'all' | 'daily' | 'weekly' | 'monthly';

const periodOptions: { key: Period; label: string }[] = [
  { key: 'all', label: 'All Periods' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

function getAchievementColor(pct: number): string {
  if (pct >= 100) return 'bg-green-500';
  if (pct >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

function getAchievementTextColor(pct: number): string {
  if (pct >= 100) return 'text-green-600 dark:text-green-400';
  if (pct >= 70) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

const PAGE_SIZE = 10;

export function SalesTargetsPage() {
  const canViewKpi = usePermission('view_kpi');
  const canManageEvaluations = usePermission('manage_evaluations');
  const submitApproval = useSubmitApproval();
  const { selectedRegionId, selectedBranchId, selectedStationId } = useAppStore();

  // Global filter: compute allowed station IDs
  const globalStationIds = useMemo(
    () => getFilteredStationIds(selectedRegionId || undefined, selectedBranchId || undefined, selectedStationId || undefined),
    [selectedRegionId, selectedBranchId, selectedStationId],
  );

  const isGlobalFilterActive = selectedRegionId || selectedBranchId || selectedStationId;

  const [periodFilter, setPeriodFilter] = useState<Period>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [formEmployee, setFormEmployee] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPeriod, setFormPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');

  // Unique products for filtering
  const uniqueProducts = useMemo(() => {
    return [...new Set(salesTargets.map((t) => t.product))].sort();
  }, []);

  // Unique employee names for the form
  const uniqueEmployees = useMemo(() => {
    return [...new Set(salesTargets.map((t) => t.employeeName))].sort();
  }, []);

  // Filtered targets
  const filteredTargets = useMemo(() => {
    setCurrentPage(1);
    let targets = [...salesTargets];
    // Apply global station filter
    if (isGlobalFilterActive) {
      const stationIdSet = new Set(globalStationIds);
      targets = targets.filter((t) => stationIdSet.has(t.stationId));
    }
    if (periodFilter !== 'all') {
      targets = targets.filter((t) => t.period === periodFilter);
    }
    if (productFilter !== 'all') {
      targets = targets.filter((t) => t.product === productFilter);
    }
    return targets;
  }, [periodFilter, productFilter, isGlobalFilterActive, globalStationIds]);

  const paginatedTargets = filteredTargets.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Summary stats
  const stats = useMemo(() => {
    const totalTarget = filteredTargets.reduce((acc, t) => acc + t.targetAmount, 0);
    const totalActual = filteredTargets.reduce((acc, t) => acc + t.actualAmount, 0);
    const overallPct = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;
    return { totalTarget, totalActual, overallPct };
  }, [filteredTargets]);

  if (!canViewKpi) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sales Targets" description="Track and manage employee sales targets across all stations" />
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <Lock className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
          <p className="text-sm font-medium text-[var(--foreground)] mb-1">Access Restricted</p>
          <p className="text-xs text-[var(--muted-foreground)]">You don't have permission to view sales targets. Contact your administrator.</p>
        </div>
      </div>
    );
  }

  const handleSetTarget = () => {
    if (!formEmployee || !formProduct || !formAmount || !formStartDate || !formEndDate) {
      toast.error('Missing fields', {
        description: 'Please fill in all required fields.',
      });
      return;
    }
    submitApproval({
      actionType: 'create_sales_target',
      actionLabel: 'Set Sales Target',
      payload: {
        employeeName: formEmployee,
        product: formProduct,
        targetAmount: Number(formAmount),
        period: formPeriod,
        startDate: formStartDate,
        endDate: formEndDate,
      },
      entityName: `${formEmployee} — ${formProduct}`,
    });
    setShowForm(false);
    setFormEmployee('');
    setFormProduct('');
    setFormAmount('');
    setFormStartDate('');
    setFormEndDate('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Targets"
        description="Track and manage employee sales targets across all stations"
        action={canManageEvaluations ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Set Target
          </button>
        ) : undefined}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Target"
          value={formatNaira(stats.totalTarget)}
          icon={Target}
          delay={0}
        />
        <StatCard
          title="Total Achieved"
          value={formatNaira(stats.totalActual)}
          icon={TrendingUp}
          delay={0.05}
        />
        <StatCard
          title="Overall Achievement"
          value={`${stats.overallPct}%`}
          subtitle={stats.overallPct >= 100 ? 'On track' : stats.overallPct >= 70 ? 'Needs attention' : 'Below target'}
          icon={Award}
          delay={0.1}
        />
      </div>

      {/* Set Target Form Panel */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Target className="h-4 w-4 text-[var(--primary)]" />
                Set New Sales Target
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1 hover:bg-[var(--secondary)] transition-colors"
              >
                <X className="h-4 w-4 text-[var(--muted-foreground)]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                  Employee
                </label>
                <select
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  value={formEmployee}
                  onChange={(e) => setFormEmployee(e.target.value)}
                >
                  <option value="">Select employee</option>
                  {uniqueEmployees.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                  Product
                </label>
                <select
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  value={formProduct}
                  onChange={(e) => setFormProduct(e.target.value)}
                >
                  <option value="">Select product</option>
                  {uniqueProducts.map((product) => (
                    <option key={product} value={product}>
                      {product}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                  Target Amount
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  placeholder="Enter target amount"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                  Period
                </label>
                <select
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  value={formPeriod}
                  onChange={(e) => setFormPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSetTarget}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
              >
                Create Target
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
              <span className="text-sm font-medium text-[var(--foreground)]">Filters</span>
            </div>
            <select
              className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as Period)}
            >
              {periodOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            >
              <option value="all">All Products</option>
              {uniqueProducts.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Sales Targets Table */}
      <TableWrapper
        title="Sales Targets"
        icon={<Target className="h-4 w-4 text-[var(--primary)]" />}
        totalItems={filteredTargets.length}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Employee
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Station
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Product
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Target
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Actual
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Achievement
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Period
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTargets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                  No sales targets found for the selected filters
                </td>
              </tr>
            ) : (
              paginatedTargets.map((target) => {
                const pct = target.targetAmount > 0
                  ? Math.round((target.actualAmount / target.targetAmount) * 100)
                  : 0;
                const barWidth = Math.min(pct, 100);

                return (
                  <tr
                    key={target.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {target.employeeName}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {target.employeeId}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                      {target.stationId}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                      {target.product}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)] text-right font-medium">
                      {formatNaira(target.targetAmount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)] text-right font-medium">
                      {formatNaira(target.actualAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-[var(--secondary)] overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', getAchievementColor(pct))}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className={cn('text-xs font-medium', getAchievementTextColor(pct))}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={target.period.charAt(0).toUpperCase() + target.period.slice(1)}
                        colorClass="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </TableWrapper>
    </div>
  );
}
