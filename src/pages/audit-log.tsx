import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Search, Filter, LogIn, ShieldCheck, Pencil, Trash2, Download, RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableWrapper } from '@/components/shared/table-wrapper';
import { ROLE_LABELS } from '@/lib/constants';
import { useAuditStore, type AuditAction, type AuditModule } from '@/lib/audit-store';
import type { ExportColumn } from '@/lib/export-utils';

const PAGE_SIZE = 15;

const inputClass =
  'w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]';

const ACTION_LABELS: Record<AuditAction, string> = {
  login: 'Login',
  logout: 'Logout',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  approve: 'Approve',
  reject: 'Reject',
  return: 'Return',
  export: 'Export',
};

const ACTION_COLORS: Record<AuditAction, string> = {
  login: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  logout: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300',
  create: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  update: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  approve: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  reject: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  return: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  export: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

const ACTION_ICONS: Record<AuditAction, typeof LogIn> = {
  login: LogIn,
  logout: LogIn,
  create: Pencil,
  update: Pencil,
  delete: Trash2,
  approve: ShieldCheck,
  reject: Trash2,
  return: RotateCcw,
  export: Download,
};

const MODULE_LABELS: Record<AuditModule, string> = {
  auth: 'Authentication',
  employees: 'Employees',
  shifts: 'Shifts',
  attendance: 'Attendance',
  incidents: 'Incidents',
  training: 'Training',
  performance: 'Performance',
  approvals: 'Approvals',
  compensation: 'Compensation',
  settings: 'Settings',
};

const exportColumns: ExportColumn[] = [
  { header: 'Timestamp', accessor: 'timestamp', format: (v) => new Date(v as string).toLocaleString('en-NG') },
  { header: 'User', accessor: 'userName' },
  { header: 'Role', accessor: 'userRole', format: (v) => ROLE_LABELS[v as keyof typeof ROLE_LABELS] ?? String(v) },
  { header: 'Action', accessor: 'action', format: (v) => ACTION_LABELS[v as AuditAction] ?? String(v) },
  { header: 'Module', accessor: 'module', format: (v) => MODULE_LABELS[v as AuditModule] ?? String(v) },
  { header: 'Description', accessor: 'description' },
  { header: 'Target', accessor: 'targetName', format: (v) => (v as string) ?? '-' },
  { header: 'IP Address', accessor: 'ipAddress', format: (v) => (v as string) ?? '-' },
];

export function AuditLogPage() {
  const { currentUser } = useAppStore();
  const entries = useAuditStore((s) => s.entries);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const uniqueUsers = useMemo(() => {
    const names = new Set(entries.map((e) => e.userName));
    return Array.from(names).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    setCurrentPage(1);
    return entries.filter((entry) => {
      if (startDate) {
        const entryDate = entry.timestamp.slice(0, 10);
        if (entryDate < startDate) return false;
      }
      if (endDate) {
        const entryDate = entry.timestamp.slice(0, 10);
        if (entryDate > endDate) return false;
      }
      if (actionFilter !== 'all' && entry.action !== actionFilter) return false;
      if (moduleFilter !== 'all' && entry.module !== moduleFilter) return false;
      if (userFilter !== 'all' && entry.userName !== userFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          entry.description.toLowerCase().includes(q) ||
          entry.userName.toLowerCase().includes(q) ||
          (entry.targetName?.toLowerCase().includes(q) ?? false) ||
          entry.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [entries, startDate, endDate, actionFilter, moduleFilter, userFilter, searchQuery]);

  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Stats
  const today = new Date().toISOString().slice(0, 10);
  const todayEntries = entries.filter((e) => e.timestamp.slice(0, 10) === today);
  const loginCount = todayEntries.filter((e) => e.action === 'login').length;
  const cudCount = todayEntries.filter((e) => ['create', 'update', 'delete'].includes(e.action)).length;
  const exportCount = todayEntries.filter((e) => e.action === 'export').length;

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setActionFilter('all');
    setModuleFilter('all');
    setUserFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Track all system activities, user actions, and data changes"
        action={
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-sm font-medium text-[var(--muted-foreground)]">
              {filtered.length} entries
            </span>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Entries" value={entries.length} icon={FileText} subtitle="all time" delay={0} />
        <StatCard title="Logins Today" value={loginCount} icon={LogIn} subtitle="today" delay={0.05} />
        <StatCard title="CUD Actions" value={cudCount} icon={Pencil} subtitle="today" delay={0.1} />
        <StatCard title="Exports" value={exportCount} icon={Download} subtitle="today" delay={0.15} />
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--primary)]" />
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Filters</h3>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Start Date</label>
              <input type="date" className={inputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">End Date</label>
              <input type="date" className={inputClass} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Action</label>
              <select className={inputClass} value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                <option value="all">All Actions</option>
                {(Object.keys(ACTION_LABELS) as AuditAction[]).map((a) => (
                  <option key={a} value={a}>{ACTION_LABELS[a]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Module</label>
              <select className={inputClass} value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
                <option value="all">All Modules</option>
                {(Object.keys(MODULE_LABELS) as AuditModule[]).map((m) => (
                  <option key={m} value={m}>{MODULE_LABELS[m]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">User</label>
              <select className={inputClass} value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                <option value="all">All Users</option>
                {uniqueUsers.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  className={cn(inputClass, 'pl-9')}
                  placeholder="Description, user, target..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <TableWrapper
        title="Audit Entries"
        icon={<FileText className="h-4 w-4 text-[var(--primary)]" />}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        exportConfig={{ data: filtered as unknown as Record<string, unknown>[], columns: exportColumns, filename: 'audit-log' }}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Module</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Target</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">IP</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
                  <p className="text-sm text-[var(--muted-foreground)]">No audit entries found</p>
                </td>
              </tr>
            ) : (
              paginated.map((entry) => {
                const ActionIcon = ACTION_ICONS[entry.action];
                return (
                  <tr
                    key={entry.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleString('en-NG', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{entry.userName}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{ROLE_LABELS[entry.userRole]}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <ActionIcon className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                        <StatusBadge
                          label={ACTION_LABELS[entry.action]}
                          colorClass={ACTION_COLORS[entry.action]}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                      {MODULE_LABELS[entry.module]}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)] max-w-[280px] truncate">
                      {entry.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] max-w-[180px] truncate">
                      {entry.targetName ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[var(--muted-foreground)]">
                      {entry.ipAddress ?? '-'}
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
