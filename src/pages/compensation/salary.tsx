import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, ArrowUpDown, Filter, Search, Lock,
} from 'lucide-react';
import { NairaIcon } from '@/components/shared/naira-icon';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { usePermission } from '@/lib/rbac';
import { getFilteredStationIds } from '@/data/dashboard-data';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableWrapper } from '@/components/shared/table-wrapper';
import { salaryRecords } from '@/data/salary-records';
import { employees } from '@/data/employees';
import { formatNaira } from '@/lib/formatters';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/constants';

const PAGE_SIZE = 10;

export function SalaryRecordsPage() {
  const canViewCompensation = usePermission('view_compensation');
  const { selectedRegionId, selectedBranchId, selectedStationId } = useAppStore();

  // Global filter: compute allowed station IDs
  const globalStationIds = useMemo(
    () => getFilteredStationIds(selectedRegionId || undefined, selectedBranchId || undefined, selectedStationId || undefined),
    [selectedRegionId, selectedBranchId, selectedStationId],
  );

  const isGlobalFilterActive = selectedRegionId || selectedBranchId || selectedStationId;

  // Build a lookup from employeeId -> stationId using the employees dataset
  const employeeStationMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const emp of employees) {
      map.set(emp.id, emp.stationId);
    }
    return map;
  }, []);

  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const months = useMemo(() => {
    const uniqueMonths = Array.from(
      new Set(salaryRecords.map((r) => `${r.month} ${r.year}`)),
    );
    return uniqueMonths;
  }, []);

  const filtered = useMemo(() => {
    setCurrentPage(1);
    return salaryRecords.filter((r) => {
      // Apply global station filter via employee -> station cross-reference
      if (isGlobalFilterActive) {
        const stationIdSet = new Set(globalStationIds);
        const empStation = employeeStationMap.get(r.employeeId);
        if (!empStation || !stationIdSet.has(empStation)) return false;
      }
      if (monthFilter !== 'all') {
        const monthYear = `${r.month} ${r.year}`;
        if (monthYear !== monthFilter) return false;
      }
      if (
        searchQuery &&
        !r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.stationName.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [monthFilter, searchQuery, isGlobalFilterActive, globalStationIds, employeeStationMap]);

  const paginatedRecords = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalPayroll = filtered.reduce((sum, r) => sum + r.netPay, 0);
  const avgPay =
    filtered.length > 0 ? Math.round(totalPayroll / filtered.length) : 0;
  const highestPay = filtered.length > 0 ? Math.max(...filtered.map((r) => r.netPay)) : 0;

  const inputClass =
    'rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]';

  if (!canViewCompensation) {
    return (
      <div className="space-y-6">
        <PageHeader title="Salary Records" description="Employee salary records and payroll" />
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
        title="Salary Records"
        description="View employee salary records, allowances, and deductions"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <NairaIcon className="h-6 w-6 mx-auto mb-1 text-[var(--primary)]" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{formatNaira(totalPayroll)}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Total Payroll</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{formatNaira(avgPay)}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Average Pay</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{formatNaira(highestPay)}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Highest Pay</p>
          </div>
        </motion.div>
      </div>

      {/* Table */}
      <TableWrapper
        title="Salary Records"
        icon={<NairaIcon className="h-4 w-4 text-[var(--primary)]" />}
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
                placeholder="Search employee or station..."
                className={cn(inputClass, 'pl-9 w-full')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
              <select
                className={inputClass}
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                <option value="all">All Months</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
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
                Employee
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Station
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Base (NGN)
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Allowances (NGN)
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Bonuses (NGN)
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Deductions (NGN)
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Net Pay (NGN)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Month/Year
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <NairaIcon className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
                  <p className="text-sm text-[var(--muted-foreground)]">
                    No salary records match the selected filters
                  </p>
                </td>
              </tr>
            ) : (
              paginatedRecords.map((rec) => {
                const totalAllowances =
                  rec.transportAllowance + rec.housingAllowance + rec.otherAllowances;
                return (
                  <tr
                    key={rec.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {rec.employeeName}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">{rec.employeeId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={ROLE_LABELS[rec.role]}
                        colorClass={ROLE_COLORS[rec.role]}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                      {rec.stationName}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-[var(--foreground)] font-mono">
                      {formatNaira(rec.baseSalary)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-[var(--foreground)] font-mono">
                      {formatNaira(totalAllowances)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400 font-mono">
                      {rec.bonuses > 0 ? formatNaira(rec.bonuses) : '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400 font-mono">
                      {formatNaira(rec.deductions)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-[var(--foreground)] font-mono">
                      {formatNaira(rec.netPay)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                      {rec.month} {rec.year}
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
