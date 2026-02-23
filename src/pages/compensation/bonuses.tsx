import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Gift, Clock, Calendar, Filter, Search, Lock,
} from 'lucide-react';
import { NairaIcon } from '@/components/shared/naira-icon';
import { cn } from '@/lib/utils';
import { usePermission } from '@/lib/rbac';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableWrapper } from '@/components/shared/table-wrapper';
import { formatNaira } from '@/lib/formatters';
import type { ExportColumn } from '@/lib/export-utils';

const bonusExportColumns: ExportColumn[] = [
  { header: 'Employee', accessor: 'employeeName' },
  { header: 'Type', accessor: 'type' },
  { header: 'Amount (NGN)', accessor: 'amount', format: (v) => formatNaira(v as number) },
  { header: 'Month', accessor: 'month', format: (_, row) => `${row.month} ${row.year}` },
  { header: 'Status', accessor: 'status' },
];

type BonusType = 'Transport' | 'Housing' | 'Performance' | 'Overtime';
type BonusStatus = 'Paid' | 'Pending';

interface BonusRecord {
  id: string;
  employeeName: string;
  type: BonusType;
  amount: number;
  month: string;
  year: number;
  status: BonusStatus;
}

const bonusRecords: BonusRecord[] = [
  { id: 'BN-001', employeeName: 'Adebayo Okonkwo', type: 'Performance', amount: 15000, month: 'January', year: 2026, status: 'Paid' },
  { id: 'BN-002', employeeName: 'Oluwaseun Adeyinka', type: 'Performance', amount: 25000, month: 'January', year: 2026, status: 'Paid' },
  { id: 'BN-003', employeeName: 'Chinedu Eze', type: 'Transport', amount: 8000, month: 'January', year: 2026, status: 'Paid' },
  { id: 'BN-004', employeeName: 'Aminu Bello', type: 'Housing', amount: 18000, month: 'January', year: 2026, status: 'Paid' },
  { id: 'BN-005', employeeName: 'Grace Okafor', type: 'Overtime', amount: 12000, month: 'January', year: 2026, status: 'Paid' },
  { id: 'BN-006', employeeName: 'Folake Adeyemi', type: 'Performance', amount: 10000, month: 'February', year: 2026, status: 'Pending' },
  { id: 'BN-007', employeeName: 'Ibrahim Musa', type: 'Overtime', amount: 9500, month: 'February', year: 2026, status: 'Pending' },
  { id: 'BN-008', employeeName: 'Kemi Olawale', type: 'Transport', amount: 6000, month: 'February', year: 2026, status: 'Pending' },
  { id: 'BN-009', employeeName: 'Rukayat Adegoke', type: 'Performance', amount: 20000, month: 'February', year: 2026, status: 'Paid' },
  { id: 'BN-010', employeeName: 'Taiwo Salami', type: 'Housing', amount: 12000, month: 'February', year: 2026, status: 'Pending' },
  { id: 'BN-011', employeeName: 'Emeka Obi', type: 'Overtime', amount: 11000, month: 'January', year: 2026, status: 'Paid' },
  { id: 'BN-012', employeeName: 'Obinna Nwachukwu', type: 'Performance', amount: 14000, month: 'February', year: 2026, status: 'Pending' },
  { id: 'BN-013', employeeName: 'Adebayo Okonkwo', type: 'Overtime', amount: 8000, month: 'December', year: 2025, status: 'Paid' },
  { id: 'BN-014', employeeName: 'Oluwaseun Adeyinka', type: 'Performance', amount: 30000, month: 'December', year: 2025, status: 'Paid' },
  { id: 'BN-015', employeeName: 'Hauwa Danladi', type: 'Transport', amount: 5000, month: 'February', year: 2026, status: 'Pending' },
];

const STATUS_COLORS: Record<BonusStatus, string> = {
  Paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

const TYPE_COLORS: Record<BonusType, string> = {
  Transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Housing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  Performance: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  Overtime: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

const PAGE_SIZE = 10;

export function BonusesPage() {
  const canViewCompensation = usePermission('view_compensation');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    setCurrentPage(1);
    return bonusRecords.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (
        searchQuery &&
        !r.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [statusFilter, typeFilter, searchQuery]);

  const paginatedBonuses = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalPaid = bonusRecords
    .filter((r) => r.status === 'Paid')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalPending = bonusRecords
    .filter((r) => r.status === 'Pending')
    .reduce((sum, r) => sum + r.amount, 0);
  const thisMonth = bonusRecords
    .filter((r) => r.month === 'February' && r.year === 2026)
    .reduce((sum, r) => sum + r.amount, 0);

  const inputClass =
    'rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]';

  if (!canViewCompensation) {
    return (
      <div className="space-y-6">
        <PageHeader title="Bonuses & Allowances" description="Employee bonuses and extra compensation" />
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <Lock className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
          <p className="text-sm font-medium text-[var(--foreground)] mb-1">Access Restricted</p>
          <p className="text-xs text-[var(--muted-foreground)]">You don't have permission to view compensation records. Contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bonuses & Allowances"
        description="Track employee bonuses, allowances, and extra compensation"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <NairaIcon className="h-6 w-6 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{formatNaira(totalPaid)}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Total Bonuses Paid</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-1 text-amber-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{formatNaira(totalPending)}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Pending</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{formatNaira(thisMonth)}</p>
            <p className="text-xs text-[var(--muted-foreground)]">This Month</p>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <TableWrapper
        title="Bonuses & Allowances"
        icon={<Gift className="h-4 w-4 text-[var(--primary)]" />}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        exportConfig={{
          data: filtered as unknown as Record<string, unknown>[],
          columns: bonusExportColumns,
          filename: 'bonuses-allowances',
        }}
        toolbar={
          <>
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search employee..."
                className={cn(inputClass, 'pl-9 w-full')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
              <select
                className={inputClass}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="Transport">Transport</option>
                <option value="Housing">Housing</option>
                <option value="Performance">Performance</option>
                <option value="Overtime">Overtime</option>
              </select>
              <select
                className={inputClass}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </>
        }
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Employee
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Type
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Amount (NGN)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Month
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedBonuses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <Gift className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
                  <p className="text-sm text-[var(--muted-foreground)]">
                    No bonus records match the selected filters
                  </p>
                </td>
              </tr>
            ) : (
              paginatedBonuses.map((rec) => (
                <tr
                  key={rec.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">
                    {rec.employeeName}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={rec.type} colorClass={TYPE_COLORS[rec.type]} />
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-[var(--foreground)] font-mono">
                    {formatNaira(rec.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                    {rec.month} {rec.year}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={rec.status} colorClass={STATUS_COLORS[rec.status]} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrapper>
    </div>
  );
}
