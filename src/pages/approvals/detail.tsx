import { useState, useMemo } from 'react';
import { useRoute, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useApprovalStore } from '@/lib/approval-store';
import { PayloadPreview } from '@/components/shared/payload-preview';
import { AuditTrail } from '@/components/shared/audit-trail';
import { ApprovalReviewModal } from '@/components/shared/approval-review-modal';
import { ROLE_LABELS, APPROVAL_STATUS_LABELS, APPROVAL_STATUS_COLORS, APPROVAL_ACTION_LABELS } from '@/lib/constants';
import type { ApprovalRequest } from '@/types';

export function ApprovalDetailPage() {
  const [, params] = useRoute('/approvals/:id');
  const [, setLocation] = useLocation();
  const { currentUser } = useAppStore();
  const { requests, approveRequest, rejectRequest, returnRequest, resubmitRequest } = useApprovalStore();

  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'return' | null>(null);
  const [resubmitNote, setResubmitNote] = useState('');

  const request = useMemo(
    () => requests.find((r) => r.id === params?.id),
    [requests, params?.id]
  );

  if (!request) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setLocation('/approvals/my-requests')}
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center">
          <p className="text-sm font-medium text-[var(--foreground)]">Request not found</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">The request "{params?.id}" could not be found.</p>
        </div>
      </div>
    );
  }

  const isReviewer = currentUser?.role === request.reviewerRole && request.status === 'pending';
  const isSubmitter = currentUser?.employee.id === request.submittedById;
  const canResubmit = isSubmitter && request.status === 'returned';

  const handleConfirm = (note: string) => {
    if (!currentUser || !modalAction) return;
    const me = currentUser;
    const name = `${me.employee.firstName} ${me.employee.lastName}`;

    if (modalAction === 'approve') {
      approveRequest(request.id, me.employee.id, name, me.role, note);
      toast.success('Request approved');
    } else if (modalAction === 'reject') {
      rejectRequest(request.id, me.employee.id, name, me.role, note);
      toast.success('Request rejected');
    } else {
      returnRequest(request.id, me.employee.id, name, me.role, note);
      toast.success('Request returned for corrections');
    }
    setModalAction(null);
  };

  const handleResubmit = () => {
    if (!currentUser || !resubmitNote.trim()) return;
    const name = `${currentUser.employee.firstName} ${currentUser.employee.lastName}`;
    resubmitRequest(request.id, currentUser.employee.id, name, currentUser.role, resubmitNote.trim());
    toast.success('Request resubmitted for review');
    setResubmitNote('');
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => setLocation('/approvals/my-requests')}
        className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to My Requests
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-[var(--foreground)]">{request.actionLabel}</h1>
              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', APPROVAL_STATUS_COLORS[request.status])}>
                {APPROVAL_STATUS_LABELS[request.status]}
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {request.id} &middot; {APPROVAL_ACTION_LABELS[request.actionType]}
            </p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-[var(--muted-foreground)]">
              <span>Submitted by <strong className="text-[var(--foreground)]">{request.submittedByName}</strong> ({ROLE_LABELS[request.submittedByRole]})</span>
              <span>{new Date(request.submittedAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}</span>
              <span>Reviewer: {ROLE_LABELS[request.reviewerRole]}{request.reviewerName && ` (${request.reviewerName})`}</span>
            </div>
          </div>

          {/* Reviewer actions */}
          {isReviewer && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setModalAction('approve')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" /> Approve
              </button>
              <button
                onClick={() => setModalAction('return')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4" /> Return
              </button>
              <button
                onClick={() => setModalAction('reject')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 dark:border-red-800 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <XCircle className="h-4 w-4" /> Reject
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Payload */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
      >
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Submitted Data</h3>
        <PayloadPreview actionType={request.actionType} payload={request.payload} />
      </motion.div>

      {/* Audit Trail */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
      >
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Approval History</h3>
        {request.notes.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No history yet.</p>
        ) : (
          <AuditTrail notes={request.notes} />
        )}
      </motion.div>

      {/* Resubmit Form */}
      {canResubmit && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-6"
        >
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">Resubmit Request</h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">This request was returned for corrections. Add a note about the changes you've made and resubmit.</p>
          <textarea
            value={resubmitNote}
            onChange={(e) => setResubmitNote(e.target.value)}
            placeholder="Describe the corrections made…"
            rows={3}
            className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleResubmit}
              disabled={!resubmitNote.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-40"
            >
              <Send className="h-4 w-4" /> Resubmit
            </button>
          </div>
        </motion.div>
      )}

      {/* Review Modal */}
      {modalAction && (
        <ApprovalReviewModal
          request={request}
          action={modalAction}
          isOpen={!!modalAction}
          onClose={() => setModalAction(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
