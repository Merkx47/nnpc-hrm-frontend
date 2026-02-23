import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Search, Eye, ShieldCheck, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApprovalStore } from '@/lib/approval-store';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableWrapper } from '@/components/shared/table-wrapper';
import {
  ROLE_LABELS,
  APPROVAL_STATUS_LABELS,
  APPROVAL_STATUS_COLORS,
  APPROVAL_ACTION_LABELS,
} from '@/lib/constants';
import { formatDate } from '@/lib/formatters';
import type { ApprovalStatus } from '@/types';

const PAGE_SIZE = 15;

export function AllRequestsPage() {
  const [, setLocation] = useLocation();
  const { requests } = useApprovalStore();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Stats
  const totalPending = requests.filter((r) => r.status === 'pending').length;
  const totalApproved = requests.filter((r) => r.status === 'approved').length;
  const totalRejected = requests.filter((r) => r.status === 'rejected').length;
  const totalReturned = requests.filter((r) => r.status === 'returned').length;

  // Unique action types for filter
  const actionTypes = useMemo(() => [...new Set(requests.map((r) => r.actionType))], [requests]);

  // Filter
  const filtered = useMemo(() => {
    setCurrentPage(1);
    return requests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (typeFilter !== 'all' && r.actionType !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.submittedByName.toLowerCase().includes(q) &&
          !r.actionLabel.toLowerCase().includes(q) &&
          !r.id.toLowerCase().includes(q) &&
          !ROLE_LABELS[r.submittedByRole].toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [requests, statusFilter, typeFilter, search]);

  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Requests"
        description="System-wide view of all approval requests across every role and station"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Clock} title="Pending" value={totalPending} />
        <StatCard icon={CheckCircle} title="Approved" value={totalApproved} delay={0.05} />
        <StatCard icon={XCircle} title="Rejected" value={totalRejected} delay={0.1} />
        <StatCard icon={RotateCcw} title="Returned" value={totalReturned} delay={0.15} />
      </div>

      {/* Table */}
      <TableWrapper
        title="Request Log"
        icon={<ShieldCheck className="h-4 w-4 text-[var(--primary)]" />}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        toolbar={
          <>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, ID…"
                className="rounded-lg border border-[var(--input)] bg-[var(--background)] pl-8 pr-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] w-48"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-2 py-1.5 text-sm text-[var(--foreground)] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="returned">Returned</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-2 py-1.5 text-sm text-[var(--foreground)] focus:outline-none"
            >
              <option value="all">All Types</option>
              {actionTypes.map((t) => (
                <option key={t} value={t}>{APPROVAL_ACTION_LABELS[t]}</option>
              ))}
            </select>
          </>
        }
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Submitter</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Reviewer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase sr-only">View</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
                  <p className="text-sm text-[var(--muted-foreground)]">No requests found</p>
                </td>
              </tr>
            ) : (
              paginated.map((req, i) => (
                <motion.tr
                  key={req.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]/50 transition-colors cursor-pointer"
                  onClick={() => setLocation(`/approvals/${req.id}`)}
                >
                  <td className="px-4 py-3 text-sm font-mono text-[var(--muted-foreground)]">{req.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">{req.submittedByName}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[var(--muted-foreground)]">{ROLE_LABELS[req.submittedByRole]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium', APPROVAL_STATUS_COLORS.pending)}>
                      {APPROVAL_ACTION_LABELS[req.actionType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                    {req.reviewerName ?? ROLE_LABELS[req.reviewerRole]}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={APPROVAL_STATUS_LABELS[req.status]}
                      colorClass={APPROVAL_STATUS_COLORS[req.status]}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{formatDate(req.submittedAt)}</td>
                  <td className="px-4 py-3">
                    <Eye className="h-4 w-4 text-[var(--muted-foreground)]" />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrapper>
    </div>
  );
}
