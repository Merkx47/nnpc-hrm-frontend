import type { Role } from '@/types';
import { useAppStore } from '@/lib/store';

// Actions that can be checked
export type Permission =
  | 'create_employee'
  | 'edit_employee'
  | 'delete_employee'
  | 'view_all_employees'
  | 'create_job_posting'
  | 'advance_application'
  | 'manage_onboarding'
  | 'complete_onboarding'
  | 'approve_transfer'
  | 'manage_shifts'
  | 'view_compensation'
  | 'manage_compensation'
  | 'create_incident'
  | 'manage_training'
  | 'view_reports'
  | 'manage_settings'
  | 'view_kpi'
  | 'manage_evaluations';

const ALL_PERMISSIONS: Permission[] = [
  'create_employee',
  'edit_employee',
  'delete_employee',
  'view_all_employees',
  'create_job_posting',
  'advance_application',
  'manage_onboarding',
  'complete_onboarding',
  'approve_transfer',
  'manage_shifts',
  'view_compensation',
  'manage_compensation',
  'create_incident',
  'manage_training',
  'view_reports',
  'manage_settings',
  'view_kpi',
  'manage_evaluations',
];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ALL_PERMISSIONS,

  regional_manager: [
    'view_all_employees',
    'advance_application',
    'approve_transfer',
    'view_compensation',
    'view_reports',
    'view_kpi',
    'manage_evaluations',
    'manage_training',
  ],

  branch_manager: [
    'view_all_employees',
    'advance_application',
    'approve_transfer',
    'view_compensation',
    'view_reports',
    'view_kpi',
    'manage_training',
  ],

  dealer: [
    'create_employee',
    'edit_employee',
    'view_all_employees',
    'create_job_posting',
    'advance_application',
    'manage_onboarding',
    'complete_onboarding',
    'manage_shifts',
    'view_compensation',
    'manage_compensation',
    'create_incident',
    'manage_training',
    'view_kpi',
  ],

  supervisor: [
    'view_all_employees',
    'manage_shifts',
    'create_incident',
    'manage_training',
    'view_kpi',
  ],

  attendant: [
    'create_incident',
  ],
};

/**
 * Check whether a given role has a specific permission.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * React hook that checks a permission against the current user's role
 * from the app store. Returns `false` if no user is logged in.
 */
export function usePermission(permission: Permission): boolean {
  const role = useAppStore((s) => s.currentUser?.role);
  if (!role) return false;
  return hasPermission(role, permission);
}

/** Returns all permissions granted to a role (used by RBAC matrix display). */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
