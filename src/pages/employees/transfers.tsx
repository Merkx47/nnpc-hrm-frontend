import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeftRight, Send, Calendar, Filter, Search, X, Lock, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubmitApproval } from '@/lib/use-submit-approval';
import { useDataStore } from '@/lib/data-store';
import { usePermission } from '@/lib/rbac';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableWrapper } from '@/components/shared/table-wrapper';
import { formatDate } from '@/lib/formatters';
import { employees } from '@/data/employees';
import { stations } from '@/data/stations';
import type { ExportColumn } from '@/lib/export-utils';
import type { TransferStatus } from '@/types';

const PAGE_SIZE = 10;

const TRANSFER_STATUS_COLORS: Record<TransferStatus, string> = {
  requested: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

// Mock transfer history
const mockTransfers = [
  {
    id: 'TRF-001',
    employeeId: 'NRL-2025-000312',
    employeeName: 'Emeka Nwankwo',
    fromStationId: 'STN-003',
    fromStationName: 'NNPC Mega Station Ring Road',
    toStationId: 'STN-001',
    toStationName: 'NNPC Mega Station Ikoyi',
    reason: 'Closer to residence, requested by employee for personal reasons.',
    requestDate: '2026-02-10',
    effectiveDate: '2026-03-01',
    status: 'approved' as TransferStatus,
  },
  {
    id: 'TRF-002',
    employeeId: 'NRL-2024-000200',
    employeeName: 'Chinedu Eze',
    fromStationId: 'STN-001',
    fromStationName: 'NNPC Mega Station Ikoyi',
    toStationId: 'STN-005',
    toStationName: 'NNPC Retail Station Aba Road',
    reason: 'Operational need — understaffed station requires experienced personnel.',
    requestDate: '2026-01-28',
    effectiveDate: '2026-02-15',
    status: 'completed' as TransferStatus,
  },
  {
    id: 'TRF-003',
    employeeId: 'NRL-2025-000275',
    employeeName: 'Folake Adeyemi',
    fromStationId: 'STN-002',
    fromStationName: 'NNPC Retail Outlet Wuse',
    toStationId: 'STN-006',
    toStationName: 'NNPC Mega Station Maitama',
    reason: 'Performance-based promotion to a higher-traffic station.',
    requestDate: '2026-02-18',
    effectiveDate: '2026-03-10',
    status: 'requested' as TransferStatus,
  },
  {
    id: 'TRF-004',
    employeeId: 'NRL-2025-000340',
    employeeName: 'Ibrahim Danladi',
    fromStationId: 'STN-007',
    fromStationName: 'NNPC Retail Station Kano',
    toStationId: 'STN-002',
    toStationName: 'NNPC Retail Outlet Wuse',
    reason: 'Employee requested transfer to Abuja for family reasons.',
    requestDate: '2026-02-05',
    effectiveDate: '2026-02-20',
    status: 'rejected' as TransferStatus,
  },
  {
    id: 'TRF-005',
    employeeId: 'NRL-2024-000230',
    employeeName: 'Grace Okafor',
    fromStationId: 'STN-004',
    fromStationName: 'NNPC Retail Station Trans Amadi',
    toStationId: 'STN-005',
    toStationName: 'NNPC Retail Station Aba Road',
    reason: 'Rotation policy — standard 18-month station rotation.',
    requestDate: '2026-02-20',
    effectiveDate: '2026-04-01',
    status: 'requested' as TransferStatus,
  },
];

const inputClass = 'w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]';

export function TransfersPage() {
  const canApproveTransfer = usePermission('approve_transfer');
  const submitApproval = useSubmitApproval();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Transfer form state
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [toStation, setToStation] = useState('');
  const [reason, setReason] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  const selectedEmp = employees.find((e) => e.id === selectedEmployee);
  const fromStation = selectedEmp ? stations.find((s) => s.id === selectedEmp.stationId) : undefined;

  const addedTransfers = useDataStore((s) => s.addedTransfers);
  const deletedTransferIds = useDataStore((s) => s.deletedTransferIds);
  const allTransfers = useMemo(() => {
    const deletedSet = new Set(deletedTransferIds);
    return [...mockTransfers, ...addedTransfers].filter((t) => !deletedSet.has(t.id));
  }, [addedTransfers, deletedTransferIds]);

  const filteredTransfers = useMemo(() => {
    return allTransfers.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.employeeName.toLowerCase().includes(q) ||
          t.employeeId.toLowerCase().includes(q) ||
          t.fromStationName.toLowerCase().includes(q) ||
          t.toStationName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allTransfers, statusFilter, searchQuery]);

  const exportColumns: ExportColumn[] = [
    { header: 'Employee', accessor: 'employeeName' },
    { header: 'Employee ID', accessor: 'employeeId' },
    { header: 'From', accessor: 'fromStationName' },
    { header: 'To', accessor: 'toStationName' },
    { header: 'Effective Date', accessor: 'effectiveDate', format: (v) => formatDate(String(v)) },
    { header: 'Status', accessor: 'status' },
    { header: 'Reason', accessor: 'reason' },
  ];

  const paginatedTransfers = filteredTransfers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  if (!canApproveTransfer) {
    return (
      <div className="space-y-6">
        <PageHeader title="Employee Transfers" description="Initiate and manage employee transfers between stations" />
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <Lock className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
          <p className="text-sm font-medium text-[var(--foreground)] mb-1">Access Restricted</p>
          <p className="text-xs text-[var(--muted-foreground)]">You don't have permission to manage employee transfers. Contact your administrator.</p>
        </div>
      </div>
    );
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !toStation || !reason || !effectiveDate) {
      toast.error('Please fill all required fields');
      return;
    }
    const toStationObj = stations.find((s) => s.id === toStation);
    submitApproval({
      actionType: 'create_transfer',
      actionLabel: 'Employee Transfer',
      payload: {
        employeeId: selectedEmployee,
        employeeName: `${selectedEmp?.firstName} ${selectedEmp?.lastName}`,
        fromStationId: selectedEmp?.stationId,
        fromStationName: fromStation?.name ?? '',
        toStationId: toStation,
        toStationName: toStationObj?.name ?? toStation,
        reason,
        effectiveDate,
      },
      entityName: `${selectedEmp?.firstName} ${selectedEmp?.lastName}`,
    });
    setSelectedEmployee('');
    setToStation('');
    setReason('');
    setEffectiveDate('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Transfers"
        description="Initiate and manage employee transfers between stations"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Initiate Transfer Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-[var(--primary)]" />
              Initiate Transfer
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Employee <span className="text-[var(--destructive)]">*</span>
                </label>
                <select
                  className={inputClass}
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Select Employee</option>
                  {employees
                    .filter((e) => e.employmentStatus === 'active')
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} ({e.id})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  From Station
                </label>
                <input
                  className={cn(inputClass, 'bg-[var(--secondary)]')}
                  value={fromStation?.name ?? '—'}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  To Station <span className="text-[var(--destructive)]">*</span>
                </label>
                <select
                  className={inputClass}
                  value={toStation}
                  onChange={(e) => setToStation(e.target.value)}
                >
                  <option value="">Select Destination</option>
                  {stations
                    .filter((s) => s.id !== selectedEmp?.stationId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.city}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Effective Date <span className="text-[var(--destructive)]">*</span>
                </label>
                <input
                  type="date"
                  className={inputClass}
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Reason <span className="text-[var(--destructive)]">*</span>
                </label>
                <textarea
                  className={cn(inputClass, 'min-h-[80px]')}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for transfer..."
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
              >
                <Send className="h-4 w-4" />
                Submit Transfer Request
              </button>
            </form>
          </div>
        </motion.div>

        {/* Transfer History */}
        <div className="lg:col-span-2">
          <TableWrapper
            title="Transfer History"
            icon={<Calendar className="h-4 w-4 text-[var(--primary)]" />}
            totalItems={filteredTransfers.length}
            pageSize={PAGE_SIZE}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            exportConfig={{ data: filteredTransfers as unknown as Record<string, unknown>[], columns: exportColumns, filename: 'transfers' }}
            toolbar={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    placeholder="Search transfers..."
                    className="rounded-lg border border-[var(--input)] bg-[var(--background)] pl-8 pr-3 py-1 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] w-48"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                </div>
                <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
                <select
                  className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-sm text-[var(--foreground)] focus:outline-none"
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="requested">Requested</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            }
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">From</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Effective</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Reason</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                      No transfers found
                    </td>
                  </tr>
                ) : (
                  paginatedTransfers.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-[var(--foreground)]">{t.employeeName}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{t.employeeId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{t.fromStationName}</td>
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">{t.toStationName}</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{formatDate(t.effectiveDate)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge label={t.status} colorClass={TRANSFER_STATUS_COLORS[t.status]} className="capitalize" />
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] max-w-[200px] truncate">{t.reason}</td>
                      <td className="px-4 py-3 text-right">
                        {(t.status === 'requested' || t.status === 'approved') && (
                          <button
                            onClick={() => {
                              submitApproval({
                                actionType: 'delete_transfer',
                                actionLabel: 'Cancel Transfer',
                                payload: {
                                  targetId: t.id,
                                  targetName: `${t.employeeName} transfer to ${t.toStationName}`,
                                  reason: `Cancel transfer ${t.id}`,
                                },
                                entityName: t.employeeName,
                              });
                            }}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Cancel transfer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableWrapper>
        </div>
      </div>
    </div>
  );
}
