import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ClipboardCheck, Filter, Plus, X, Star, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubmitApproval } from '@/lib/use-submit-approval';
import { usePermission } from '@/lib/rbac';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableWrapper } from '@/components/shared/table-wrapper';
import { performanceReviews as staticReviews } from '@/data/performance-reviews';
import { useDataStore } from '@/lib/data-store';
import type { ExportColumn } from '@/lib/export-utils';
import { formatDate } from '@/lib/formatters';

function getRatingBadgeColor(rating: number): string {
  if (rating >= 4) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  if (rating >= 3) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
}

function getRatingTextColor(rating: number): string {
  if (rating >= 4) return 'text-green-600 dark:text-green-400';
  if (rating >= 3) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

const PAGE_SIZE = 10;

export function PerformanceReviewsPage() {
  const canViewKpi = usePermission('view_kpi');
  const canManageEvaluations = usePermission('manage_evaluations');
  const submitApproval = useSubmitApproval();
  const addedReviews = useDataStore((s) => s.addedReviews);
  const deletedReviewIds = useDataStore((s) => s.deletedReviewIds);
  const performanceReviews = useMemo(() => {
    const deletedSet = new Set(deletedReviewIds);
    return [...staticReviews, ...addedReviews].filter((r) => !deletedSet.has(r.id));
  }, [addedReviews, deletedReviewIds]);
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [formEmployee, setFormEmployee] = useState('');
  const [formPeriod, setFormPeriod] = useState('');
  const [formSales, setFormSales] = useState('');
  const [formPunctuality, setFormPunctuality] = useState('');
  const [formCustomerService, setFormCustomerService] = useState('');
  const [formTeamwork, setFormTeamwork] = useState('');
  const [formTraining, setFormTraining] = useState('');
  const [formComments, setFormComments] = useState('');

  // Unique review periods
  const uniquePeriods = useMemo(() => {
    return [...new Set(performanceReviews.map((r) => r.reviewPeriod))].sort().reverse();
  }, []);

  // Unique employee names for form
  const uniqueEmployees = useMemo(() => {
    return [...new Set(performanceReviews.map((r) => r.employeeName))].sort();
  }, []);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    setCurrentPage(1);
    let reviews = [...performanceReviews];
    if (periodFilter !== 'all') {
      reviews = reviews.filter((r) => r.reviewPeriod === periodFilter);
    }
    return reviews.sort((a, b) => b.date.localeCompare(a.date));
  }, [periodFilter]);

  const exportColumns: ExportColumn[] = [
    { header: 'Employee', accessor: 'employeeName' },
    { header: 'Employee ID', accessor: 'employeeId' },
    { header: 'Period', accessor: 'reviewPeriod' },
    { header: 'Overall', accessor: 'overallRating', format: (v) => Number(v).toFixed(1) },
    { header: 'Sales', accessor: 'salesRating', format: (v) => `${v}/5` },
    { header: 'Punctuality', accessor: 'punctualityRating', format: (v) => `${v}/5` },
    { header: 'Customer Service', accessor: 'customerServiceRating', format: (v) => `${v}/5` },
    { header: 'Reviewer', accessor: 'reviewerName' },
    { header: 'Date', accessor: 'date', format: (v) => formatDate(String(v)) },
  ];

  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Summary stats
  const stats = useMemo(() => {
    const total = filteredReviews.length;
    const avgRating = total > 0
      ? filteredReviews.reduce((acc, r) => acc + r.overallRating, 0) / total
      : 0;
    const excellent = filteredReviews.filter((r) => r.overallRating >= 4).length;
    const needsImprovement = filteredReviews.filter((r) => r.overallRating < 3).length;
    return { total, avgRating, excellent, needsImprovement };
  }, [filteredReviews]);

  if (!canViewKpi) {
    return (
      <div className="space-y-6">
        <PageHeader title="Performance Reviews" description="Employee performance evaluations and rating history" />
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <Lock className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
          <p className="text-sm font-medium text-[var(--foreground)] mb-1">Access Restricted</p>
          <p className="text-xs text-[var(--muted-foreground)]">You don't have permission to view performance reviews. Contact your administrator.</p>
        </div>
      </div>
    );
  }

  const handleNewReview = () => {
    if (!formEmployee || !formPeriod || !formSales || !formPunctuality || !formCustomerService || !formTeamwork || !formTraining) {
      toast.error('Missing fields', {
        description: 'Please fill in all required rating fields.',
      });
      return;
    }
    submitApproval({
      actionType: 'create_review',
      actionLabel: 'Performance Review',
      payload: {
        employeeName: formEmployee,
        period: formPeriod,
        sales: Number(formSales),
        punctuality: Number(formPunctuality),
        customerService: Number(formCustomerService),
        teamwork: Number(formTeamwork),
        training: Number(formTraining),
        comments: formComments,
      },
      entityName: formEmployee,
    });
    setShowForm(false);
    setFormEmployee('');
    setFormPeriod('');
    setFormSales('');
    setFormPunctuality('');
    setFormCustomerService('');
    setFormTeamwork('');
    setFormTraining('');
    setFormComments('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Reviews"
        description="Employee performance evaluations and rating history"
        action={canManageEvaluations ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            New Review
          </button>
        ) : undefined}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reviews"
          value={stats.total}
          icon={ClipboardCheck}
          delay={0}
        />
        <StatCard
          title="Average Rating"
          value={stats.avgRating.toFixed(1)}
          subtitle="out of 5.0"
          icon={Star}
          delay={0.05}
        />
        <StatCard
          title="Excellent (4+)"
          value={stats.excellent}
          icon={Star}
          delay={0.1}
        />
        <StatCard
          title="Needs Improvement"
          value={stats.needsImprovement}
          subtitle="below 3.0"
          icon={Star}
          delay={0.15}
        />
      </div>

      {/* New Review Form Panel */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-[var(--primary)]" />
                New Performance Review
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1 hover:bg-[var(--secondary)] transition-colors"
              >
                <X className="h-4 w-4 text-[var(--muted-foreground)]" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  Review Period
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  placeholder="e.g. Q1 2026"
                  value={formPeriod}
                  onChange={(e) => setFormPeriod(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                  Sales Rating (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  value={formSales}
                  onChange={(e) => setFormSales(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                  Punctuality Rating (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  value={formPunctuality}
                  onChange={(e) => setFormPunctuality(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                  Customer Service (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  value={formCustomerService}
                  onChange={(e) => setFormCustomerService(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                  Teamwork Rating (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  value={formTeamwork}
                  onChange={(e) => setFormTeamwork(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                  Training Rating (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  value={formTraining}
                  onChange={(e) => setFormTraining(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                  Comments
                </label>
                <textarea
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] min-h-[80px]"
                  placeholder="Enter review comments..."
                  value={formComments}
                  onChange={(e) => setFormComments(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleNewReview}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
              >
                Submit Review
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Period Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
              <span className="text-sm font-medium text-[var(--foreground)]">Period</span>
            </div>
            <select
              className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              <option value="all">All Periods</option>
              {uniquePeriods.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Reviews Table */}
      <TableWrapper
        title="Performance Reviews"
        icon={<ClipboardCheck className="h-4 w-4 text-[var(--primary)]" />}
        totalItems={filteredReviews.length}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        exportConfig={{ data: filteredReviews as unknown as Record<string, unknown>[], columns: exportColumns, filename: 'performance-reviews' }}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Employee
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Period
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Overall
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Sales
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Punctuality
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Customer Service
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Reviewer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedReviews.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                  No performance reviews found
                </td>
              </tr>
            ) : (
              paginatedReviews.map((review) => (
                <tr
                  key={review.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {review.employeeName}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {review.employeeId}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={review.reviewPeriod}
                      colorClass="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={review.overallRating.toFixed(1)}
                      colorClass={getRatingBadgeColor(review.overallRating)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-sm font-medium', getRatingTextColor(review.salesRating))}>
                      {review.salesRating}/5
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-sm font-medium', getRatingTextColor(review.punctualityRating))}>
                      {review.punctualityRating}/5
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-sm font-medium', getRatingTextColor(review.customerServiceRating))}>
                      {review.customerServiceRating}/5
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-[var(--foreground)]">{review.reviewerName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                    {formatDate(review.date)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrapper>
    </div>
  );
}
