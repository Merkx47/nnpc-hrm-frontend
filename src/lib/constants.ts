import type { Role, ShiftType, LeaveType, IncidentType, Severity, ApplicationStatus, TrainingStatus, NotificationType, ApprovalStatus, ApprovalActionType } from '@/types';

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Super Admin',
  regional_manager: 'Regional Manager',
  branch_manager: 'Branch Manager',
  dealer: 'Dealer',
  supervisor: 'Supervisor',
  attendant: 'Attendant',
};

export const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  regional_manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  branch_manager: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  dealer: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  supervisor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  attendant: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300',
};

export const EMPLOYMENT_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300',
  on_leave: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  terminated: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const SHIFT_LABELS: Record<ShiftType, string> = {
  morning: 'Morning (6AM - 2PM)',
  afternoon: 'Afternoon (2PM - 10PM)',
  night: 'Night (10PM - 6AM)',
};

export const SHIFT_COLORS: Record<ShiftType, string> = {
  morning: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  afternoon: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  night: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

export const LEAVE_LABELS: Record<LeaveType, string> = {
  sick: 'Sick Leave',
  vacation: 'Vacation',
  personal: 'Personal',
  maternity: 'Maternity',
  paternity: 'Paternity',
};

export const INCIDENT_LABELS: Record<IncidentType, string> = {
  safety: 'Safety Issue',
  fuel_discrepancy: 'Fuel Discrepancy',
  customer_complaint: 'Customer Complaint',
  equipment_malfunction: 'Equipment Malfunction',
  other: 'Other',
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  screening: 'Screening',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offered: 'Offered',
  onboarding: 'Onboarding',
  hired: 'Hired',
  rejected: 'Rejected',
};

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300',
  screening: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  shortlisted: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  offered: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  onboarding: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  hired: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const TRAINING_STATUS_COLORS: Record<TrainingStatus, string> = {
  assigned: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  underperformance: 'Underperformance',
  absence: 'Absence',
  missing_log: 'Missing Log',
  training_overdue: 'Training Overdue',
  certification_expiry: 'Certification Expiry',
  shift_assignment: 'Shift Assignment',
  promotion_eligible: 'Promotion Eligible',
  new_application: 'New Application',
};

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  underperformance: 'text-red-500',
  absence: 'text-orange-500',
  missing_log: 'text-orange-500',
  training_overdue: 'text-amber-500',
  certification_expiry: 'text-amber-500',
  shift_assignment: 'text-blue-500',
  promotion_eligible: 'text-green-500',
  new_application: 'text-blue-500',
};

export const TRAINING_CATEGORIES = [
  'Safety',
  'Customer Service',
  'Fuel Handling',
  'Lubricant Sales',
  'Equipment Operation',
  'Emergency Procedures',
] as const;

export const LUBRICANT_PRODUCTS = [
  'NNPC Engine Oil SAE 40',
  'NNPC Motor Oil 20W-50',
  'NNPC Gear Oil 90',
  'NNPC Hydraulic Oil',
  'NNPC Brake Fluid DOT 3',
  'NNPC Transmission Fluid',
] as const;

// ── Approval Queue Labels & Colors ────────────────────────────────

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  returned: 'Returned',
};

export const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  returned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

export const APPROVAL_ACTION_LABELS: Record<ApprovalActionType, string> = {
  create_employee: 'New Employee',
  edit_employee: 'Edit Employee',
  delete_employee: 'Terminate Employee',
  transfer_employee: 'Quick Transfer',
  create_shift: 'Shift Assignment',
  delete_shift: 'Remove Shift',
  create_leave_request: 'Leave Request',
  delete_leave_request: 'Cancel Leave',
  create_transfer: 'Employee Transfer',
  delete_transfer: 'Cancel Transfer',
  create_training_assignment: 'Training Assignment',
  delete_training_assignment: 'Remove Training',
  create_incident: 'Incident Report',
  delete_incident: 'Remove Incident',
  create_review: 'Performance Review',
  delete_review: 'Remove Review',
  create_sales_target: 'Sales Target',
  delete_sales_target: 'Remove Sales Target',
};

// Navigation items with role-based visibility
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  roles: Role[];
  children?: NavItem[];
}

export const SIDEBAR_NAV: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor', 'attendant'],
  },
  {
    label: 'Employees',
    href: '/employees',
    icon: 'Users',
    roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor'],
    children: [
      { label: 'All Employees', href: '/employees', icon: 'Users', roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor'] },
      { label: 'Add Employee', href: '/employees/new', icon: 'UserPlus', roles: ['admin', 'dealer'] },
      { label: 'Transfers', href: '/employees/transfers', icon: 'ArrowLeftRight', roles: ['admin', 'regional_manager', 'branch_manager'] },
    ],
  },
  {
    label: 'Recruitment',
    href: '/recruitment/jobs',
    icon: 'Briefcase',
    roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor'],
    children: [
      { label: 'Job Postings', href: '/recruitment/jobs', icon: 'Briefcase', roles: ['admin', 'dealer', 'regional_manager', 'branch_manager', 'supervisor'] },
      { label: 'Applications', href: '/recruitment/applications', icon: 'FileText', roles: ['admin', 'dealer', 'supervisor', 'regional_manager', 'branch_manager'] },
      { label: 'Onboarding', href: '/recruitment/onboarding', icon: 'ClipboardCheck', roles: ['admin', 'dealer', 'supervisor'] },
    ],
  },
  {
    label: 'Training',
    href: '/training/modules',
    icon: 'GraduationCap',
    roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor', 'attendant'],
    children: [
      { label: 'Modules', href: '/training/modules', icon: 'BookOpen', roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor', 'attendant'] },
      { label: 'Assign Training', href: '/training/assign', icon: 'ClipboardList', roles: ['admin', 'dealer', 'supervisor'] },
      { label: 'Certifications', href: '/training/certifications', icon: 'Award', roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor'] },
    ],
  },
  {
    label: 'Performance',
    href: '/performance/kpi',
    icon: 'TrendingUp',
    roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor'],
    children: [
      { label: 'KPI Dashboard', href: '/performance/kpi', icon: 'BarChart3', roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor'] },
      { label: 'Sales Targets', href: '/performance/sales-targets', icon: 'Target', roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor'] },
      { label: 'Reviews', href: '/performance/reviews', icon: 'ClipboardCheck', roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor'] },
      { label: 'Evaluations', href: '/performance/evaluations', icon: 'Star', roles: ['admin', 'regional_manager', 'branch_manager'] },
    ],
  },
  {
    label: 'Operations',
    href: '/operations/shifts',
    icon: 'Clock',
    roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor', 'attendant'],
    children: [
      { label: 'Shifts', href: '/operations/shifts', icon: 'Calendar', roles: ['admin', 'dealer', 'supervisor', 'attendant', 'regional_manager', 'branch_manager'] },
      { label: 'Attendance', href: '/operations/attendance', icon: 'CalendarCheck', roles: ['admin', 'dealer', 'supervisor', 'regional_manager', 'branch_manager'] },
      { label: 'Activity Log', href: '/operations/activity-log', icon: 'Activity', roles: ['admin', 'dealer', 'supervisor', 'attendant', 'regional_manager', 'branch_manager'] },
      { label: 'Incidents', href: '/operations/incidents', icon: 'AlertTriangle', roles: ['admin', 'dealer', 'supervisor', 'attendant', 'regional_manager', 'branch_manager'] },
    ],
  },
  {
    label: 'Approvals',
    href: '/approvals',
    icon: 'ShieldCheck',
    roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor', 'attendant'],
    children: [
      { label: 'Pending Review', href: '/approvals/pending', icon: 'ClipboardCheck', roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor'] },
      { label: 'My Requests', href: '/approvals/my-requests', icon: 'ClipboardList', roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor', 'attendant'] },
      { label: 'All Requests', href: '/approvals/all', icon: 'ShieldCheck', roles: ['admin'] },
    ],
  },
  {
    label: 'Audit Log',
    href: '/audit-log',
    icon: 'FileText',
    roles: ['admin', 'regional_manager'],
  },
  {
    label: 'Compensation',
    href: '/compensation/salary',
    icon: 'Wallet',
    roles: ['admin', 'regional_manager', 'branch_manager', 'dealer'],
    children: [
      { label: 'Salary Records', href: '/compensation/salary', icon: 'Wallet', roles: ['admin', 'regional_manager', 'branch_manager', 'dealer'] },
      { label: 'Bonuses', href: '/compensation/bonuses', icon: 'Gift', roles: ['admin', 'regional_manager', 'branch_manager', 'dealer'] },
      { label: 'Pay History', href: '/compensation/pay-history', icon: 'Receipt', roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'attendant'] },
    ],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: 'BarChart3',
    roles: ['admin', 'regional_manager', 'branch_manager', 'dealer'],
  },
  {
    label: 'Stations',
    href: '/stations',
    icon: 'MapPin',
    roles: ['admin', 'regional_manager', 'branch_manager'],
  },
  {
    label: 'Documents',
    href: '/documents',
    icon: 'FolderOpen',
    roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor'],
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: 'Bell',
    roles: ['admin', 'regional_manager', 'branch_manager', 'dealer', 'supervisor', 'attendant'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'Settings',
    roles: ['admin'],
  },
];
