import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  CalendarCheck, Clock, CheckCircle, XCircle, Calendar, Filter, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useSubmitApproval } from '@/lib/use-submit-approval';
import { getFilteredStationIds } from '@/data/dashboard-data';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableWrapper } from '@/components/shared/table-wrapper';
import { formatDate } from '@/lib/formatters';
import { attendanceRecords, leaveRequests } from '@/data/attendance';
import { employees } from '@/data/employees';

type Tab = 'attendance' | 'leave';

const PAGE_SIZE = 10;

const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
  present: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  late: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  absent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  on_leave: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  holiday: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

const LEAVE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  on_leave: 'On Leave',
  holiday: 'Holiday',
};

const tabs: { key: Tab; label: string }[] = [
  { key: 'attendance', label: 'Attendance Records' },
  { key: 'leave', label: 'Leave Requests' },
];

export function AttendancePage() {
  const { selectedRegionId, selectedBranchId, selectedStationId, currentUser } = useAppStore();
  const isAttendant = currentUser?.role === 'attendant';
  const submitApproval = useSubmitApproval();
  const [activeTab, setActiveTab] = useState<Tab>('attendance');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [attendancePage, setAttendancePage] = useState(1);
  const [leavePage, setLeavePage] = useState(1);

  // Global filter: compute allowed station IDs
  const globalStationIds = useMemo(
    () => getFilteredStationIds(selectedRegionId || undefined, selectedBranchId || undefined, selectedStationId || undefined),
    [selectedRegionId, selectedBranchId, selectedStationId],
  );

  // Build a lookup from employeeId -> stationId using the employees dataset
  const employeeStationMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const emp of employees) {
      map.set(emp.id, emp.stationId);
    }
    return map;
  }, []);

  const isGlobalFilterActive = selectedRegionId || selectedBranchId || selectedStationId;

  // Unique dates from attendance records for the date filter
  const uniqueDates = useMemo(() => {
    const dates = [...new Set(attendanceRecords.map((r) => r.date))];
    return dates.sort((a, b) => b.localeCompare(a));
  }, []);

  // Filtered attendance records — attendants only see their own
  const filteredAttendance = useMemo(() => {
    let records = [...attendanceRecords];
    if (isAttendant && currentUser) {
      records = records.filter((r) => r.employeeId === currentUser.employee.id);
    }
    if (dateFilter) {
      records = records.filter((r) => r.date === dateFilter);
    }
    // Apply global station filter via employee -> station cross-reference
    if (!isAttendant && isGlobalFilterActive) {
      const stationIdSet = new Set(globalStationIds);
      records = records.filter((r) => {
        const empStation = employeeStationMap.get(r.employeeId);
        return empStation ? stationIdSet.has(empStation) : false;
      });
    }
    return records;
  }, [dateFilter, globalStationIds, isGlobalFilterActive, employeeStationMap, isAttendant, currentUser]);

  const paginatedAttendance = filteredAttendance.slice(
    (attendancePage - 1) * PAGE_SIZE,
    attendancePage * PAGE_SIZE,
  );

  // Filtered leave requests — attendants only see their own
  const filteredLeave = useMemo(() => {
    if (isAttendant && currentUser) {
      return leaveRequests.filter((r) => r.employeeId === currentUser.employee.id);
    }
    if (!isGlobalFilterActive) return leaveRequests;
    const stationIdSet = new Set(globalStationIds);
    return leaveRequests.filter((r) => {
      const empStation = employeeStationMap.get(r.employeeId);
      return empStation ? stationIdSet.has(empStation) : false;
    });
  }, [isGlobalFilterActive, globalStationIds, employeeStationMap, isAttendant, currentUser]);

  const paginatedLeave = filteredLeave.slice(
    (leavePage - 1) * PAGE_SIZE,
    leavePage * PAGE_SIZE,
  );

  // Attendance stats
  const attendanceStats = useMemo(() => {
    const source = filteredAttendance;
    return {
      present: source.filter((r) => r.status === 'present').length,
      late: source.filter((r) => r.status === 'late').length,
      absent: source.filter((r) => r.status === 'absent').length,
      onLeave: source.filter((r) => r.status === 'on_leave').length,
    };
  }, [filteredAttendance]);

  // Leave stats
  const leaveStats = useMemo(() => ({
    pending: filteredLeave.filter((r) => r.status === 'pending').length,
    approved: filteredLeave.filter((r) => r.status === 'approved').length,
    rejected: filteredLeave.filter((r) => r.status === 'rejected').length,
  }), [filteredLeave]);

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    setAttendancePage(1);
  };

  const handleRequestLeave = () => {
    submitApproval({
      actionType: 'create_leave_request',
      actionLabel: 'Leave Request',
      payload: {
        type: 'personal',
        reason: 'Leave request submitted via attendance page',
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance & Leave"
        description="Track employee attendance and manage leave requests"
      />

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Present"
              value={attendanceStats.present}
              icon={CheckCircle}
              delay={0}
            />
            <StatCard
              title="Late"
              value={attendanceStats.late}
              icon={Clock}
              delay={0.05}
            />
            <StatCard
              title="Absent"
              value={attendanceStats.absent}
              icon={XCircle}
              delay={0.1}
            />
            <StatCard
              title="On Leave"
              value={attendanceStats.onLeave}
              icon={Calendar}
              delay={0.15}
            />
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <span className="text-sm font-medium text-[var(--foreground)]">Filters</span>
                </div>
                <select
                  className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  value={dateFilter}
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                >
                  <option value="">All Dates</option>
                  {uniqueDates.map((date) => (
                    <option key={date} value={date}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Attendance Table */}
          <TableWrapper
            title="Attendance Records"
            icon={<CalendarCheck className="h-4 w-4 text-[var(--primary)]" />}
            totalItems={filteredAttendance.length}
            pageSize={PAGE_SIZE}
            currentPage={attendancePage}
            onPageChange={setAttendancePage}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Check In</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Check Out</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  paginatedAttendance.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-[var(--foreground)]">{record.employeeName}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{record.employeeId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={ATTENDANCE_STATUS_LABELS[record.status] ?? record.status}
                          colorClass={ATTENDANCE_STATUS_COLORS[record.status] ?? ''}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                        {record.checkIn ?? '--'}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                        {record.checkOut ?? '--'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableWrapper>
        </div>
      )}

      {/* Leave Requests Tab */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Pending"
              value={leaveStats.pending}
              icon={Clock}
              delay={0}
            />
            <StatCard
              title="Approved"
              value={leaveStats.approved}
              icon={CheckCircle}
              delay={0.05}
            />
            <StatCard
              title="Rejected"
              value={leaveStats.rejected}
              icon={XCircle}
              delay={0.1}
            />
          </div>

          {/* Leave Requests Table */}
          <TableWrapper
            title="Leave Requests"
            icon={<CalendarCheck className="h-4 w-4 text-[var(--primary)]" />}
            totalItems={filteredLeave.length}
            pageSize={PAGE_SIZE}
            currentPage={leavePage}
            onPageChange={setLeavePage}
            toolbar={
              <button
                onClick={handleRequestLeave}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                Request Leave
              </button>
            }
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Start Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">End Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Days</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeave.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  paginatedLeave.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-[var(--foreground)]">{request.employeeName}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{request.employeeId}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--foreground)] capitalize">
                        {request.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                        {formatDate(request.startDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                        {formatDate(request.endDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                        {request.days}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] max-w-[200px] truncate">
                        {request.reason}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          colorClass={LEAVE_STATUS_COLORS[request.status] ?? ''}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableWrapper>
        </div>
      )}
    </div>
  );
}
