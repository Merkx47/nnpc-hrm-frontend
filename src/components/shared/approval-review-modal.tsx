import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApprovalRequest } from '@/types';
import { ROLE_LABELS, APPROVAL_ACTION_LABELS } from '@/lib/constants';
import { PayloadPreview } from '@/components/shared/payload-preview';
import { AuditTrail } from '@/components/shared/audit-trail';

interface Props {
  request: ApprovalRequest;
  action: 'approve' | 'reject' | 'return';
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

const CONFIG = {
  approve: {
    title: 'Approve Request',
    description: 'This action will approve the request and allow it to proceed.',
    buttonLabel: 'Approve',
    Icon: CheckCircle,
    color: 'bg-green-600 hover:bg-green-700 text-white',
    placeholder: 'Add a note explaining your approval…',
  },
  reject: {
    title: 'Reject Request',
    description: 'This action will permanently reject this request.',
    buttonLabel: 'Reject',
    Icon: XCircle,
    color: 'bg-red-600 hover:bg-red-700 text-white',
    placeholder: 'Explain why this request is being rejected…',
  },
  return: {
    title: 'Return for Corrections',
    description: 'This will send the request back to the submitter so they can fix and resubmit.',
    buttonLabel: 'Return',
    Icon: RotateCcw,
    color: 'bg-blue-600 hover:bg-blue-700 text-white',
    placeholder: 'Explain what needs to be corrected…',
  },
};

export function ApprovalReviewModal({ request, action, isOpen, onClose, onConfirm }: Props) {
  const [note, setNote] = useState('');
  const cfg = CONFIG[action];

  const handleConfirm = () => {
    if (!note.trim()) return;
    onConfirm(note.trim());
    setNote('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">{cfg.title}</h2>
                <p className="text-sm text-[var(--muted-foreground)]">{cfg.description}</p>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-[var(--secondary)] transition-colors">
                <X className="h-5 w-5 text-[var(--muted-foreground)]" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Request summary */}
              <div className="rounded-lg bg-[var(--secondary)] p-4 space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-[var(--foreground)]">{request.submittedByName}</span>
                  <span className="text-[var(--muted-foreground)]">({ROLE_LABELS[request.submittedByRole]})</span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {APPROVAL_ACTION_LABELS[request.actionType]} &middot; {request.id} &middot; {new Date(request.submittedAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                </p>
              </div>

              {/* Payload */}
              <div>
                <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">Submitted Data</h4>
                <div className="rounded-lg border border-[var(--border)] p-4">
                  <PayloadPreview actionType={request.actionType} payload={request.payload} />
                </div>
              </div>

              {/* Audit Trail */}
              {request.notes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">History</h4>
                  <div className="rounded-lg border border-[var(--border)] p-4">
                    <AuditTrail notes={request.notes} />
                  </div>
                </div>
              )}

              {/* Note input */}
              <div>
                <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">Your Note <span className="text-[var(--destructive)]">*</span></h4>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={cfg.placeholder}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-[var(--input)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!note.trim()}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                    cfg.color,
                  )}
                >
                  <cfg.Icon className="h-4 w-4" />
                  {cfg.buttonLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
