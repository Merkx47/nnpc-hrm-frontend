import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AlertTriangle, Plus, Shield, CheckCircle, Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { getFilteredStationIds } from '@/data/dashboard-data';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableWrapper } from '@/components/shared/table-wrapper';
import { formatDate } from '@/lib/formatters';
import { INCIDENT_LABELS, SEVERITY_COLORS } from '@/lib/constants';
import { incidents } from '@/data/incidents';
import { stations } from '@/data/stations';
import type { IncidentType, Severity, IncidentStatus } from '@/types';

const PAGE_SIZE = 10;

const INCIDENT_STATUS_COLORS: Record<IncidentStatus, string> = {
  reported: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const STATUS_LABELS: Record<IncidentStatus, string> = {
  reported: 'Reported',
  under_review: 'Under Review',
  resolved: 'Resolved',
};

const SEVERITY_LABELS: Record<Severity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const inputClass =
  'w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]';

export function IncidentsPage() {
  const { selectedRegionId, selectedBranchId, selectedStationId } = useAppStore();

  // Global filter: compute allowed station IDs
  const globalStationIds = useMemo(
    () => getFilteredStationIds(selectedRegionId || undefined, selectedBranchId || undefined, selectedStationId || undefined),
    [selectedRegionId, selectedBranchId, selectedStationId],
  );

  const isGlobalFilterActive = selectedRegionId || selectedBranchId || selectedStationId;

  // Filter state
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Report form state
  const [showForm, setShowForm] = useState(false);
  const [formStation, setFormStation] = useState('');
  const [formType, setFormType] = useState<string>('');
  const [formSeverity, setFormSeverity] = useState<string>('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');

  // Pre-filter incidents by global station filter
  const stationFilteredIncidents = useMemo(() => {
    if (!isGlobalFilterActive) return incidents;
    const stationIdSet = new Set(globalStationIds);
    return incidents.filter((i) => stationIdSet.has(i.stationId));
  }, [isGlobalFilterActive, globalStationIds]);

  // Stats
  const totalIncidents = stationFilteredIncidents.length;
  const underReview = stationFilteredIncidents.filter((i) => i.status === 'under_review').length;
  const resolved = stationFilteredIncidents.filter((i) => i.status === 'resolved').length;
  const critical = stationFilteredIncidents.filter((i) => i.severity === 'critical').length;

  // Filtered data (local filters on top of global)
  const filteredIncidents = useMemo(() => {
    return stationFilteredIncidents.filter((incident) => {
      if (typeFilter !== 'all' && incident.type !== typeFilter) return false;
      if (severityFilter !== 'all' && incident.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && incident.status !== statusFilter) return false;
      return true;
    });
  }, [typeFilter, severityFilter, statusFilter, stationFilteredIncidents]);

  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const hasActiveFilters = typeFilter !== 'all' || severityFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = () => {
    setTypeFilter('all');
    setSeverityFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handleSeverityFilterChange = (value: string) => {
    setSeverityFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStation || !formType || !formSeverity || !formDescription || !formDate) {
      toast.error('Please fill all required fields');
      return;
    }
    toast.success('Incident reported successfully', {
      description: 'The incident report has been submitted for review.',
    });
    setFormStation('');
    setFormType('');
    setFormSeverity('');
    setFormDescription('');
    setFormDate('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incident Reports"
        description="Monitor and manage station incident reports"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          >
            {showForm ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Report Incident
              </>
            )}
          </button>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Incidents"
          value={totalIncidents}
          icon={AlertTriangle}
          subtitle="All time"
          delay={0}
        />
        <StatCard
          title="Under Review"
          value={underReview}
          icon={Search}
          subtitle="Pending investigation"
          delay={0.1}
        />
        <StatCard
          title="Resolved"
          value={resolved}
          icon={CheckCircle}
          subtitle="Successfully closed"
          delay={0.2}
        />
        <StatCard
          title="Critical"
          value={critical}
          icon={Shield}
          subtitle="High priority"
          delay={0.3}
        />
      </div>

      {/* Report Incident Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--primary)]" />
              Report New Incident
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Station <span className="text-[var(--destructive)]">*</span>
                </label>
                <select
                  className={inputClass}
                  value={formStation}
                  onChange={(e) => setFormStation(e.target.value)}
                >
                  <option value="">Select Station</option>
                  {stations
                    .filter((s) => s.status === 'active')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.city}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Type <span className="text-[var(--destructive)]">*</span>
                </label>
                <select
                  className={inputClass}
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                >
                  <option value="">Select Type</option>
                  {(Object.entries(INCIDENT_LABELS) as [IncidentType, string][]).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Severity <span className="text-[var(--destructive)]">*</span>
                </label>
                <select
                  className={inputClass}
                  value={formSeverity}
                  onChange={(e) => setFormSeverity(e.target.value)}
                >
                  <option value="">Select Severity</option>
                  {(Object.entries(SEVERITY_LABELS) as [Severity, string][]).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Date <span className="text-[var(--destructive)]">*</span>
                </label>
                <input
                  type="date"
                  className={inputClass}
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Description <span className="text-[var(--destructive)]">*</span>
                </label>
                <textarea
                  className={cn(inputClass, 'min-h-[80px]')}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the incident in detail..."
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-4 w-4" />
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Filter Bar + Table */}
      <TableWrapper
        title="Incident Records"
        icon={<AlertTriangle className="h-4 w-4 text-[var(--primary)]" />}
        totalItems={filteredIncidents.length}
        pageSize={PAGE_SIZE}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Filter className="h-4 w-4" />
            </div>

            <select
              className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-2 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
            >
              <option value="all">All Types</option>
              {(Object.entries(INCIDENT_LABELS) as [IncidentType, string][]).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <select
              className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-2 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={severityFilter}
              onChange={(e) => handleSeverityFilterChange(e.target.value)}
            >
              <option value="all">All Severities</option>
              {(Object.entries(SEVERITY_LABELS) as [Severity, string][]).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <select
              className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-2 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {(Object.entries(STATUS_LABELS) as [IncidentStatus, string][]).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        }
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Station
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Reporter
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Severity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedIncidents.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]"
                >
                  No incidents found matching the selected filters.
                </td>
              </tr>
            ) : (
              paginatedIncidents.map((incident) => (
                <tr
                  key={incident.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-[var(--foreground)]">
                        {formatDate(incident.date)}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">{incident.time}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                    {incident.stationName}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {incident.reporterName}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {incident.reportedBy}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                    {INCIDENT_LABELS[incident.type]}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={SEVERITY_LABELS[incident.severity]}
                      colorClass={SEVERITY_COLORS[incident.severity]}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={STATUS_LABELS[incident.status]}
                      colorClass={INCIDENT_STATUS_COLORS[incident.status]}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] max-w-[250px] truncate">
                    {incident.description}
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
