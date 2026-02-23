import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import {
  Users, UserPlus, UserCheck, UserX, Clock,
  Search, Filter, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { ROLE_LABELS, ROLE_COLORS, EMPLOYMENT_STATUS_COLORS } from '@/lib/constants';
import { getInitials } from '@/lib/formatters';
import { employees as staticEmployees } from '@/data/employees';
import { useDataStore } from '@/lib/data-store';
import { stations } from '@/data/stations';
import { getFilteredStationIds } from '@/data/dashboard-data';
import { usePermission } from '@/lib/rbac';
import { ExportDropdown } from '@/components/shared/export-dropdown';
import type { ExportColumn } from '@/lib/export-utils';
import type { Employee, Role, EmploymentStatus } from '@/types';

const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  on_leave: 'On Leave',
  terminated: 'Terminated',
};

export function EmployeesPage() {
  const [, setLocation] = useLocation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const canCreateEmployee = usePermission('create_employee');

  // Global scope filters from store
  const { currentUser, selectedRegionId, selectedBranchId, selectedStationId } = useAppStore();
  const addedEmployees = useDataStore((s) => s.addedEmployees);
  const deletedEmployeeIds = useDataStore((s) => s.deletedEmployeeIds);
  const employees = useMemo(() => {
    const deletedSet = new Set(deletedEmployeeIds);
    return [...staticEmployees, ...addedEmployees].filter((e) => !deletedSet.has(e.id));
  }, [addedEmployees, deletedEmployeeIds]);

  // Local page-specific filters
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Global filter → station IDs
  const globalStationIds = useMemo(() => {
    const ids = getFilteredStationIds(selectedRegionId || undefined, selectedBranchId || undefined, selectedStationId || undefined);
    return new Set(ids);
  }, [selectedRegionId, selectedBranchId, selectedStationId]);

  // Station map for quick lookups
  const stationMap = useMemo(() => {
    const map = new Map<string, { name: string; region: string; branch: string }>();
    stations.forEach((s) => map.set(s.id, { name: s.name, region: s.region, branch: s.branch }));
    return map;
  }, []);

  // Stats (scoped to global filter + role)
  const scopedEmployees = useMemo(() => {
    // Attendants only see themselves
    if (currentUser?.role === 'attendant') {
      return employees.filter((e) => e.id === currentUser.employee.id);
    }
    const hasGlobal = selectedRegionId || selectedBranchId || selectedStationId;
    if (!hasGlobal) return employees;
    return employees.filter((e) => globalStationIds.has(e.stationId));
  }, [employees, currentUser, selectedRegionId, selectedBranchId, selectedStationId, globalStationIds]);

  const stats = useMemo(() => {
    const total = scopedEmployees.length;
    const active = scopedEmployees.filter((e) => e.employmentStatus === 'active').length;
    const onLeave = scopedEmployees.filter((e) => e.employmentStatus === 'on_leave').length;
    const inactive = scopedEmployees.filter((e) => e.employmentStatus === 'inactive' || e.employmentStatus === 'terminated').length;
    return { total, active, onLeave, inactive };
  }, [scopedEmployees]);

  // Filtered data (global scope + local filters)
  const filteredData = useMemo(() => {
    return scopedEmployees.filter((emp) => {
      if (roleFilter !== 'all' && emp.role !== roleFilter) return false;
      if (statusFilter !== 'all' && emp.employmentStatus !== statusFilter) return false;
      return true;
    });
  }, [roleFilter, statusFilter, scopedEmployees]);

  // Table columns
  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'NRL ID',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-[var(--muted-foreground)]">
            {getValue<string>()}
          </span>
        ),
        size: 140,
      },
      {
        id: 'name',
        header: 'Employee',
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        cell: ({ row }) => {
          const emp = row.original;
          const initials = getInitials(emp.firstName, emp.lastName);
          return (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[var(--primary-foreground)]">
                  {initials}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {emp.firstName} {emp.lastName}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">{emp.email}</p>
              </div>
            </div>
          );
        },
        size: 250,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ getValue }) => {
          const role = getValue<Role>();
          return (
            <StatusBadge label={ROLE_LABELS[role]} colorClass={ROLE_COLORS[role]} />
          );
        },
        size: 160,
      },
      {
        id: 'station',
        header: 'Station',
        accessorFn: (row) => stationMap.get(row.stationId)?.name ?? row.stationId,
        cell: ({ getValue }) => (
          <span className="text-sm text-[var(--foreground)]">{getValue<string>()}</span>
        ),
        size: 220,
      },
      {
        accessorKey: 'dealerName',
        header: 'Dealer',
        cell: ({ getValue }) => (
          <span className="text-sm text-[var(--muted-foreground)]">{getValue<string>()}</span>
        ),
        size: 180,
      },
      {
        accessorKey: 'employmentStatus',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue<EmploymentStatus>();
          return (
            <StatusBadge
              label={EMPLOYMENT_STATUS_LABELS[status]}
              colorClass={EMPLOYMENT_STATUS_COLORS[status]}
            />
          );
        },
        size: 120,
      },
      {
        accessorKey: 'yearOfEmployment',
        header: 'Year',
        cell: ({ getValue }) => (
          <span className="text-sm text-[var(--muted-foreground)]">{getValue<number>()}</span>
        ),
        size: 80,
      },
    ],
    [stationMap]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  const activeFiltersCount =
    (roleFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setRoleFilter('all');
    setStatusFilter('all');
  };

  const exportColumns: ExportColumn[] = [
    { header: 'NRL ID', accessor: 'id' },
    { header: 'First Name', accessor: 'firstName' },
    { header: 'Last Name', accessor: 'lastName' },
    { header: 'Role', accessor: 'role', format: (v) => ROLE_LABELS[v as Role] ?? String(v) },
    { header: 'Station', accessor: 'stationId', format: (v, row) => stationMap.get(v as string)?.name ?? String(v) },
    { header: 'Dealer', accessor: 'dealerName' },
    { header: 'Status', accessor: 'employmentStatus' },
    { header: 'Year', accessor: 'yearOfEmployment', format: (v) => String(v) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description={`Manage all ${employees.length} employees across ${stations.length} stations`}
        action={
          canCreateEmployee ? (
            <button
              onClick={() => setLocation('/employees/new')}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
            >
              <UserPlus className="h-4 w-4" />
              Add Employee
            </button>
          ) : undefined
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={stats.total} icon={Users} delay={0} />
        <StatCard title="Active" value={stats.active} icon={UserCheck} delay={0.1} subtitle="Currently working" />
        <StatCard title="On Leave" value={stats.onLeave} icon={Clock} delay={0.2} />
        <StatCard title="Inactive" value={stats.inactive} icon={UserX} delay={0.3} />
      </div>

      {/* Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden"
      >
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search by name or NRL ID..."
                className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>

            {/* Filter & Export buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  showFilters || activeFiltersCount > 0
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'border-[var(--input)] text-[var(--foreground)] hover:bg-[var(--secondary)]'
                )}
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="rounded-full bg-[var(--primary)] text-white text-xs px-1.5 py-0.5 min-w-[20px] text-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <ExportDropdown
                data={table.getFilteredRowModel().rows.map(r => r.original) as unknown as Record<string, unknown>[]}
                columns={exportColumns}
                filename="employees"
              />
            </div>
          </div>

          {/* Filter dropdowns */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-[var(--border)]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    <option value="all">All Roles</option>
                    {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                      <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    <option value="all">All Statuses</option>
                    {(Object.keys(EMPLOYMENT_STATUS_LABELS) as EmploymentStatus[]).map((status) => (
                      <option key={status} value={status}>{EMPLOYMENT_STATUS_LABELS[status]}</option>
                    ))}
                  </select>
                </div>

              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                >
                  <X className="h-3 w-3" />
                  Clear all filters
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-[var(--border)]">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider',
                        header.column.getCanSort() && 'cursor-pointer select-none hover:text-[var(--foreground)]'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ width: header.getSize() }}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <ChevronUp className="h-3 w-3" />}
                        {header.column.getIsSorted() === 'desc' && <ChevronDown className="h-3 w-3" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-[var(--muted-foreground)]" />
                      <p className="text-sm text-[var(--muted-foreground)]">No employees found</p>
                      {(globalFilter || activeFiltersCount > 0) && (
                        <button
                          onClick={() => { setGlobalFilter(''); clearFilters(); }}
                          className="text-xs text-[var(--primary)] hover:underline"
                        >
                          Clear search & filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setLocation(`/employees/${row.original.id}`)}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <span>
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length}
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-sm text-[var(--foreground)] focus:outline-none"
            >
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>{size} per page</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg p-1.5 hover:bg-[var(--secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg p-1.5 hover:bg-[var(--secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: table.getPageCount() }, (_, i) => i).map((page) => (
              <button
                key={page}
                onClick={() => table.setPageIndex(page)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  page === table.getState().pagination.pageIndex
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'hover:bg-[var(--secondary)] text-[var(--muted-foreground)]'
                )}
              >
                {page + 1}
              </button>
            ))}

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg p-1.5 hover:bg-[var(--secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="rounded-lg p-1.5 hover:bg-[var(--secondary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
