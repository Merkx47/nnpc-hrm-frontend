import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  BarChart3, Download, FileText, Users, Calendar,
  TrendingUp, Shield, GraduationCap, Clock,
} from 'lucide-react';
import { NairaIcon } from '@/components/shared/naira-icon';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import type { LucideIcon } from 'lucide-react';

type ReportIcon = LucideIcon | typeof NairaIcon;

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: ReportIcon;
  category: string;
  formats: string[];
}

const reports: ReportCard[] = [
  {
    id: 'RPT-001', title: 'Employee Roster', description: 'Complete list of all employees with details',
    icon: Users, category: 'HR', formats: ['CSV', 'PDF'],
  },
  {
    id: 'RPT-002', title: 'Attendance Summary', description: 'Monthly attendance report across all stations',
    icon: Calendar, category: 'Operations', formats: ['CSV', 'PDF', 'Excel'],
  },
  {
    id: 'RPT-003', title: 'Sales Performance', description: 'Lubricant sales vs targets by employee and station',
    icon: TrendingUp, category: 'Performance', formats: ['CSV', 'PDF', 'Excel'],
  },
  {
    id: 'RPT-004', title: 'Payroll Summary', description: 'Monthly salary and compensation breakdown',
    icon: NairaIcon, category: 'Finance', formats: ['CSV', 'PDF', 'Excel'],
  },
  {
    id: 'RPT-005', title: 'Training Compliance', description: 'Training completion rates and overdue modules',
    icon: GraduationCap, category: 'Training', formats: ['CSV', 'PDF'],
  },
  {
    id: 'RPT-006', title: 'Incident Report', description: 'Safety incidents and resolutions summary',
    icon: Shield, category: 'Operations', formats: ['CSV', 'PDF'],
  },
  {
    id: 'RPT-007', title: 'Shift Coverage', description: 'Weekly shift utilization and coverage gaps',
    icon: Clock, category: 'Operations', formats: ['CSV', 'PDF'],
  },
  {
    id: 'RPT-008', title: 'Performance Reviews', description: 'Quarterly review scores and trends',
    icon: BarChart3, category: 'Performance', formats: ['CSV', 'PDF', 'Excel'],
  },
];

const categories = ['All', 'HR', 'Operations', 'Performance', 'Finance', 'Training'];

export function ReportsPage() {
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filtered = categoryFilter === 'All' ? reports : reports.filter((r) => r.category === categoryFilter);

  const handleDownload = (title: string, format: string) => {
    toast.success(`Generating ${title}`, {
      description: `${format} report will be downloaded shortly.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Generate and download reports for your organization"
        action={
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-sm text-[var(--muted-foreground)]">{reports.length} reports available</span>
          </div>
        }
      />

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              categoryFilter === cat
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((report, i) => {
          const Icon = report.icon;
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="rounded-lg bg-[var(--primary)]/10 p-2.5">
                  <Icon className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">{report.title}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{report.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">{report.category}</span>
                <div className="flex gap-1">
                  {report.formats.map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => handleDownload(report.title, fmt)}
                      className="inline-flex items-center gap-1 rounded-md border border-[var(--input)] px-2 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
