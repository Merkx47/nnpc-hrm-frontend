import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Receipt, TrendingUp, User, ChevronDown, Lock,
} from 'lucide-react';
import { usePermission } from '@/lib/rbac';
import { NairaIcon } from '@/components/shared/naira-icon';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { salaryRecords } from '@/data/salary-records';
import { formatNaira } from '@/lib/formatters';

export function PayHistoryPage() {
  const canViewCompensation = usePermission('view_compensation');
  const employees = useMemo(() => {
    const map = new Map<string, string>();
    salaryRecords.forEach((r) => map.set(r.employeeId, r.employeeName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, []);

  const [selectedEmployee, setSelectedEmployee] = useState<string>(
    employees[0]?.id ?? '',
  );

  const employeeRecords = useMemo(() => {
    if (!selectedEmployee) return [];
    return salaryRecords
      .filter((r) => r.employeeId === selectedEmployee)
      .sort((a, b) => {
        const monthOrder = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December',
        ];
        if (a.year !== b.year) return b.year - a.year;
        return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
      });
  }, [selectedEmployee]);

  const selectedName =
    employees.find((e) => e.id === selectedEmployee)?.name ?? '—';

  const avgMonthlyPay =
    employeeRecords.length > 0
      ? Math.round(
          employeeRecords.reduce((sum, r) => sum + r.netPay, 0) /
            employeeRecords.length,
        )
      : 0;

  const totalEarned = employeeRecords.reduce((sum, r) => sum + r.netPay, 0);

  const inputClass =
    'rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]';

  if (!canViewCompensation) {
    return (
      <div className="space-y-6">
        <PageHeader title="Pay History" description="View individual employee payment history over time" />
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
        title="Pay History"
        description="View individual employee payment history over time"
      />

      {/* Employee Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--muted-foreground)]" />
            <label className="text-sm font-medium text-[var(--foreground)]">
              Select Employee
            </label>
          </div>
          <select
            className={cn(inputClass, 'w-full sm:w-80')}
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.id})
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Summary Stats */}
      {selectedEmployee && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
              <User className="h-6 w-6 mx-auto mb-1 text-[var(--primary)]" />
              <p className="text-lg font-bold text-[var(--foreground)]">{selectedName}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {employeeRecords.length} pay record{employeeRecords.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-1 text-blue-500" />
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {formatNaira(avgMonthlyPay)}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">Average Monthly Pay</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
              <NairaIcon className="h-6 w-6 mx-auto mb-1 text-green-500" />
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {formatNaira(totalEarned)}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">Total Earned</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Pay History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Payment History for {selectedName}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                  Month/Year
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
              </tr>
            </thead>
            <tbody>
              {employeeRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Receipt className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
                    <p className="text-sm text-[var(--muted-foreground)]">
                      No pay records found for this employee
                    </p>
                  </td>
                </tr>
              ) : (
                employeeRecords.map((rec) => {
                  const totalAllowances =
                    rec.transportAllowance + rec.housingAllowance + rec.otherAllowances;
                  return (
                    <tr
                      key={rec.id}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          {rec.month} {rec.year}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-[var(--foreground)] font-mono">
                        {formatNaira(rec.baseSalary)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-[var(--foreground)] font-mono">
                        {formatNaira(totalAllowances)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400 font-mono">
                        {rec.bonuses > 0 ? formatNaira(rec.bonuses) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400 font-mono">
                        {formatNaira(rec.deductions)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-[var(--foreground)] font-mono">
                        {formatNaira(rec.netPay)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Row */}
        {employeeRecords.length > 0 && (
          <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--secondary)]/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--foreground)]">
                Total ({employeeRecords.length} month{employeeRecords.length !== 1 ? 's' : ''})
              </span>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-[var(--muted-foreground)]">Total Base</p>
                  <p className="text-sm font-semibold text-[var(--foreground)] font-mono">
                    {formatNaira(employeeRecords.reduce((s, r) => s + r.baseSalary, 0))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--muted-foreground)]">Total Bonuses</p>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 font-mono">
                    {formatNaira(employeeRecords.reduce((s, r) => s + r.bonuses, 0))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--muted-foreground)]">Total Net Pay</p>
                  <p className="text-sm font-bold text-[var(--foreground)] font-mono">
                    {formatNaira(totalEarned)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
