import { useMemo, useState, useEffect } from 'react';
import {
  Bell, Check, CheckCheck, Search, RefreshCw,
  TrendingDown, UserX, ClipboardX, GraduationCap, ShieldAlert,
  Calendar, Star, UserPlus,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/page-header';
import { NOTIFICATION_LABELS } from '@/lib/constants';
import { formatRelativeTime } from '@/lib/formatters';
import type { NotificationType, NotificationSeverity } from '@/types';

const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  underperformance: TrendingDown,
  absence: UserX,
  missing_log: ClipboardX,
  training_overdue: GraduationCap,
  certification_expiry: ShieldAlert,
  shift_assignment: Calendar,
  promotion_eligible: Star,
  new_application: UserPlus,
};

const TYPE_ICON_COLORS: Record<NotificationType, string> = {
  underperformance: 'text-red-500',
  absence: 'text-orange-500',
  missing_log: 'text-orange-500',
  training_overdue: 'text-amber-500',
  certification_expiry: 'text-amber-600',
  shift_assignment: 'text-blue-500',
  promotion_eligible: 'text-green-500',
  new_application: 'text-blue-600',
};

const SEVERITY_LEFT_COLORS: Record<NotificationSeverity, string> = {
  info: 'border-l-blue-400',
  warning: 'border-l-amber-400',
  error: 'border-l-red-400',
  success: 'border-l-green-400',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function getPageNumbers(current: number, total: number): (number | 'dots')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'dots')[] = [1];
  if (current > 3) pages.push('dots');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('dots');
  pages.push(total);
  return pages;
}

export function NotificationsPage() {
  const { notifications, setNotifications, markNotificationRead, markAllNotificationsRead } = useAppStore();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (typeFilter !== 'all' && n.type !== typeFilter) return false;
      if (readFilter === 'unread' && n.read) return false;
      if (readFilter === 'read' && !n.read) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      }
      return true;
    });
  }, [notifications, typeFilter, readFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, readFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const types = Object.keys(NOTIFICATION_LABELS) as NotificationType[];
  const pageNumbers = getPageNumbers(safePage, totalPages);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const mod = await import('@/data/notifications');
      setNotifications(mod.notifications);
    } catch { /* ignore */ }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        description={`${notifications.length} total \u00B7 ${unreadCount} unread`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-md border border-[var(--input)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full rounded-md border border-[var(--input)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <select
          className="rounded-md border border-[var(--input)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>{NOTIFICATION_LABELS[t]}</option>
          ))}
        </select>
        <div className="flex rounded-md border border-[var(--input)] overflow-hidden">
          {[
            { value: 'all', label: 'All' },
            { value: 'unread', label: 'Unread' },
            { value: 'read', label: 'Read' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setReadFilter(opt.value)}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                readFilter === opt.value
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-[var(--border)] p-12 text-center">
          <Bell className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">No notifications found</p>
        </div>
      ) : (
        <>
          <div className="border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
            {paginated.map((notif, i) => {
              const Icon = TYPE_ICONS[notif.type] || Bell;
              const iconColor = TYPE_ICON_COLORS[notif.type] || 'text-gray-500';
              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && markNotificationRead(notif.id)}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-l-[3px]',
                    i > 0 && 'border-t border-t-[var(--border)]',
                    !notif.read
                      ? cn(SEVERITY_LEFT_COLORS[notif.severity], 'bg-[var(--card)] hover:bg-[var(--secondary)]/50')
                      : 'border-l-transparent bg-[var(--card)] opacity-60 hover:opacity-80'
                  )}
                >
                  <div className={cn('mt-0.5 shrink-0', iconColor)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {!notif.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                      )}
                      <h3 className={cn(
                        'text-sm font-medium truncate',
                        notif.read ? 'text-[var(--muted-foreground)]' : 'text-[var(--foreground)]'
                      )}>
                        {notif.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mb-1">{notif.message}</p>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <span>{NOTIFICATION_LABELS[notif.type]}</span>
                      <span>&middot;</span>
                      <span>{formatRelativeTime(notif.createdAt)}</span>
                    </div>
                  </div>
                  {!notif.read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markNotificationRead(notif.id); }}
                      className="shrink-0 rounded-md p-1 hover:bg-[var(--secondary)] transition-colors mt-0.5"
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {filtered.length > pageSize && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                <span>
                  {(safePage - 1) * pageSize + 1}&ndash;{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="rounded-md border border-[var(--input)] bg-[var(--card)] px-2 py-1 text-sm text-[var(--foreground)] focus:outline-none"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size} / page</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(1)} disabled={safePage === 1} className={cn('rounded-md p-1.5 transition-colors', safePage === 1 ? 'text-[var(--muted-foreground)]/40 cursor-not-allowed' : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]')}><ChevronsLeft className="h-4 w-4" /></button>
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className={cn('rounded-md p-1.5 transition-colors', safePage === 1 ? 'text-[var(--muted-foreground)]/40 cursor-not-allowed' : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]')}><ChevronLeft className="h-4 w-4" /></button>
                {pageNumbers.map((page, idx) =>
                  page === 'dots' ? (
                    <span key={`dots-${idx}`} className="px-2 text-sm text-[var(--muted-foreground)]">...</span>
                  ) : (
                    <button key={page} onClick={() => setCurrentPage(page)} className={cn('h-8 w-8 rounded-md text-sm font-medium transition-colors', safePage === page ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]')}>{page}</button>
                  )
                )}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className={cn('rounded-md p-1.5 transition-colors', safePage === totalPages ? 'text-[var(--muted-foreground)]/40 cursor-not-allowed' : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]')}><ChevronRight className="h-4 w-4" /></button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages} className={cn('rounded-md p-1.5 transition-colors', safePage === totalPages ? 'text-[var(--muted-foreground)]/40 cursor-not-allowed' : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]')}><ChevronsRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
