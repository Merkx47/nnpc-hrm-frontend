import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Clock, Filter, Shield, ShieldCheck, Users,
  CheckCircle2, Loader2, AlertTriangle, ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { TRAINING_STATUS_COLORS, TRAINING_CATEGORIES } from '@/lib/constants';
import { trainingModules, trainingAssignments as staticTrainingAssignments } from '@/data/training-modules';
import { useDataStore } from '@/lib/data-store';
import type { TrainingStatus } from '@/types';

const TRAINING_STATUS_LABELS: Record<TrainingStatus, string> = {
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue',
};

const CATEGORY_COLORS: Record<string, string> = {
  Safety: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'Customer Service': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Fuel Handling': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'Lubricant Sales': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Equipment Operation': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  'Emergency Procedures': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

export function TrainingModulesPage() {
  const addedTrainingAssignments = useDataStore((s) => s.addedTrainingAssignments);
  const trainingAssignments = useMemo(() => [...staticTrainingAssignments, ...addedTrainingAssignments], [addedTrainingAssignments]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Get unique categories from the actual module data
  const categories = useMemo(() => {
    const cats = new Set(trainingModules.map((m) => m.category));
    return Array.from(cats).sort();
  }, []);

  // Filter modules by category
  const filteredModules = useMemo(() => {
    if (categoryFilter === 'all') return trainingModules;
    return trainingModules.filter((m) => m.category === categoryFilter);
  }, [categoryFilter]);

  // Compute completion stats per module
  const moduleStats = useMemo(() => {
    const stats: Record<string, Record<TrainingStatus, number>> = {};
    for (const mod of trainingModules) {
      stats[mod.id] = { assigned: 0, in_progress: 0, completed: 0, overdue: 0 };
    }
    for (const assignment of trainingAssignments) {
      if (stats[assignment.moduleId]) {
        stats[assignment.moduleId][assignment.status]++;
      }
    }
    return stats;
  }, []);

  // Overall summary stats
  const totalModules = trainingModules.length;
  const mandatoryCount = trainingModules.filter((m) => m.mandatory).length;
  const totalAssignments = trainingAssignments.length;
  const completedAssignments = trainingAssignments.filter((a) => a.status === 'completed').length;

  const inputClass =
    'rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training Modules"
        description="Browse all available training modules and track completion progress"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <BookOpen className="h-6 w-6 mx-auto mb-1 text-[var(--primary)]" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{totalModules}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Total Modules</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <ShieldCheck className="h-6 w-6 mx-auto mb-1 text-red-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{mandatoryCount}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Mandatory</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <ClipboardList className="h-6 w-6 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{totalAssignments}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Total Assignments</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold text-[var(--foreground)]">{completedAssignments}</p>
            <p className="text-xs text-[var(--muted-foreground)]">Completed</p>
          </div>
        </motion.div>
      </div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3"
      >
        <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
        <select
          className={inputClass}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <span className="text-sm text-[var(--muted-foreground)]">
          Showing {filteredModules.length} of {totalModules} modules
        </span>
      </motion.div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map((mod, index) => {
          const stats = moduleStats[mod.id];
          const totalForModule = stats.assigned + stats.in_progress + stats.completed + stats.overdue;

          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--foreground)] leading-tight">
                    {mod.name}
                  </h3>
                  <span className="text-xs text-[var(--muted-foreground)]">{mod.id}</span>
                </div>
                {mod.mandatory && (
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-800 dark:text-red-300">
                    <Shield className="h-3 w-3" />
                    Required
                  </span>
                )}
              </div>

              {/* Category Badge & Duration */}
              <div className="flex items-center gap-2 mb-3">
                <StatusBadge
                  label={mod.category}
                  colorClass={CATEGORY_COLORS[mod.category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300'}
                />
                <span className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                  <Clock className="h-3 w-3" />
                  {mod.durationHours}h
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-4 flex-1 line-clamp-3">
                {mod.description}
              </p>

              {/* Completion Stats */}
              <div className="border-t border-[var(--border)] pt-3 mt-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {totalForModule} Assignment{totalForModule !== 1 ? 's' : ''}
                  </span>
                  {totalForModule > 0 && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {Math.round((stats.completed / totalForModule) * 100)}% complete
                    </span>
                  )}
                </div>

                {totalForModule > 0 ? (
                  <>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-[var(--secondary)] mb-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{ width: `${(stats.completed / totalForModule) * 100}%` }}
                      />
                    </div>

                    {/* Status breakdown */}
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.entries(stats) as [TrainingStatus, number][])
                        .filter(([, count]) => count > 0)
                        .map(([status, count]) => (
                          <span
                            key={status}
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                              TRAINING_STATUS_COLORS[status]
                            )}
                          >
                            {status === 'completed' && <CheckCircle2 className="h-2.5 w-2.5" />}
                            {status === 'in_progress' && <Loader2 className="h-2.5 w-2.5" />}
                            {status === 'overdue' && <AlertTriangle className="h-2.5 w-2.5" />}
                            {status === 'assigned' && <ClipboardList className="h-2.5 w-2.5" />}
                            {count} {TRAINING_STATUS_LABELS[status]}
                          </span>
                        ))}
                    </div>
                  </>
                ) : (
                  <p className="text-[10px] text-[var(--muted-foreground)] italic">
                    No assignments yet
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <BookOpen className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">No modules found for the selected category</p>
        </div>
      )}
    </div>
  );
}
