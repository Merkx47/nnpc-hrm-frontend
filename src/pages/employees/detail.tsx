import { useState, useMemo } from 'react';
import { useRoute, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft, Edit, ArrowLeftRight, Mail, Phone, MapPin,
  Calendar, User, Briefcase, Shield, Clock,
  GraduationCap, TrendingUp, CalendarCheck, Wallet, FolderOpen, AlertTriangle,
  CheckCircle, XCircle, AlertCircle, ChevronRight, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/status-badge';
import { ROLE_LABELS, ROLE_COLORS, EMPLOYMENT_STATUS_COLORS, TRAINING_STATUS_COLORS, SEVERITY_COLORS, INCIDENT_LABELS } from '@/lib/constants';
import { formatDate, formatNaira, formatPhone, getInitials } from '@/lib/formatters';
import { employees } from '@/data/employees';
import { stations } from '@/data/stations';
import { trainingAssignments, trainingModules } from '@/data/training-modules';
import { performanceReviews } from '@/data/performance-reviews';
import { attendanceRecords, leaveRequests } from '@/data/attendance';
import { salaryRecords } from '@/data/salary-records';
import { incidents } from '@/data/incidents';
import type { Employee, EmploymentStatus } from '@/types';

const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  on_leave: 'On Leave',
  terminated: 'Terminated',
};

const TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'training', label: 'Training', icon: GraduationCap },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'compensation', label: 'Compensation', icon: Wallet },
  { id: 'documents', label: 'Documents', icon: FolderOpen },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
] as const;

type TabId = (typeof TABS)[number]['id'];

function InfoField({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">{label}</dt>
      <dd className="mt-1 text-sm text-[var(--foreground)]">{value || '—'}</dd>
    </div>
  );
}

export function EmployeeDetailPage() {
  const [, params] = useRoute('/employees/:id');
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferStation, setTransferStation] = useState('');

  const employee = useMemo(() => employees.find((e) => e.id === params?.id), [params?.id]);
  const station = useMemo(() => stations.find((s) => s.id === employee?.stationId), [employee?.stationId]);

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="rounded-xl border border-dashed border-[var(--border)] p-12 max-w-md">
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">Employee Not Found</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            The employee with ID "{params?.id}" could not be found.
          </p>
          <button
            onClick={() => setLocation('/employees')}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  const initials = getInitials(employee.firstName, employee.lastName);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => setLocation('/employees')}
        className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Employees
      </button>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-[var(--primary-foreground)]">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                {employee.firstName} {employee.middleName ? `${employee.middleName} ` : ''}{employee.lastName}
              </h1>
              <StatusBadge label={ROLE_LABELS[employee.role]} colorClass={ROLE_COLORS[employee.role]} />
              <StatusBadge
                label={EMPLOYMENT_STATUS_LABELS[employee.employmentStatus]}
                colorClass={EMPLOYMENT_STATUS_COLORS[employee.employmentStatus]}
              />
            </div>
            <p className="text-sm font-mono text-[var(--muted-foreground)]">{employee.id}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {employee.email}</span>
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {formatPhone(employee.phone)}</span>
              {station && (
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {station.name}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                toast.info(`Editing ${employee.firstName} ${employee.lastName}`, {
                  description: 'Edit mode will be available when connected to a backend API.',
                });
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--input)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={() => setShowTransferModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--input)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Transfer
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)] overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--border)]'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'personal' && <PersonalInfoTab employee={employee} />}
        {activeTab === 'employment' && <EmploymentTab employee={employee} station={station} />}
        {activeTab === 'history' && <HistoryTab employee={employee} />}
        {activeTab === 'training' && <TrainingTab employeeId={employee.id} />}
        {activeTab === 'performance' && <PerformanceTab employeeId={employee.id} />}
        {activeTab === 'attendance' && <AttendanceTab employeeId={employee.id} />}
        {activeTab === 'compensation' && <CompensationTab employeeId={employee.id} />}
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'incidents' && <IncidentsTab employeeId={employee.id} />}
      </motion.div>

      {/* Transfer Modal */}
      <AnimatePresence>
        {showTransferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowTransferModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Transfer Employee</h3>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="rounded-lg p-1.5 hover:bg-[var(--secondary)] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Employee</p>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {employee.firstName} {employee.lastName} ({employee.id})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-foreground)] mb-1">Current Station</p>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {station?.name ?? employee.stationId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Transfer to Station
                  </label>
                  <select
                    value={transferStation}
                    onChange={(e) => setTransferStation(e.target.value)}
                    className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    <option value="">Select a station...</option>
                    {stations
                      .filter((s) => s.id !== employee.stationId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} — {s.city}, {s.state}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)] bg-[var(--secondary)]/30">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="rounded-lg border border-[var(--input)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!transferStation) {
                      toast.error('Please select a station');
                      return;
                    }
                    const targetStation = stations.find((s) => s.id === transferStation);
                    toast.success('Transfer initiated', {
                      description: `${employee.firstName} ${employee.lastName} will be transferred to ${targetStation?.name ?? transferStation}.`,
                    });
                    setShowTransferModal(false);
                    setTransferStation('');
                  }}
                  disabled={!transferStation}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Transfer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────── Personal Info Tab ───────────── */
function PersonalInfoTab({ employee }: { employee: Employee }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-[var(--primary)]" />
          Basic Information
        </h3>
        <dl className="grid grid-cols-2 gap-4">
          <InfoField label="First Name" value={employee.firstName} />
          <InfoField label="Last Name" value={employee.lastName} />
          <InfoField label="Middle Name" value={employee.middleName} />
          <InfoField label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
          <InfoField label="Gender" value={employee.gender} />
          <InfoField label="Email" value={employee.email} />
          <InfoField label="Phone" value={formatPhone(employee.phone)} />
          <InfoField label="State of Origin" value={employee.stateOfOrigin} />
          <InfoField label="LGA" value={employee.lga} />
          <div className="col-span-2">
            <InfoField label="Address" value={employee.address} />
          </div>
        </dl>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-[var(--primary)]" />
            Identification
          </h3>
          <dl className="grid grid-cols-2 gap-4">
            <InfoField label="ID Type" value={employee.idType} />
            <InfoField label="ID Number" value={employee.idNumber} />
          </dl>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Next of Kin</h3>
          <dl className="grid grid-cols-2 gap-4">
            <InfoField label="Name" value={employee.nextOfKin.name} />
            <InfoField label="Phone" value={formatPhone(employee.nextOfKin.phone)} />
            <InfoField label="Relationship" value={employee.nextOfKin.relationship} />
          </dl>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Emergency Contact</h3>
          <dl className="grid grid-cols-2 gap-4">
            <InfoField label="Name" value={employee.emergencyContact.name} />
            <InfoField label="Phone" value={formatPhone(employee.emergencyContact.phone)} />
            <InfoField label="Relationship" value={employee.emergencyContact.relationship} />
          </dl>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Employment Tab ───────────── */
function EmploymentTab({ employee, station }: { employee: Employee; station?: typeof stations[number] }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-[var(--primary)]" />
        Employment Details
      </h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoField label="NRL ID" value={employee.id} />
        <InfoField label="Role" value={ROLE_LABELS[employee.role]} />
        <InfoField label="Status" value={EMPLOYMENT_STATUS_LABELS[employee.employmentStatus]} />
        <InfoField label="Station" value={station?.name} />
        <InfoField label="Station City" value={station?.city} />
        <InfoField label="Region" value={station?.region} />
        <InfoField label="Branch" value={station?.branch} />
        <InfoField label="Dealer" value={employee.dealerName} />
        <InfoField label="Year of Employment" value={String(employee.yearOfEmployment)} />
      </dl>
    </div>
  );
}

/* ───────────── History Tab ───────────── */
function HistoryTab({ employee }: { employee: Employee }) {
  const sortedHistory = [...employee.employmentHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const actionIcons: Record<string, typeof CheckCircle> = {
    hired: CheckCircle,
    promoted: TrendingUp,
    transferred: ArrowLeftRight,
    role_change: Briefcase,
    status_change: AlertCircle,
  };

  const actionColors: Record<string, string> = {
    hired: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    promoted: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    transferred: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
    role_change: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
    status_change: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
  };

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
        <Clock className="h-4 w-4 text-[var(--primary)]" />
        Employment History
      </h3>
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-[var(--border)]" />
        <div className="space-y-6">
          {sortedHistory.map((entry) => {
            const Icon = actionIcons[entry.action] || AlertCircle;
            const colorClass = actionColors[entry.action] || 'text-gray-500 bg-gray-100';
            return (
              <div key={entry.id} className="relative flex gap-4 pl-2">
                <div className={cn('z-10 rounded-full p-1.5 shrink-0', colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-[var(--foreground)] capitalize">
                      {entry.action.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">{entry.details}</p>
                  {entry.fromStation && entry.toStation && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-[var(--muted-foreground)]">
                      <span>{stations.find((s) => s.id === entry.fromStation)?.name ?? entry.fromStation}</span>
                      <ChevronRight className="h-3 w-3" />
                      <span>{stations.find((s) => s.id === entry.toStation)?.name ?? entry.toStation}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────────── Training Tab ───────────── */
function TrainingTab({ employeeId }: { employeeId: string }) {
  const assignments = trainingAssignments.filter((a) => a.employeeId === employeeId);
  const completed = assignments.filter((a) => a.status === 'completed').length;
  const total = assignments.length;

  const TRAINING_STATUS_LABELS: Record<string, string> = {
    assigned: 'Assigned',
    in_progress: 'In Progress',
    completed: 'Completed',
    overdue: 'Overdue',
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      {total > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--foreground)]">Training Progress</span>
            <span className="text-sm text-[var(--muted-foreground)]">{completed}/{total} completed</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--secondary)]">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all"
              style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Module</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">No training assignments</td></tr>
              ) : (
                assignments.map((a) => {
                  const mod = trainingModules.find((m) => m.id === a.moduleId);
                  return (
                    <tr key={a.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">{mod?.name ?? a.moduleId}</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{mod?.category ?? '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge label={TRAINING_STATUS_LABELS[a.status]} colorClass={TRAINING_STATUS_COLORS[a.status]} />
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{a.score != null ? `${a.score}%` : '—'}</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{formatDate(a.deadline)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Performance Tab ───────────── */
function PerformanceTab({ employeeId }: { employeeId: string }) {
  const reviews = performanceReviews.filter((r) => r.employeeId === employeeId);
  const latest = reviews[0];

  const ratingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 dark:text-green-400';
    if (rating >= 3) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const ratingBar = (rating: number) => (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-[var(--secondary)]">
        <div
          className={cn(
            'h-full rounded-full',
            rating >= 4 ? 'bg-green-500' : rating >= 3 ? 'bg-amber-500' : 'bg-red-500'
          )}
          style={{ width: `${(rating / 5) * 100}%` }}
        />
      </div>
      <span className={cn('text-sm font-medium w-8 text-right', ratingColor(rating))}>{rating.toFixed(1)}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {latest && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
            Latest Review — {latest.reviewPeriod}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            <div>
              <label className="text-xs text-[var(--muted-foreground)]">Sales Performance</label>
              {ratingBar(latest.salesRating)}
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)]">Punctuality</label>
              {ratingBar(latest.punctualityRating)}
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)]">Customer Service</label>
              {ratingBar(latest.customerServiceRating)}
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)]">Teamwork</label>
              {ratingBar(latest.teamworkRating)}
            </div>
            <div>
              <label className="text-xs text-[var(--muted-foreground)]">Training Compliance</label>
              {ratingBar(latest.trainingRating)}
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--foreground)]">Overall Rating</label>
              {ratingBar(latest.overallRating)}
            </div>
          </div>
          {latest.comments && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--muted-foreground)] mb-1">Comments</p>
              <p className="text-sm text-[var(--foreground)]">{latest.comments}</p>
            </div>
          )}
        </div>
      )}

      {/* Review History */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Reviewer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Overall</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">No performance reviews</td></tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">{r.reviewPeriod}</td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{r.reviewerName}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-sm font-medium', ratingColor(r.overallRating))}>
                        {r.overallRating.toFixed(1)} / 5.0
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{formatDate(r.date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Attendance Tab ───────────── */
function AttendanceTab({ employeeId }: { employeeId: string }) {
  const records = attendanceRecords.filter((a) => a.employeeId === employeeId);
  const leaves = leaveRequests.filter((l) => l.employeeId === employeeId);

  const present = records.filter((r) => r.status === 'present').length;
  const late = records.filter((r) => r.status === 'late').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const onLeave = records.filter((r) => r.status === 'on_leave').length;

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

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Present', value: present, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Late', value: late, icon: Clock, color: 'text-amber-500' },
          { label: 'Absent', value: absent, icon: XCircle, color: 'text-red-500' },
          { label: 'On Leave', value: onLeave, icon: Calendar, color: 'text-blue-500' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <stat.icon className={cn('h-6 w-6 mx-auto mb-1', stat.color)} />
            <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Attendance */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Recent Attendance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Check In</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Check Out</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">No attendance records</td></tr>
              ) : (
                records.slice(0, 15).map((r) => (
                  <tr key={r.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">{formatDate(r.date)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={r.status.replace('_', ' ')} colorClass={ATTENDANCE_STATUS_COLORS[r.status]} className="capitalize" />
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{r.checkIn ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{r.checkOut ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Requests */}
      {leaves.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Leave Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Days</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Reason</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 text-sm text-[var(--foreground)] capitalize">{l.type}</td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                      {formatDate(l.startDate)} — {formatDate(l.endDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{l.days}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={l.status} colorClass={LEAVE_STATUS_COLORS[l.status]} className="capitalize" />
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] max-w-xs truncate">{l.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────── Compensation Tab ───────────── */
function CompensationTab({ employeeId }: { employeeId: string }) {
  const records = salaryRecords.filter((s) => s.employeeId === employeeId);
  const latest = records[0];

  return (
    <div className="space-y-4">
      {latest && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
            Current Salary — {latest.month} {latest.year}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Base Salary', value: formatNaira(latest.baseSalary) },
              { label: 'Transport', value: formatNaira(latest.transportAllowance) },
              { label: 'Housing', value: formatNaira(latest.housingAllowance) },
              { label: 'Other Allowances', value: formatNaira(latest.otherAllowances) },
              { label: 'Bonuses', value: formatNaira(latest.bonuses) },
              { label: 'Deductions', value: formatNaira(latest.deductions) },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs text-[var(--muted-foreground)]">{item.label}</p>
                <p className="text-sm font-medium text-[var(--foreground)]">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--foreground)]">Net Pay</span>
              <span className="text-xl font-bold text-[var(--primary)]">{formatNaira(latest.netPay)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Pay History */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Pay History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Month</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Base</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Allowances</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Bonuses</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Deductions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">No salary records</td></tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">{r.month} {r.year}</td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{formatNaira(r.baseSalary)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{formatNaira(r.transportAllowance + r.housingAllowance + r.otherAllowances)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{formatNaira(r.bonuses)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{formatNaira(r.deductions)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">{formatNaira(r.netPay)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Documents Tab ───────────── */
function DocumentsTab() {
  const mockDocs = [
    { id: 'DOC-001', type: 'National ID', name: 'NIN Card.pdf', uploadDate: '2024-03-15', fileSize: '1.2 MB' },
    { id: 'DOC-002', type: 'Passport Photo', name: 'Passport_Photo.jpg', uploadDate: '2024-03-15', fileSize: '0.4 MB' },
    { id: 'DOC-003', type: 'Employment Contract', name: 'Employment_Contract_2024.pdf', uploadDate: '2024-01-10', fileSize: '2.8 MB' },
    { id: 'DOC-004', type: 'Certificate', name: 'Fire_Safety_Cert.pdf', uploadDate: '2025-06-20', fileSize: '0.9 MB' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockDocs.map((doc) => (
          <div key={doc.id} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-[var(--primary)]/10 p-2">
                <FolderOpen className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{doc.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{doc.type}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>{formatDate(doc.uploadDate)}</span>
              <span>{doc.fileSize}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upload area */}
      <div className="rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <FolderOpen className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
        <p className="text-sm font-medium text-[var(--foreground)]">Upload Documents</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">Drag & drop or click to upload (mock)</p>
      </div>
    </div>
  );
}

/* ───────────── Incidents Tab ───────────── */
function IncidentsTab({ employeeId }: { employeeId: string }) {
  const records = incidents.filter((i) => i.reportedBy === employeeId);

  const INCIDENT_STATUS_COLORS: Record<string, string> = {
    reported: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  };

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Severity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Description</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">No incidents reported</td></tr>
            ) : (
              records.map((inc) => (
                <tr key={inc.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 text-sm text-[var(--foreground)]">{formatDate(inc.date)}</td>
                  <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{INCIDENT_LABELS[inc.type]}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={inc.severity} colorClass={SEVERITY_COLORS[inc.severity]} className="capitalize" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={inc.status.replace('_', ' ')} colorClass={INCIDENT_STATUS_COLORS[inc.status]} className="capitalize" />
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] max-w-xs truncate">{inc.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
