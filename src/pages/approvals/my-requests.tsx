import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle, RotateCcw, Search, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useApprovalStore } from '@/lib/approval-store';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { ExportDropdown } from '@/components/shared/export-dropdown';
import { ROLE_LABELS, APPROVAL_STATUS_LABELS, APPROVAL_STATUS_COLORS, APPROVAL_ACTION_LABELS } from '@/lib/constants';
import type { ExportColumn } from '@/lib/export-utils';
import type { ApprovalStatus } from '@/types';

const myRequestsExportColumns: ExportColumn[] = [
  { header: 'Request ID', accessor: 'id' },
  { header: 'Action', accessor: 'actionLabel' },
  { header: 'Status', accessor: 'status', format: (v) => (APPROVAL_STATUS_LABELS as Record<string, string>)[v as string] ?? String(v) },
  { header: 'Reviewer Role', accessor: 'reviewerRole', format: (v) => (ROLE_LABELS as Record<string, string>)[v as string] ?? String(v) },
  { header: 'Reviewer', accessor: 'reviewerName', format: (v) => (v as string) ?? '—' },
  { header: 'Submitted', accessor: 'submittedAt', format: (v) => new Date(v as string).toLocaleDateString('en-NG', { dateStyle: 'medium' }) },
];

export function MyRequestsPage() {
  const { currentUser } = useAppStore();
  const { requests, resubmitRequest } = useApprovalStore();
  const [, setLocation] = useLocation();

  const [statusFilter, setStatusFilter] = useState<'all' | ApprovalStatus>('all');
  const [search, setSearch] = useState('');
  const [resubmitId, setResubmitId] = useState<string | null>(null);
  const [resubmitNote, setResubmitNote] = useState('');

  const myRequests = useMemo(() => {
    if (!currentUser) return [];
    return requests.filter((r) => r.submittedById === currentUser.employee.id);
  }, [requests, currentUser]);

  const counts = useMemo(() => ({
    total: myRequests.length,
    pending: myRequests.filter((r) => r.status === 'pending').length,
    approved: myRequests.filter((r) => r.status === 'approved').length,
    rejected: myRequests.filter((r) => r.status === 'rejected').length,
    returned: myRequests.filter((r) => r.status === 'returned').length,
  }), [myRequests]);

  const filtered = useMemo(() => {
    return myRequests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.actionLabel.toLowerCase().includes(q) && !r.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [myRequests, statusFilter, search]);

  const handleResubmit = (requestId: string) => {
    if (!currentUser || !resubmitNote.trim()) return;
    const name = `${currentUser.employee.firstName} ${currentUser.employee.lastName}`;
    resubmitRequest(requestId, currentUser.employee.id, name, currentUser.role, resubmitNote.trim());
    toast.success('Request resubmitted for review');
    setResubmitId(null);
    setResubmitNote('');
  };

  const STATUS_TABS: { key: 'all' | ApprovalStatus; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.total },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'approved', label: 'Approved', count: counts.approved },
    { key: 'rejected', label: 'Rejected', count: counts.rejected },
    { key: 'returned', label: 'Returned', count: counts.returned },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="My Requests" description="Track all your submitted requests" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Send} title="Total Submitted" value={counts.total} />
        <StatCard icon={Clock} title="Pending" value={counts.pending} delay={0.05} />
        <StatCard icon={CheckCircle} title="Approved" value={counts.approved} delay={0.1} />
        <StatCard icon={RotateCcw} title="Returned" value={counts.returned} delay={0.15} />
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
              statusFilter === tab.key
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests…"
            className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-9 pr-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <ExportDropdown
          data={filtered as unknown as Record<string, unknown>[]}
          columns={myRequestsExportColumns}
          filename="my-requests"
        />
      </div>

      {/* Request List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center">
          <Send className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
          <p className="text-sm font-medium text-[var(--foreground)]">No requests found</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            {statusFilter === 'all' ? "You haven't submitted any requests yet." : `No ${statusFilter} requests.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 cursor-pointer hover:border-[var(--primary)]/30 transition-colors"
              onClick={() => setLocation(`/approvals/${req.id}`)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--foreground)]">{req.actionLabel}</span>
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium', APPROVAL_STATUS_COLORS[req.status])}>
                      {APPROVAL_STATUS_LABELS[req.status]}
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">{req.id}</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Submitted {new Date(req.submittedAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })} &middot; Reviewer: {ROLE_LABELS[req.reviewerRole]}
                    {req.reviewerName && ` (${req.reviewerName})`}
                  </p>
                  {/* Show last note for returned/rejected */}
                  {(req.status === 'returned' || req.status === 'rejected') && req.notes.length > 1 && (
                    <p className="text-xs text-[var(--foreground)] bg-[var(--secondary)] rounded px-2 py-1 mt-1">
                      <strong>{req.notes[req.notes.length - 1].authorName}:</strong> {req.notes[req.notes.length - 1].note}
                    </p>
                  )}
                </div>

                {/* Resubmit button for returned requests */}
                {req.status === 'returned' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setResubmitId(resubmitId === req.id ? null : req.id); setResubmitNote(''); }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" /> Resubmit
                  </button>
                )}
              </div>

              {/* Resubmit form (inline) */}
              {resubmitId === req.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 pt-3 border-t border-[var(--border)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <textarea
                    value={resubmitNote}
                    onChange={(e) => setResubmitNote(e.target.value)}
                    placeholder="Add a note about the corrections made…"
                    rows={2}
                    className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => { setResubmitId(null); setResubmitNote(''); }}
                      className="px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleResubmit(req.id)}
                      disabled={!resubmitNote.trim()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      <Send className="h-3.5 w-3.5" /> Submit
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
