import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ClipboardCheck, User, MapPin, Calendar,
  CheckCircle2, Circle, ChevronRight, ArrowRight, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermission } from '@/lib/rbac';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { applications } from '@/data/job-postings';
import { formatDate } from '@/lib/formatters';
import type { ApplicationStatus } from '@/types';

// Onboarding checklist — every new hire must complete these
const CHECKLIST_ITEMS = [
  'NIN / ID Verification',
  'Document Submission (WAEC/OND/HND)',
  'Medical Fitness Certificate',
  'HSE Induction Training',
  'Fire Safety & Emergency Drills',
  'Uniform & ID Badge Issued',
  'Station Assignment Confirmed',
  'Bank Account Verification',
  'Employee Contract Signed',
];

const PIPELINE_STAGES: { status: ApplicationStatus; label: string }[] = [
  { status: 'applied', label: 'Applied' },
  { status: 'screening', label: 'Screening' },
  { status: 'shortlisted', label: 'Shortlisted' },
  { status: 'interview', label: 'Interview' },
  { status: 'offered', label: 'Offered' },
  { status: 'onboarding', label: 'Onboarding' },
  { status: 'hired', label: 'Hired' },
];

function PipelineBanner() {
  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Info className="h-4 w-4 text-[var(--primary)]" />
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Recruitment &rarr; Onboarding &rarr; Profile Creation Workflow
        </h3>
      </div>
      <div className="flex items-center flex-wrap gap-y-1">
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={stage.status} className="flex items-center">
            <span className={cn(
              'px-2.5 py-1 text-xs font-medium rounded-sm',
              stage.status === 'onboarding' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
              stage.status === 'hired' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
              stage.status !== 'onboarding' && stage.status !== 'hired' && 'bg-[var(--secondary)] text-[var(--muted-foreground)]',
            )}>
              {stage.label}
            </span>
            {i < PIPELINE_STAGES.length - 1 && (
              <ChevronRight className="h-3.5 w-3.5 text-[var(--muted-foreground)] mx-0.5" />
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--muted-foreground)] mt-2.5 border-t border-[var(--border)] pt-2.5">
        <strong>How it works:</strong> A Dealer or Admin advances an application through the pipeline on the Applications page.
        Once it reaches <strong>Onboarding</strong>, the candidate appears here. Complete all checklist items, then click{' '}
        <strong>Complete &amp; Create Profile</strong> to register them as an employee.
      </p>
    </div>
  );
}

type ChecklistState = Record<string, boolean[]>;

export function OnboardingPage() {
  const [, setLocation] = useLocation();
  const canComplete = usePermission('complete_onboarding');

  const [statusOverrides, setStatusOverrides] = useState<Record<string, ApplicationStatus>>({});
  const [checklists, setChecklists] = useState<ChecklistState>({});

  const onboardingApps = useMemo(() => {
    return applications.filter((a) => (statusOverrides[a.id] ?? a.status) === 'onboarding');
  }, [statusOverrides]);

  const completedCount = useMemo(() => {
    return onboardingApps.filter((app) => {
      const items = checklists[app.id] ?? CHECKLIST_ITEMS.map(() => false);
      return items.every(Boolean);
    }).length;
  }, [onboardingApps, checklists]);

  const toggleItem = (appId: string, idx: number) => {
    setChecklists((prev) => {
      const current = prev[appId] ?? CHECKLIST_ITEMS.map(() => false);
      const updated = [...current];
      updated[idx] = !updated[idx];
      return { ...prev, [appId]: updated };
    });
  };

  const getProgress = (appId: string) => {
    const items = checklists[appId] ?? CHECKLIST_ITEMS.map(() => false);
    const done = items.filter(Boolean).length;
    return { done, total: items.length, pct: Math.round((done / items.length) * 100), items };
  };

  const completeOnboarding = (app: typeof applications[number]) => {
    setStatusOverrides((prev) => ({ ...prev, [app.id]: 'hired' }));
    toast.success(`${app.applicantName} onboarding complete`, {
      description: 'Redirecting to Add Employee to create their profile.',
    });
    setTimeout(() => setLocation('/employees/new'), 700);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Onboarding"
        description="Candidates arrive here when their application status reaches Onboarding"
      />

      <PipelineBanner />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
          <User className="h-5 w-5 mx-auto mb-1 text-[var(--primary)]" />
          <p className="text-2xl font-bold text-[var(--foreground)]">{onboardingApps.length}</p>
          <p className="text-xs text-[var(--muted-foreground)]">In Onboarding</p>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
          <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
          <p className="text-2xl font-bold text-[var(--foreground)]">{completedCount}</p>
          <p className="text-xs text-[var(--muted-foreground)]">Checklist Complete</p>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
          <ClipboardCheck className="h-5 w-5 mx-auto mb-1 text-amber-500" />
          <p className="text-2xl font-bold text-[var(--foreground)]">{onboardingApps.length - completedCount}</p>
          <p className="text-xs text-[var(--muted-foreground)]">In Progress</p>
        </div>
      </div>

      {onboardingApps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-12 text-center">
          <ClipboardCheck className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
          <p className="text-sm font-medium text-[var(--foreground)] mb-1">No candidates currently in onboarding</p>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            Advance an application to <strong>Onboarding</strong> from the Applications pipeline.
          </p>
          <button
            onClick={() => setLocation('/recruitment/applications')}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-3 py-2 text-xs font-medium text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            Go to Applications
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {onboardingApps.map((app, i) => {
            const { done, total, pct, items } = getProgress(app.id);
            const allDone = done === total;

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">{app.applicantName}</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">{app.positionTitle}</p>
                  </div>
                  <StatusBadge
                    label={allDone ? 'Complete' : 'In Progress'}
                    colorClass={allDone
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}
                  />
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{app.stationName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>Applied {formatDate(app.appliedDate)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--muted-foreground)]">Progress</span>
                    <span className="font-medium text-[var(--foreground)]">{done}/{total} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--secondary)]">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-blue-500',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-1.5 mb-4">
                  {CHECKLIST_ITEMS.map((label, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleItem(app.id, idx)}
                      className="flex items-center gap-2.5 w-full text-left group"
                    >
                      {items[idx] ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] shrink-0 transition-colors" />
                      )}
                      <span className={cn(
                        'text-sm',
                        items[idx] ? 'text-[var(--muted-foreground)] line-through' : 'text-[var(--foreground)]',
                      )}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Complete & Create Profile */}
                {canComplete ? (
                  <button
                    onClick={() => completeOnboarding(app)}
                    disabled={!allDone}
                    className={cn(
                      'w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                      allDone
                        ? 'bg-green-600 text-white hover:bg-green-500'
                        : 'bg-[var(--secondary)] text-[var(--muted-foreground)] cursor-not-allowed',
                    )}
                    title={allDone ? 'Create employee profile' : 'Complete all checklist items first'}
                  >
                    <ArrowRight className="h-4 w-4" />
                    {allDone ? 'Complete & Create Profile' : `${total - done} item${total - done !== 1 ? 's' : ''} remaining`}
                  </button>
                ) : (
                  allDone && (
                    <p className="text-xs text-center text-[var(--muted-foreground)] border-t border-[var(--border)] pt-3">
                      Checklist complete — awaiting Dealer or Admin to create employee profile.
                    </p>
                  )
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
