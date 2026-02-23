import type { ApprovalNote } from '@/types';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const ACTION_COLORS: Record<string, string> = {
  submitted: 'bg-gray-400',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  returned: 'bg-blue-500',
  resubmitted: 'bg-amber-500',
};

export function AuditTrail({ notes }: { notes: ApprovalNote[] }) {
  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--border)]" />

      {notes.map((note, i) => (
        <div key={note.id} className="relative flex gap-3 pb-4 last:pb-0">
          {/* Dot */}
          <div className={cn('relative z-10 mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 border-[var(--card)]', ACTION_COLORS[note.action])} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-[var(--foreground)]">{note.authorName}</span>
              <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium', ROLE_COLORS[note.authorRole])}>
                {ROLE_LABELS[note.authorRole]}
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] capitalize">{note.action}</span>
            </div>
            <p className="text-sm text-[var(--foreground)] mt-1">{note.note}</p>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
              {new Date(note.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
            {i < notes.length - 1 && <div className="h-2" />}
          </div>
        </div>
      ))}
    </div>
  );
}
