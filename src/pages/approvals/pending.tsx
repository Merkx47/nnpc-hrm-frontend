import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle, RotateCcw, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useApprovalStore } from '@/lib/approval-store';
import { getUserScope, isRequestInScope } from '@/lib/scope';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { ApprovalReviewModal } from '@/components/shared/approval-review-modal';
import { ExportDropdown } from '@/components/shared/export-dropdown';
import { ROLE_LABELS, APPROVAL_STATUS_COLORS, APPROVAL_ACTION_LABELS } from '@/lib/constants';
import type { ExportColumn } from '@/lib/export-utils';
import type { ApprovalRequest, ApprovalStatus } from '@/types';

const pendingExportColumns: ExportColumn[] = [
  { header: 'Request ID', accessor: 'id' },
  { header: 'Submitter', accessor: 'submittedByName' },
  { header: 'Role', accessor: 'submittedByRole', format: (v) => (ROLE_LABELS as Record<string, string>)[v as string] ?? String(v) },
  { header: 'Action', accessor: 'actionType', format: (v) => (APPROVAL_ACTION_LABELS as Record<string, string>)[v as string] ?? String(v) },
  { header: 'Submitted', accessor: 'submittedAt', format: (v) => new Date(v as string).toLocaleDateString('en-NG', { dateStyle: 'medium' }) },
  { header: 'Status', accessor: 'status' },
];

export function ApprovalsQueuePage() {
  const { currentUser } = useAppStore();
  const { requests, approveRequest, rejectRequest, returnRequest } = useApprovalStore();

  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalRequest, setModalRequest] = useState<ApprovalRequest | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'return'>('approve');

  const role = currentUser?.role;
  const userScope = useMemo(() => (currentUser ? getUserScope(currentUser) : null), [currentUser]);

  // All requests I can review
  const reviewable = useMemo(() => {
    if (!role || !userScope) return [];
    return requests.filter((r) =>
      r.reviewerRole === role && isRequestInScope(r.stationId, userScope)
    );
  }, [requests, role, userScope]);

  const pending = useMemo(() => reviewable.filter((r) => r.status === 'pending'), [reviewable]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const approvedToday = reviewable.filter((r) => r.status === 'approved' && r.updatedAt.startsWith(todayStr)).length;
  const rejectedToday = reviewable.filter((r) => r.status === 'rejected' && r.updatedAt.startsWith(todayStr)).length;
  const returnedToday = reviewable.filter((r) => r.status === 'returned' && r.updatedAt.startsWith(todayStr)).length;

  // Apply local filters
  const filtered = useMemo(() => {
    return pending.filter((r) => {
      if (typeFilter !== 'all' && r.actionType !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.submittedByName.toLowerCase().includes(q) && !r.actionLabel.toLowerCase().includes(q) && !r.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [pending, typeFilter, search]);

  const openModal = (req: ApprovalRequest, action: 'approve' | 'reject' | 'return') => {
    setModalRequest(req);
    setModalAction(action);
  };

  const handleConfirm = (note: string) => {
    if (!modalRequest || !currentUser) return;
    const me = currentUser;
    const id = modalRequest.id;
    const name = `${me.employee.firstName} ${me.employee.lastName}`;

    if (modalAction === 'approve') {
      approveRequest(id, me.employee.id, name, me.role, note);
      toast.success('Request approved');
    } else if (modalAction === 'reject') {
      rejectRequest(id, me.employee.id, name, me.role, note);
      toast.success('Request rejected');
    } else {
      returnRequest(id, me.employee.id, name, me.role, note);
      toast.success('Request returned for corrections');
    }
    setModalRequest(null);
  };

  // Get unique action types for filter
  const actionTypes = [...new Set(pending.map((r) => r.actionType))];

  return (
    <div className="space-y-6">
      <PageHeader title="Pending Review" description="Requests awaiting your approval" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Clock} title="Pending" value={pending.length} />
        <StatCard icon={CheckCircle} title="Approved Today" value={approvedToday} delay={0.05} />
        <StatCard icon={XCircle} title="Rejected Today" value={rejectedToday} delay={0.1} />
        <StatCard icon={RotateCcw} title="Returned Today" value={returnedToday} delay={0.15} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID…"
            className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-9 pr-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value="all">All Types</option>
          {actionTypes.map((t) => (
            <option key={t} value={t}>{APPROVAL_ACTION_LABELS[t]}</option>
          ))}
        </select>
        <ExportDropdown
          data={filtered as unknown as Record<string, unknown>[]}
          columns={pendingExportColumns}
          filename="pending-approvals"
        />
      </div>

      {/* Request Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p className="text-sm font-medium text-[var(--foreground)]">All caught up!</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">No pending requests to review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--foreground)]">{req.submittedByName}</span>
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium', APPROVAL_STATUS_COLORS.pending)}>
                      {APPROVAL_ACTION_LABELS[req.actionType]}
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">{req.id}</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {ROLE_LABELS[req.submittedByRole]} &middot; {new Date(req.submittedAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                    {req.notes.length > 0 && ` · "${req.notes[req.notes.length - 1].note.slice(0, 60)}${req.notes[req.notes.length - 1].note.length > 60 ? '…' : ''}"`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openModal(req, 'approve')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => openModal(req, 'return')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Return
                  </button>
                  <button
                    onClick={() => openModal(req, 'reject')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 dark:border-red-800 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalRequest && (
        <ApprovalReviewModal
          request={modalRequest}
          action={modalAction}
          isOpen={!!modalRequest}
          onClose={() => setModalRequest(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
