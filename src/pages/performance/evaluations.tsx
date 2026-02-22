import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, BarChart3, AlertTriangle, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermission } from '@/lib/rbac';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableWrapper } from '@/components/shared/table-wrapper';
import { performanceReviews } from '@/data/performance-reviews';

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

export function EvaluationsPage() {
  const canViewKpi = usePermission('view_kpi');
  const [currentPage, setCurrentPage] = useState(1);

  // Get the latest review per employee, then sort by overallRating descending
  const rankedEmployees = useMemo(() => {
    const latestReviewMap = new Map<string, typeof performanceReviews[0]>();
    for (const review of performanceReviews) {
      const existing = latestReviewMap.get(review.employeeId);
      if (!existing || review.date > existing.date) {
        latestReviewMap.set(review.employeeId, review);
      }
    }
    return Array.from(latestReviewMap.values()).sort(
      (a, b) => b.overallRating - a.overallRating
    );
  }, []);

  const paginatedEmployees = rankedEmployees.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Stats
  const topPerformer = rankedEmployees.length > 0 ? rankedEmployees[0] : null;

  const avgRating = useMemo(() => {
    if (rankedEmployees.length === 0) return 0;
    const sum = rankedEmployees.reduce((acc, r) => acc + r.overallRating, 0);
    return sum / rankedEmployees.length;
  }, [rankedEmployees]);

  const needsImprovementCount = useMemo(() => {
    return rankedEmployees.filter((r) => r.overallRating < 3).length;
  }, [rankedEmployees]);

  // Calculate the correct rank offset for the current page
  const rankOffset = (currentPage - 1) * PAGE_SIZE;

  if (!canViewKpi) {
    return (
      <div className="space-y-6">
        <PageHeader title="Employee Evaluations" description="Employee ranking based on overall performance ratings" />
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <Lock className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
          <p className="text-sm font-medium text-[var(--foreground)] mb-1">Access Restricted</p>
          <p className="text-xs text-[var(--muted-foreground)]">You don't have permission to view performance evaluations. Contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Evaluations"
        description="Employee ranking based on overall performance ratings"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Top Performer"
          value={topPerformer ? topPerformer.employeeName : '--'}
          subtitle={topPerformer ? `Rating: ${topPerformer.overallRating.toFixed(1)}/5` : ''}
          icon={Trophy}
          delay={0}
        />
        <StatCard
          title="Average Rating"
          value={avgRating.toFixed(1)}
          subtitle="across all employees"
          icon={BarChart3}
          delay={0.05}
        />
        <StatCard
          title="Needs Improvement"
          value={needsImprovementCount}
          subtitle="below 3.0 rating"
          icon={AlertTriangle}
          delay={0.1}
        />
      </div>

      {/* Ranking Table */}
      <TableWrapper
        title="Employee Rankings"
        icon={<Trophy className="h-4 w-4 text-[var(--primary)]" />}
        totalItems={rankedEmployees.length}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Employee
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
                Teamwork
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Training
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                  No evaluation data available
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((review, index) => {
                const rank = rankOffset + index + 1;
                return (
                  <tr
                    key={review.employeeId}
                    className={cn(
                      'border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors',
                      rank <= 3 && 'bg-[var(--primary)]/[0.02]'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {rank <= 3 ? (
                          <span
                            className={cn(
                              'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                              rank === 1 && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
                              rank === 2 && 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300',
                              rank === 3 && 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                            )}
                          >
                            {rank}
                          </span>
                        ) : (
                          <span className="text-sm text-[var(--muted-foreground)] w-6 text-center">
                            {rank}
                          </span>
                        )}
                      </div>
                    </td>
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
                      <span className={cn('text-sm font-medium', getRatingTextColor(review.teamworkRating))}>
                        {review.teamworkRating}/5
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-sm font-medium', getRatingTextColor(review.trainingRating))}>
                        {review.trainingRating}/5
                      </span>
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
