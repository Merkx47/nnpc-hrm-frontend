import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Calendar, Sun, Moon, Sunset,
  Plus, ChevronLeft, ChevronRight, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useSubmitApproval } from '@/lib/use-submit-approval';
import { usePermission } from '@/lib/rbac';
import { getFilteredStationIds } from '@/data/dashboard-data';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { SHIFT_LABELS, SHIFT_COLORS } from '@/lib/constants';
import { shifts } from '@/data/shifts';
import { stations } from '@/data/stations';
import { employees } from '@/data/employees';
import type { ShiftType } from '@/types';

const SHIFT_ICONS: Record<ShiftType, typeof Sun> = {
  morning: Sun,
  afternoon: Sunset,
  night: Moon,
};

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Returns all calendar cells (days) for a given month grid.
 *  Each row is a week starting on Monday.
 *  Days outside the month are included but flagged. */
function getCalendarDays(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  // day-of-week: 0=Sun..6=Sat  ->  convert to Mon=0..Sun=6
  let startDow = firstOfMonth.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: { date: string; day: number; inMonth: boolean }[] = [];

  // Fill leading days from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, 1 - (i + 1));
    days.push({
      date: formatIso(d),
      day: d.getDate(),
      inMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= lastOfMonth.getDate(); d++) {
    const dt = new Date(year, month, d);
    days.push({
      date: formatIso(dt),
      day: d,
      inMonth: true,
    });
  }

  // Fill trailing days so we have complete weeks
  while (days.length % 7 !== 0) {
    const d = new Date(year, month + 1, days.length - (startDow + lastOfMonth.getDate()) + 1);
    days.push({
      date: formatIso(d),
      day: d.getDate(),
      inMonth: false,
    });
  }

  return days;
}

function formatIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function ShiftsPage() {
  const { selectedRegionId, selectedBranchId, selectedStationId, currentUser } = useAppStore();
  const canManageShifts = usePermission('manage_shifts');
  const submitApproval = useSubmitApproval();
  const isAttendant = currentUser?.role === 'attendant';

  // Global filter: compute allowed station IDs
  const globalStationIds = useMemo(
    () => getFilteredStationIds(selectedRegionId || undefined, selectedBranchId || undefined, selectedStationId || undefined),
    [selectedRegionId, selectedBranchId, selectedStationId],
  );

  const isGlobalFilterActive = selectedRegionId || selectedBranchId || selectedStationId;

  // Default to February 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(1); // 0-indexed: 1 = February
  const [showAssignForm, setShowAssignForm] = useState(false);

  // Assign form state
  const [assignEmployee, setAssignEmployee] = useState('');
  const [assignDate, setAssignDate] = useState('');
  const [assignShift, setAssignShift] = useState<string>('morning');
  const [assignStation, setAssignStation] = useState('');
  const [assignPump, setAssignPump] = useState('');

  const today = '2026-02-22';

  // Month navigation
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar grid days
  const calendarDays = useMemo(
    () => getCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  // Split into week rows
  const weeks = useMemo(() => {
    const rows: typeof calendarDays[] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      rows.push(calendarDays.slice(i, i + 7));
    }
    return rows;
  }, [calendarDays]);

  // Filter shifts for this month and global station filter
  // Attendants only see their own shifts
  const monthShifts = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const stationIdSet = isGlobalFilterActive ? new Set(globalStationIds) : null;
    return shifts.filter((s) => {
      if (!s.date.startsWith(monthPrefix)) return false;
      if (stationIdSet && !stationIdSet.has(s.stationId)) return false;
      if (isAttendant && s.employeeId !== currentUser?.employee.id) return false;
      return true;
    });
  }, [currentYear, currentMonth, isGlobalFilterActive, globalStationIds, isAttendant, currentUser]);

  // Build a lookup: date -> shifts[]
  const shiftsByDate = useMemo(() => {
    const map: Record<string, typeof shifts> = {};
    for (const s of monthShifts) {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    }
    return map;
  }, [monthShifts]);

  // Stats
  const totalShifts = monthShifts.length;
  const morningCount = monthShifts.filter((s) => s.shift === 'morning').length;
  const afternoonCount = monthShifts.filter((s) => s.shift === 'afternoon').length;
  const nightCount = monthShifts.filter((s) => s.shift === 'night').length;

  // Assign form handler
  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignEmployee || !assignDate || !assignStation || !assignPump) {
      toast.error('Please fill all fields');
      return;
    }
    const emp = employees.find((e) => e.id === assignEmployee);
    const stn = stations.find((s) => s.id === assignStation);
    submitApproval({
      actionType: 'create_shift',
      actionLabel: 'Assign Shift',
      stationId: assignStation,
      payload: {
        employeeId: assignEmployee,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : assignEmployee,
        date: assignDate,
        shift: assignShift,
        station: stn?.name ?? assignStation,
        pump: assignPump,
      },
      entityName: emp ? `${emp.firstName} ${emp.lastName}` : 'Employee',
    });
    setShowAssignForm(false);
    setAssignEmployee('');
    setAssignDate('');
    setAssignShift('morning');
    setAssignStation('');
    setAssignPump('');
  };

  const inputClass =
    'w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shift Management"
        description={isAttendant ? 'Your scheduled shifts for the month' : 'Calendar view of shift schedules across all stations'}
        action={canManageShifts ? (
          <button
            onClick={() => setShowAssignForm(!showAssignForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Assign Shift
          </button>
        ) : undefined}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Shifts This Month"
          value={totalShifts}
          subtitle={MONTH_NAMES[currentMonth]}
          icon={Calendar}
          delay={0}
        />
        <StatCard
          title="Morning Shifts"
          value={morningCount}
          subtitle="6AM - 2PM"
          icon={Sun}
          delay={0.1}
        />
        <StatCard
          title="Afternoon Shifts"
          value={afternoonCount}
          subtitle="2PM - 10PM"
          icon={Sunset}
          delay={0.2}
        />
        <StatCard
          title="Night Shifts"
          value={nightCount}
          subtitle="10PM - 6AM"
          icon={Moon}
          delay={0.3}
        />
      </div>

      {/* Assign Shift Form — only for users with manage_shifts */}
      {canManageShifts && showAssignForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 backdrop-blur-sm p-6"
        >
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
            Assign New Shift
          </h3>
          <form
            onSubmit={handleAssign}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4"
          >
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase mb-1">
                Employee
              </label>
              <select
                className={inputClass}
                value={assignEmployee}
                onChange={(e) => setAssignEmployee(e.target.value)}
              >
                <option value="">Select employee</option>
                {employees
                  .filter(
                    (e) =>
                      e.employmentStatus === 'active' &&
                      (e.role === 'attendant' || e.role === 'supervisor')
                  )
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase mb-1">
                Date
              </label>
              <input
                type="date"
                className={inputClass}
                value={assignDate}
                onChange={(e) => setAssignDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase mb-1">
                Shift Type
              </label>
              <select
                className={inputClass}
                value={assignShift}
                onChange={(e) => setAssignShift(e.target.value)}
              >
                <option value="morning">Morning (6AM - 2PM)</option>
                <option value="afternoon">Afternoon (2PM - 10PM)</option>
                <option value="night">Night (10PM - 6AM)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase mb-1">
                Station
              </label>
              <select
                className={inputClass}
                value={assignStation}
                onChange={(e) => setAssignStation(e.target.value)}
              >
                <option value="">Select station</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase mb-1">
                Pump
              </label>
              <input
                className={inputClass}
                value={assignPump}
                onChange={(e) => setAssignPump(e.target.value)}
                placeholder="e.g. Pump 1"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
              >
                Assign
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Calendar Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 backdrop-blur-sm overflow-hidden"
      >
        {/* Calendar Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-b border-[var(--border)]">
          {/* Month navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrevMonth}
              className="rounded-lg p-2 hover:bg-[var(--secondary)] transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4 text-[var(--foreground)]" />
            </button>
            <h3 className="text-base font-semibold text-[var(--foreground)] min-w-[180px] text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={goToNextMonth}
              className="rounded-lg p-2 hover:bg-[var(--secondary)] transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4 text-[var(--foreground)]" />
            </button>
          </div>

        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_HEADERS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-[var(--muted-foreground)] uppercase py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Week rows */}
          <div className="grid grid-cols-7 border-t border-l border-[var(--border)]">
            {weeks.map((week) =>
              week.map((cell) => {
                const dayShifts = shiftsByDate[cell.date] || [];
                const isToday = cell.date === today;

                return (
                  <div
                    key={cell.date}
                    className={cn(
                      'border-r border-b border-[var(--border)] min-h-[110px] p-1.5 transition-colors',
                      !cell.inMonth && 'bg-[var(--muted)]/30',
                      isToday && 'bg-[var(--primary)]/5 ring-1 ring-inset ring-[var(--primary)]/30'
                    )}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          'text-xs font-medium leading-none',
                          !cell.inMonth && 'text-[var(--muted-foreground)]/40',
                          cell.inMonth && 'text-[var(--foreground)]',
                          isToday &&
                            'bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold'
                        )}
                      >
                        {cell.day}
                      </span>
                      {dayShifts.length > 0 && cell.inMonth && (
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          {dayShifts.length}
                        </span>
                      )}
                    </div>

                    {/* Shift badges */}
                    <div className="space-y-0.5 overflow-hidden">
                      {dayShifts.slice(0, 3).map((s) => (
                        <div
                          key={s.id}
                          className={cn(
                            'rounded px-1 py-[1px] text-[10px] font-medium leading-tight truncate',
                            s.shift === 'morning' &&
                              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                            s.shift === 'afternoon' &&
                              'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
                            s.shift === 'night' &&
                              'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
                            !cell.inMonth && 'opacity-40'
                          )}
                          title={`${s.employeeName} - ${SHIFT_LABELS[s.shift]} - ${s.pumpAssignment}`}
                        >
                          {s.employeeName.split(' ')[0]}
                        </div>
                      ))}
                      {dayShifts.length > 3 && (
                        <div className="text-[10px] text-[var(--muted-foreground)] pl-1">
                          +{dayShifts.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/50 backdrop-blur-sm px-5 py-3"
      >
        <div className="flex flex-wrap items-center gap-5 text-xs text-[var(--muted-foreground)]">
          <span className="font-medium text-[var(--foreground)]">Legend:</span>
          {(['morning', 'afternoon', 'night'] as const).map((shift) => {
            const Icon = SHIFT_ICONS[shift];
            return (
              <span key={shift} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
                    SHIFT_COLORS[shift]
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {shift.charAt(0).toUpperCase() + shift.slice(1)}
                </span>
                <span>{SHIFT_LABELS[shift]}</span>
              </span>
            );
          })}
          <span className="flex items-center gap-1.5 ml-2">
            <span className="w-4 h-4 rounded-full bg-[var(--primary)]/20 ring-1 ring-[var(--primary)]/40 flex items-center justify-center text-[8px] font-bold text-[var(--primary)]">
              22
            </span>
            <span>Today</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
