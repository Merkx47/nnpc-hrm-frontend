import { useLocation, Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  new: 'Add Employee',
  transfers: 'Transfers',
  recruitment: 'Recruitment',
  jobs: 'Job Postings',
  applications: 'Applications',
  onboarding: 'Onboarding',
  training: 'Training',
  modules: 'Modules',
  assign: 'Assign Training',
  certifications: 'Certifications',
  performance: 'Performance',
  kpi: 'KPI Dashboard',
  'sales-targets': 'Sales Targets',
  reviews: 'Reviews',
  evaluations: 'Evaluations',
  operations: 'Operations',
  shifts: 'Shifts',
  attendance: 'Attendance',
  'activity-log': 'Activity Log',
  incidents: 'Incidents',
  compensation: 'Compensation',
  salary: 'Salary Records',
  bonuses: 'Bonuses & Allowances',
  'pay-history': 'Pay History',
  reports: 'Reports',
  stations: 'Stations',
  documents: 'Documents',
  notifications: 'Notifications',
  settings: 'Settings',
};

export function Breadcrumbs() {
  const [location] = useLocation();
  const segments = location.split('/').filter(Boolean);

  if (segments.length === 0 || location === '/dashboard') return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] mb-4">
      <Link href="/dashboard">
        <span className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors cursor-pointer">
          <Home className="h-3.5 w-3.5" />
        </span>
      </Link>
      {segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        const label = routeLabels[segment] || segment;
        const isLast = index === segments.length - 1;

        // Skip NRL-IDs in breadcrumbs — show as "Employee Detail"
        const isId = segment.startsWith('NRL-') || segment.startsWith('STN-');
        const displayLabel = isId ? 'Detail' : label;

        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? (
              <span className="font-medium text-[var(--foreground)]">{displayLabel}</span>
            ) : (
              <Link href={path}>
                <span className="hover:text-[var(--foreground)] transition-colors cursor-pointer">
                  {displayLabel}
                </span>
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
