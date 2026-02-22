import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Activity, Search, Filter, LogIn, LogOut, Clock, TrendingUp,
} from 'lucide-react';
import { NairaIcon } from '@/components/shared/naira-icon';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableWrapper } from '@/components/shared/table-wrapper';
import { formatDate, formatNaira } from '@/lib/formatters';
import { SHIFT_LABELS, SHIFT_COLORS } from '@/lib/constants';
import { shifts } from '@/data/shifts';
import { stations } from '@/data/stations';

const PAGE_SIZE = 10;

const inputClass =
  'w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]';

export function ActivityLogPage() {
  const { currentUser } = useAppStore();
  const isAttendant = currentUser?.role === 'attendant';

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stationFilter, setStationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredShifts = useMemo(() => {
    return shifts.filter((entry) => {
      // Attendants only see their own shifts
      if (isAttendant && currentUser && entry.employeeId !== currentUser.employee.id) return false;

      // Date range filter
      if (startDate && entry.date < startDate) return false;
      if (endDate && entry.date > endDate) return false;

      // Station filter
      if (stationFilter !== 'all' && entry.stationId !== stationFilter) return false;

      // Employee search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = entry.employeeName.toLowerCase().includes(query);
        const matchesId = entry.employeeId.toLowerCase().includes(query);
        if (!matchesName && !matchesId) return false;
      }

      return true;
    });
  }, [startDate, endDate, stationFilter, searchQuery]);

  const paginatedShifts = filteredShifts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Summary calculations
  const totalSales = useMemo(
    () => filteredShifts.reduce((sum, s) => sum + s.salesFigure, 0),
    [filteredShifts],
  );

  const totalHours = useMemo(
    () => filteredShifts.reduce((sum, s) => sum + s.hoursWorked, 0),
    [filteredShifts],
  );

  const averageHours = useMemo(
    () => (filteredShifts.length > 0 ? totalHours / filteredShifts.length : 0),
    [filteredShifts, totalHours],
  );

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    setCurrentPage(1);
  };

  const handleStationFilterChange = (value: string) => {
    setStationFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCheckIn = (employeeName: string) => {
    toast.success('Check In Recorded', {
      description: `${employeeName} has been checked in successfully.`,
    });
  };

  const handleCheckOut = (employeeName: string) => {
    toast.success('Check Out Recorded', {
      description: `${employeeName} has been checked out successfully.`,
    });
  };

  const getStationName = (stationId: string) => {
    const station = stations.find((s) => s.id === stationId);
    return station?.name ?? stationId;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Daily activity logs for fuel station operations"
        action={
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-sm font-medium text-[var(--muted-foreground)]">
              {filteredShifts.length} entries
            </span>
          </div>
        }
      />

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-[var(--primary)]" />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Filters</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                className={inputClass}
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                End Date
              </label>
              <input
                type="date"
                className={inputClass}
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                Station
              </label>
              <select
                className={inputClass}
                value={stationFilter}
                onChange={(e) => handleStationFilterChange(e.target.value)}
              >
                <option value="all">All Stations</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                Search Employee
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  className={cn(inputClass, 'pl-9')}
                  placeholder="Name or ID..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Sales"
          value={formatNaira(totalSales)}
          icon={NairaIcon}
          subtitle="from filtered entries"
          delay={0.05}
        />
        <StatCard
          title="Total Hours"
          value={totalHours.toFixed(1)}
          icon={Clock}
          subtitle="hours worked"
          delay={0.1}
        />
        <StatCard
          title="Average Hours"
          value={averageHours.toFixed(1)}
          icon={TrendingUp}
          subtitle="per shift entry"
          delay={0.15}
        />
      </div>

      {/* Activity Table */}
      <TableWrapper
        title="Activity Records"
        icon={<Activity className="h-4 w-4 text-[var(--primary)]" />}
        totalItems={filteredShifts.length}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Employee
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Shift
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Check In
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Check Out
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Pump
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Sales (₦)
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Hours
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Notes
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedShifts.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]"
                >
                  No activity logs found for the selected filters.
                </td>
              </tr>
            ) : (
              paginatedShifts.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] whitespace-nowrap">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {entry.employeeName}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {getStationName(entry.stationId)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={SHIFT_LABELS[entry.shift]}
                      colorClass={SHIFT_COLORS[entry.shift]}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground)] whitespace-nowrap">
                    {entry.checkInTime ?? '--:--'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground)] whitespace-nowrap">
                    {entry.checkOutTime ?? '--:--'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                    {entry.pumpAssignment}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)] text-right whitespace-nowrap">
                    {formatNaira(entry.salesFigure)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground)] text-right">
                    {entry.hoursWorked}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] max-w-[180px] truncate">
                    {entry.notes ?? '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleCheckIn(entry.employeeName)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[var(--primary)] px-2.5 py-1.5 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
                        title="Check In"
                      >
                        <LogIn className="h-3 w-3" />
                        In
                      </button>
                      <button
                        onClick={() => handleCheckOut(entry.employeeName)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--input)] bg-[var(--background)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                        title="Check Out"
                      >
                        <LogOut className="h-3 w-3" />
                        Out
                      </button>
                    </div>
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
