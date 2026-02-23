import { useEffect } from 'react';
import { Route, Switch, Redirect, useLocation } from 'wouter';
import { useAppStore } from '@/lib/store';
import { AppLayout } from '@/components/layout/app-layout';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
import { EmployeesPage } from '@/pages/employees';
import { EmployeeDetailPage } from '@/pages/employees/detail';
import { AddEmployeePage } from '@/pages/employees/new';
import { TransfersPage } from '@/pages/employees/transfers';
import { ShiftsPage } from '@/pages/operations/shifts';
import { AttendancePage } from '@/pages/operations/attendance';
import { ActivityLogPage } from '@/pages/operations/activity-log';
import { IncidentsPage } from '@/pages/operations/incidents';
import { TrainingModulesPage } from '@/pages/training/modules';
import { AssignTrainingPage } from '@/pages/training/assign';
import { CertificationsPage } from '@/pages/training/certifications';
import { KpiDashboardPage } from '@/pages/performance/kpi';
import { SalesTargetsPage } from '@/pages/performance/sales-targets';
import { PerformanceReviewsPage } from '@/pages/performance/reviews';
import { EvaluationsPage } from '@/pages/performance/evaluations';
import { JobPostingsPage } from '@/pages/recruitment/jobs';
import { ApplicationsPage } from '@/pages/recruitment/applications';
import { OnboardingPage } from '@/pages/recruitment/onboarding';
import { SalaryRecordsPage } from '@/pages/compensation/salary';
import { BonusesPage } from '@/pages/compensation/bonuses';
import { PayHistoryPage } from '@/pages/compensation/pay-history';
import { ReportsPage } from '@/pages/reports';
import { StationsPage } from '@/pages/stations';
import { NotificationsPage } from '@/pages/notifications';
import { SettingsPage } from '@/pages/settings';
import { DocumentLibraryPage } from '@/pages/documents';
import { ApprovalsQueuePage } from '@/pages/approvals/pending';
import { MyRequestsPage } from '@/pages/approvals/my-requests';
import { ApprovalDetailPage } from '@/pages/approvals/detail';
import { AllRequestsPage } from '@/pages/approvals/all-requests';
import { AuditLogPage } from '@/pages/audit-log';
import { useApprovalStore } from '@/lib/approval-store';
import { useAuditStore } from '@/lib/audit-store';
import { Toaster } from 'sonner';

// Placeholder component for pages not yet built
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="rounded-xl border border-dashed border-[var(--border)] p-12 max-w-md">
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">{title}</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          This page will be built in the next phase.
        </p>
      </div>
    </div>
  );
}

function ProtectedRoutes() {
  const { currentUser, notifications, setNotifications } = useAppStore();
  const [location] = useLocation();

  const initializeMockData = useApprovalStore((s) => s.initializeMockData);
  const initializeAuditData = useAuditStore((s) => s.initializeMockData);

  // Auto-load notifications when user is logged in but notifications are empty
  // (e.g. after a page refresh — notifications are not persisted in localStorage)
  useEffect(() => {
    if (currentUser && notifications.length === 0) {
      import('@/data/notifications').then((mod) => {
        setNotifications(mod.notifications);
      }).catch(() => {});
    }
  }, [currentUser, notifications.length, setNotifications]);

  // Initialize approval + audit mock data
  useEffect(() => {
    if (currentUser) {
      initializeMockData();
      initializeAuditData();
    }
  }, [currentUser, initializeMockData, initializeAuditData]);

  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  // Redirect root to dashboard
  if (location === '/') {
    return <Redirect to="/dashboard" />;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/dashboard" component={DashboardPage} />

        {/* Employee Management */}
        <Route path="/employees" component={EmployeesPage} />
        <Route path="/employees/new" component={AddEmployeePage} />
        <Route path="/employees/transfers" component={TransfersPage} />
        <Route path="/employees/:id" component={EmployeeDetailPage} />

        {/* Recruitment */}
        <Route path="/recruitment">{() => <Redirect to="/recruitment/jobs" />}</Route>
        <Route path="/recruitment/jobs" component={JobPostingsPage} />
        <Route path="/recruitment/applications" component={ApplicationsPage} />
        <Route path="/recruitment/onboarding" component={OnboardingPage} />

        {/* Training */}
        <Route path="/training">{() => <Redirect to="/training/modules" />}</Route>
        <Route path="/training/modules" component={TrainingModulesPage} />
        <Route path="/training/assign" component={AssignTrainingPage} />
        <Route path="/training/certifications" component={CertificationsPage} />

        {/* Performance */}
        <Route path="/performance">{() => <Redirect to="/performance/kpi" />}</Route>
        <Route path="/performance/kpi" component={KpiDashboardPage} />
        <Route path="/performance/sales-targets" component={SalesTargetsPage} />
        <Route path="/performance/reviews" component={PerformanceReviewsPage} />
        <Route path="/performance/evaluations" component={EvaluationsPage} />

        {/* Operations */}
        <Route path="/operations">{() => <Redirect to="/operations/shifts" />}</Route>
        <Route path="/operations/shifts" component={ShiftsPage} />
        <Route path="/operations/attendance" component={AttendancePage} />
        <Route path="/operations/activity-log" component={ActivityLogPage} />
        <Route path="/operations/incidents" component={IncidentsPage} />

        {/* Approvals */}
        <Route path="/approvals">{() => <Redirect to="/approvals/pending" />}</Route>
        <Route path="/approvals/pending" component={ApprovalsQueuePage} />
        <Route path="/approvals/my-requests" component={MyRequestsPage} />
        <Route path="/approvals/all" component={AllRequestsPage} />
        <Route path="/approvals/:id" component={ApprovalDetailPage} />

        {/* Compensation */}
        <Route path="/compensation">{() => <Redirect to="/compensation/salary" />}</Route>
        <Route path="/compensation/salary" component={SalaryRecordsPage} />
        <Route path="/compensation/bonuses" component={BonusesPage} />
        <Route path="/compensation/pay-history" component={PayHistoryPage} />

        {/* Audit Log */}
        <Route path="/audit-log" component={AuditLogPage} />

        {/* Reports, Stations, Documents, Notifications, Settings */}
        <Route path="/reports" component={ReportsPage} />
        <Route path="/stations" component={StationsPage} />
        <Route path="/stations/:id">{() => <PlaceholderPage title="Station Detail" />}</Route>
        <Route path="/documents" component={DocumentLibraryPage} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/settings" component={SettingsPage} />

        {/* 404 */}
        <Route>{() => <PlaceholderPage title="Page Not Found" />}</Route>
      </Switch>
    </AppLayout>
  );
}

export default function App() {
  return (
    <>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route>{() => <ProtectedRoutes />}</Route>
      </Switch>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </>
  );
}
