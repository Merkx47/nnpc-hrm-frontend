import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ClipboardList, Send, Search, CheckSquare, Square,
  Calendar, Users, BookOpen, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermission } from '@/lib/rbac';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableWrapper } from '@/components/shared/table-wrapper';
import { TRAINING_STATUS_COLORS } from '@/lib/constants';
import { formatDate } from '@/lib/formatters';
import { trainingModules, trainingAssignments } from '@/data/training-modules';
import { employees } from '@/data/employees';
import type { TrainingStatus } from '@/types';

const TRAINING_STATUS_LABELS: Record<TrainingStatus, string> = {
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue',
};

const PAGE_SIZE = 10;

export function AssignTrainingPage() {
  const canManageTraining = usePermission('manage_training');
  const { currentUser } = useAppStore();
  const isAttendant = currentUser?.role === 'attendant';

  // Assignment form state
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<string>('');
  const [employeeSearch, setEmployeeSearch] = useState('');

  // Table filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tableSearch, setTableSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Active employees for selection
  const activeEmployees = useMemo(
    () => employees.filter((e) => e.employmentStatus === 'active'),
    []
  );

  // Filter employees by search in the assignment form
  const filteredEmployeesForSelection = useMemo(() => {
    if (!employeeSearch) return activeEmployees;
    const q = employeeSearch.toLowerCase();
    return activeEmployees.filter(
      (e) =>
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
    );
  }, [activeEmployees, employeeSearch]);

  // Toggle employee selection
  const toggleEmployee = (empId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const selectAllFiltered = () => {
    const filteredIds = filteredEmployeesForSelection.map((e) => e.id);
    const allSelected = filteredIds.every((id) => selectedEmployees.includes(id));
    if (allSelected) {
      setSelectedEmployees((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedEmployees((prev) => [...new Set([...prev, ...filteredIds])]);
    }
  };

  // Handle assignment submission
  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) {
      toast.error('Please select a training module');
      return;
    }
    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }
    if (!deadline) {
      toast.error('Please set a deadline');
      return;
    }

    const moduleName = trainingModules.find((m) => m.id === selectedModule)?.name;
    toast.success('Training assigned successfully', {
      description: `${moduleName} assigned to ${selectedEmployees.length} employee${selectedEmployees.length > 1 ? 's' : ''} with deadline ${formatDate(deadline)}.`,
    });

    setSelectedModule('');
    setSelectedEmployees([]);
    setDeadline('');
    setEmployeeSearch('');
  };

  // Build enriched assignments table data
  const enrichedAssignments = useMemo(() => {
    return trainingAssignments.map((a) => {
      const mod = trainingModules.find((m) => m.id === a.moduleId);
      const emp = employees.find((e) => e.id === a.employeeId);
      return {
        ...a,
        moduleName: mod?.name ?? a.moduleId,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : a.employeeId,
      };
    });
  }, []);

  // Filter assignments for table
  const filteredAssignments = useMemo(() => {
    setCurrentPage(1);
    return enrichedAssignments.filter((a) => {
      if (isAttendant && currentUser && a.employeeId !== currentUser.employee.id) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (tableSearch) {
        const q = tableSearch.toLowerCase();
        return (
          a.employeeId.toLowerCase().includes(q) ||
          a.employeeName.toLowerCase().includes(q) ||
          a.moduleName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [enrichedAssignments, statusFilter, tableSearch, isAttendant, currentUser]);

  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const inputClass =
    'w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Training"
        description="Assign training modules to employees and track current assignments"
      />

      {/* Assignment Form — visible to managers/supervisors only */}
      {canManageTraining && <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
      >
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-[var(--primary)]" />
          New Training Assignment
        </h3>

        <form onSubmit={handleAssign} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Module select */}
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                Training Module
              </label>
              <select
                className={inputClass}
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
              >
                <option value="">Select a module...</option>
                {trainingModules.map((mod) => (
                  <option key={mod.id} value={mod.id}>
                    {mod.name} ({mod.durationHours}h){mod.mandatory ? ' *' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                Deadline
              </label>
              <input
                type="date"
                className={inputClass}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* Employee Multi-Select */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Select Employees ({selectedEmployees.length} selected)
            </label>
            <div className="rounded-lg border border-[var(--input)] bg-[var(--background)] overflow-hidden">
              {/* Search bar */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)]">
                <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  placeholder="Search employees by name or ID..."
                  className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                />
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  {filteredEmployeesForSelection.every((e) => selectedEmployees.includes(e.id))
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>

              {/* Employee list */}
              <div className="max-h-48 overflow-y-auto p-1">
                {filteredEmployeesForSelection.length === 0 ? (
                  <p className="text-xs text-[var(--muted-foreground)] text-center py-4">
                    No employees found
                  </p>
                ) : (
                  filteredEmployeesForSelection.map((emp) => {
                    const isSelected = selectedEmployees.includes(emp.id);
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => toggleEmployee(emp.id)}
                        className={cn(
                          'w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                          isSelected
                            ? 'bg-[var(--primary)]/10 text-[var(--foreground)]'
                            : 'hover:bg-[var(--secondary)] text-[var(--foreground)]'
                        )}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-[var(--primary)] shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
                        )}
                        <span className="font-medium">
                          {emp.firstName} {emp.lastName}
                        </span>
                        <span className="text-xs text-[var(--muted-foreground)]">{emp.id}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
            >
              <Send className="h-4 w-4" />
              Assign Training
            </button>
          </div>
        </form>
      </motion.div>}

      {/* Current Assignments Table */}
      <TableWrapper
        title="Current Assignments"
        icon={<BookOpen className="h-4 w-4 text-[var(--primary)]" />}
        totalItems={filteredAssignments.length}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        toolbar={
          <>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search..."
                className="rounded-lg border border-[var(--input)] bg-[var(--background)] pl-8 pr-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] w-48"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
              />
            </div>
            <select
              className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-2 py-1.5 text-sm text-[var(--foreground)] focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </>
        }
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Employee ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Employee
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Module
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Deadline
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedAssignments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
                  <p className="text-sm text-[var(--muted-foreground)]">
                    No assignments found
                  </p>
                </td>
              </tr>
            ) : (
              paginatedAssignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-mono text-[var(--muted-foreground)]">
                    {assignment.employeeId}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">
                    {assignment.employeeName}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                    {assignment.moduleName}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={TRAINING_STATUS_LABELS[assignment.status]}
                      colorClass={TRAINING_STATUS_COLORS[assignment.status]}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                    {assignment.score != null ? (
                      <span
                        className={cn(
                          'font-semibold',
                          assignment.score >= 85
                            ? 'text-green-600 dark:text-green-400'
                            : assignment.score >= 70
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {assignment.score}%
                      </span>
                    ) : (
                      <span className="text-[var(--muted-foreground)]">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                      {formatDate(assignment.deadline)}
                      {assignment.status === 'overdue' && (
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                      )}
                    </span>
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
