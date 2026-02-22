import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Briefcase, MapPin, Calendar, Users, Filter, Plus, Clock, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermission } from '@/lib/rbac';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { jobPostings } from '@/data/job-postings';
import { stations } from '@/data/stations';
import { formatDate } from '@/lib/formatters';

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300',
};

export function JobPostingsPage() {
  const canCreateJob = usePermission('create_job_posting');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', station: '', description: '' });

  const stationNames = useMemo(
    () => Array.from(new Set(jobPostings.map((j) => j.stationName))),
    [],
  );

  const filtered = useMemo(() => {
    return jobPostings.filter((j) => {
      if (statusFilter !== 'all' && j.status !== statusFilter) return false;
      if (stationFilter !== 'all' && j.stationName !== stationFilter) return false;
      return true;
    });
  }, [statusFilter, stationFilter]);

  const openCount = jobPostings.filter((j) => j.status === 'open').length;
  const closedCount = jobPostings.filter((j) => j.status === 'closed').length;
  const totalApps = jobPostings.reduce((sum, j) => sum + j.applicationsCount, 0);

  const inputClass =
    'rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Postings"
        description="Manage open positions and recruitment across stations"
        action={
          canCreateJob ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Create Job Posting
            </button>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <Briefcase className="h-6 w-6 mx-auto mb-1 text-[var(--primary)]" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{jobPostings.length}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Total Postings</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{openCount}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Open</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-1 text-gray-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{closedCount}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Closed</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{totalApps}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Total Applications</p>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-center gap-3"
      >
        <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
        <select
          className={inputClass}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'closed')}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        <select
          className={inputClass}
          value={stationFilter}
          onChange={(e) => setStationFilter(e.target.value)}
        >
          <option value="all">All Stations</option>
          {stationNames.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="text-sm text-[var(--muted-foreground)]">
          {filtered.length} posting{filtered.length !== 1 ? 's' : ''}
        </span>
      </motion.div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <div
              className={cn(
                'rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5',
                'hover:shadow-md transition-shadow duration-200 h-full flex flex-col',
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--foreground)] leading-tight">
                  {job.title}
                </h3>
                <StatusBadge
                  label={job.status === 'open' ? 'Open' : 'Closed'}
                  colorClass={STATUS_COLORS[job.status]}
                />
              </div>

              <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-4">
                {job.description}
              </p>

              <div className="space-y-2 mt-auto">
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{job.stationName}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Posted {formatDate(job.postedDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Deadline {formatDate(job.deadline)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                    {job.applicationsCount} application{job.applicationsCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">{job.id}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <Briefcase className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">No job postings match the selected filters</p>
        </div>
      )}

      {/* Create Job Posting Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Create Job Posting</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg p-1.5 hover:bg-[var(--secondary)] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Job Title</label>
                  <input
                    type="text"
                    value={newJob.title}
                    onChange={(e) => setNewJob((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Station Attendant"
                    className={cn(inputClass, 'w-full')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Station</label>
                  <select
                    value={newJob.station}
                    onChange={(e) => setNewJob((p) => ({ ...p, station: e.target.value }))}
                    className={cn(inputClass, 'w-full')}
                  >
                    <option value="">Select a station...</option>
                    {stations.map((s) => (
                      <option key={s.id} value={s.name}>{s.name} — {s.city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Description</label>
                  <textarea
                    value={newJob.description}
                    onChange={(e) => setNewJob((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the role and responsibilities..."
                    rows={3}
                    className={cn(inputClass, 'w-full resize-none')}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)] bg-[var(--secondary)]/30">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-[var(--input)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newJob.title || !newJob.station) {
                      toast.error('Please fill in title and station');
                      return;
                    }
                    toast.success('Job posting created', {
                      description: `"${newJob.title}" at ${newJob.station} is now open for applications.`,
                    });
                    setShowCreateModal(false);
                    setNewJob({ title: '', station: '', description: '' });
                  }}
                  disabled={!newJob.title || !newJob.station}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Posting
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
