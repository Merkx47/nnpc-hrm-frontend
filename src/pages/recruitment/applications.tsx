import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  FileText, Users, UserCheck, UserX, Filter, Search, ChevronRight, XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermission } from '@/lib/rbac';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableWrapper } from '@/components/shared/table-wrapper';
import { applications } from '@/data/job-postings';
import { formatDate } from '@/lib/formatters';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from '@/lib/constants';
import type { ApplicationStatus } from '@/types';

const PIPELINE_STATUSES: ApplicationStatus[] = [
  'applied',
  'screening',
  'shortlisted',
  'interview',
  'offered',
  'onboarding',
];

function getNextStatus(current: ApplicationStatus): ApplicationStatus | null {
  const idx = PIPELINE_STATUSES.indexOf(current);
  if (idx === -1 || idx >= PIPELINE_STATUSES.length - 1) return null;
  return PIPELINE_STATUSES[idx + 1];
}

const PAGE_SIZE = 10;

export function ApplicationsPage() {
  const canAdvance = usePermission('advance_application');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, ApplicationStatus>>({});

  const getStatus = (app: typeof applications[number]) => statusOverrides[app.id] ?? app.status;

  const advanceApplication = (app: typeof applications[number]) => {
    const current = getStatus(app);
    const next = getNextStatus(current);
    if (!next) return;
    setStatusOverrides((prev) => ({ ...prev, [app.id]: next }));
    toast.success(`${app.applicantName} advanced`, {
      description: `Status changed from ${APPLICATION_STATUS_LABELS[current]} to ${APPLICATION_STATUS_LABELS[next]}.`,
    });
  };

  const rejectApplication = (app: typeof applications[number]) => {
    setStatusOverrides((prev) => ({ ...prev, [app.id]: 'rejected' as ApplicationStatus }));
    toast.success(`${app.applicantName} rejected`, {
      description: 'Application has been rejected.',
    });
  };

  const filtered = useMemo(() => {
    setCurrentPage(1);
    return applications.filter((a) => {
      const status = statusOverrides[a.id] ?? a.status;
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (
        searchQuery &&
        !a.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.positionTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [statusFilter, searchQuery, statusOverrides]);

  const paginatedApplications = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const total = applications.length;
  const inPipeline = applications.filter((a) =>
    PIPELINE_STATUSES.includes(statusOverrides[a.id] ?? a.status),
  ).length;
  const hired = applications.filter((a) => (statusOverrides[a.id] ?? a.status) === 'hired').length;
  const rejected = applications.filter((a) => (statusOverrides[a.id] ?? a.status) === 'rejected').length;

  const inputClass =
    'rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]';

  const allStatuses = useMemo(
    () => Array.from(new Set(applications.map((a) => a.status))),
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Review and manage candidate applications"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <FileText className="h-6 w-6 mx-auto mb-1 text-[var(--primary)]" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{total}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Total Applications</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{inPipeline}</p>
            <p className="text-xs text-[var(--muted-foreground)]">In Pipeline</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <UserCheck className="h-6 w-6 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{hired}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Hired</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <UserX className="h-6 w-6 mx-auto mb-1 text-red-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{rejected}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Rejected</p>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <TableWrapper
        title="Applications"
        icon={<FileText className="h-4 w-4 text-[var(--primary)]" />}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        toolbar={
          <>
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search applicant or position..."
                className={cn(inputClass, 'pl-9 w-full')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
              <select
                className={inputClass}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                {allStatuses.map((s) => (
                  <option key={s} value={s}>
                    {APPLICATION_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </>
        }
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Applicant Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Position
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Station
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Applied Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedApplications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
                  <p className="text-sm text-[var(--muted-foreground)]">
                    No applications match the selected filters
                  </p>
                </td>
              </tr>
            ) : (
              paginatedApplications.map((app) => {
                const status = getStatus(app);
                const next = getNextStatus(status);
                const isTerminal = status === 'rejected' || status === 'hired';
                return (
                  <tr
                    key={app.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {app.applicantName}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {app.applicantEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                      {app.positionTitle}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                      {app.stationName}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                      {formatDate(app.appliedDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={APPLICATION_STATUS_LABELS[status]}
                        colorClass={APPLICATION_STATUS_COLORS[status]}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!isTerminal && canAdvance && (
                        <div className="flex items-center justify-end gap-1.5">
                          {next && (
                            <button
                              onClick={() => advanceApplication(app)}
                              className="inline-flex items-center gap-1 rounded-md bg-[var(--primary)]/10 px-2 py-1 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
                              title={`Advance to ${APPLICATION_STATUS_LABELS[next]}`}
                            >
                              <ChevronRight className="h-3 w-3" />
                              {APPLICATION_STATUS_LABELS[next]}
                            </button>
                          )}
                          <button
                            onClick={() => rejectApplication(app)}
                            className="inline-flex items-center gap-1 rounded-md bg-red-100 dark:bg-red-900/20 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                            title="Reject application"
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </button>
                        </div>
                      )}
                      {!isTerminal && !canAdvance && (
                        <span className="text-xs text-[var(--muted-foreground)]">View only</span>
                      )}
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
