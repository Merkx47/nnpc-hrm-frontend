import type { Role } from '@/types';

const APPROVAL_CHAIN: Record<Role, Role | 'self'> = {
  attendant: 'supervisor',
  supervisor: 'dealer',
  dealer: 'branch_manager',
  branch_manager: 'regional_manager',
  regional_manager: 'admin',
  admin: 'self',
};

export function getApproverRole(submitterRole: Role): Role | 'self' {
  return APPROVAL_CHAIN[submitterRole];
}

export function isReviewerFor(reviewerRole: Role, submitterRole: Role): boolean {
  return APPROVAL_CHAIN[submitterRole] === reviewerRole;
}
