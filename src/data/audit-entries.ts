import type { AuditEntry } from '@/lib/audit-store';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 12) + 7, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

export const auditEntries: AuditEntry[] = [
  { id: 'AUD-001', timestamp: daysAgo(0), userId: 'NRL-2024-000001', userName: 'Adebayo Okonkwo', userRole: 'admin', action: 'login', module: 'auth', description: 'Logged in via credentials', ipAddress: '192.168.1.10' },
  { id: 'AUD-002', timestamp: daysAgo(0), userId: 'NRL-2024-000156', userName: 'Ngozi Okafor', userRole: 'supervisor', action: 'login', module: 'auth', description: 'Logged in via credentials', ipAddress: '192.168.1.45' },
  { id: 'AUD-003', timestamp: daysAgo(0), userId: 'NRL-2024-000001', userName: 'Adebayo Okonkwo', userRole: 'admin', action: 'approve', module: 'approvals', description: 'Approved leave request', targetId: 'APR-001', targetName: 'Emeka Nwankwo - Annual Leave' },
  { id: 'AUD-004', timestamp: daysAgo(0), userId: 'NRL-2024-000156', userName: 'Ngozi Okafor', userRole: 'supervisor', action: 'create', module: 'incidents', description: 'Created incident report for fuel discrepancy', targetId: 'INC-045', targetName: 'Fuel Discrepancy - Pump 3' },
  { id: 'AUD-005', timestamp: daysAgo(1), userId: 'NRL-2022-000088', userName: 'Alhaji Musa Ibrahim', userRole: 'dealer', action: 'login', module: 'auth', description: 'Logged in via Active Directory SSO', ipAddress: '10.0.0.52' },
  { id: 'AUD-006', timestamp: daysAgo(1), userId: 'NRL-2022-000088', userName: 'Alhaji Musa Ibrahim', userRole: 'dealer', action: 'create', module: 'shifts', description: 'Assigned morning shift to Emeka Nwankwo', targetId: 'SHF-089', targetName: 'Morning Shift - STN-001' },
  { id: 'AUD-007', timestamp: daysAgo(1), userId: 'NRL-2024-000001', userName: 'Adebayo Okonkwo', userRole: 'admin', action: 'export', module: 'employees', description: 'Exported employee list as XLSX', ipAddress: '192.168.1.10' },
  { id: 'AUD-008', timestamp: daysAgo(1), userId: 'NRL-2023-000015', userName: 'Fatima Abdullahi', userRole: 'regional_manager', action: 'login', module: 'auth', description: 'Logged in via credentials', ipAddress: '10.0.1.15' },
  { id: 'AUD-009', timestamp: daysAgo(1), userId: 'NRL-2023-000015', userName: 'Fatima Abdullahi', userRole: 'regional_manager', action: 'approve', module: 'approvals', description: 'Approved employee transfer request', targetId: 'APR-006', targetName: 'Transfer - Chinedu Eze to STN-005' },
  { id: 'AUD-010', timestamp: daysAgo(2), userId: 'NRL-2025-000312', userName: 'Emeka Nwankwo', userRole: 'attendant', action: 'login', module: 'auth', description: 'Logged in via credentials', ipAddress: '192.168.2.80' },
  { id: 'AUD-011', timestamp: daysAgo(2), userId: 'NRL-2024-000001', userName: 'Adebayo Okonkwo', userRole: 'admin', action: 'create', module: 'employees', description: 'Created new employee record', targetId: 'NRL-2026-000400', targetName: 'Aisha Mohammed' },
  { id: 'AUD-012', timestamp: daysAgo(2), userId: 'NRL-2024-000001', userName: 'Adebayo Okonkwo', userRole: 'admin', action: 'update', module: 'settings', description: 'Updated system notification preferences' },
  { id: 'AUD-013', timestamp: daysAgo(3), userId: 'NRL-2023-000042', userName: 'Chinedu Eze', userRole: 'branch_manager', action: 'login', module: 'auth', description: 'Logged in via Active Directory SSO', ipAddress: '10.0.0.88' },
  { id: 'AUD-014', timestamp: daysAgo(3), userId: 'NRL-2023-000042', userName: 'Chinedu Eze', userRole: 'branch_manager', action: 'reject', module: 'approvals', description: 'Rejected overtime request - insufficient documentation', targetId: 'APR-012', targetName: 'Overtime Request - Ibrahim Musa' },
  { id: 'AUD-015', timestamp: daysAgo(3), userId: 'NRL-2022-000088', userName: 'Alhaji Musa Ibrahim', userRole: 'dealer', action: 'create', module: 'training', description: 'Assigned fire safety training', targetId: 'TRN-034', targetName: 'Fire Safety - Batch Q1 2026' },
  { id: 'AUD-016', timestamp: daysAgo(4), userId: 'NRL-2024-000001', userName: 'Adebayo Okonkwo', userRole: 'admin', action: 'login', module: 'auth', description: 'Logged in via credentials', ipAddress: '192.168.1.10' },
  { id: 'AUD-017', timestamp: daysAgo(4), userId: 'NRL-2024-000001', userName: 'Adebayo Okonkwo', userRole: 'admin', action: 'delete', module: 'employees', description: 'Terminated employee record', targetId: 'NRL-2023-000199', targetName: 'Yusuf Bello' },
  { id: 'AUD-018', timestamp: daysAgo(4), userId: 'NRL-2024-000156', userName: 'Ngozi Okafor', userRole: 'supervisor', action: 'create', module: 'performance', description: 'Submitted performance review', targetId: 'REV-078', targetName: 'Q4 2025 Review - Emeka Nwankwo' },
  { id: 'AUD-019', timestamp: daysAgo(5), userId: 'NRL-2023-000015', userName: 'Fatima Abdullahi', userRole: 'regional_manager', action: 'export', module: 'performance', description: 'Exported KPI dashboard as PDF', ipAddress: '10.0.1.15' },
  { id: 'AUD-020', timestamp: daysAgo(5), userId: 'NRL-2022-000088', userName: 'Alhaji Musa Ibrahim', userRole: 'dealer', action: 'login', module: 'auth', description: 'Logged in via credentials', ipAddress: '10.0.0.52' },
  { id: 'AUD-021', timestamp: daysAgo(6), userId: 'NRL-2024-000001', userName: 'Adebayo Okonkwo', userRole: 'admin', action: 'return', module: 'approvals', description: 'Returned transfer request for corrections', targetId: 'APR-009', targetName: 'Transfer - Grace Eze to STN-012' },
  { id: 'AUD-022', timestamp: daysAgo(7), userId: 'NRL-2024-000156', userName: 'Ngozi Okafor', userRole: 'supervisor', action: 'create', module: 'attendance', description: 'Submitted leave request for annual leave', targetId: 'LV-056', targetName: 'Annual Leave - 5 days' },
  { id: 'AUD-023', timestamp: daysAgo(7), userId: 'NRL-2023-000042', userName: 'Chinedu Eze', userRole: 'branch_manager', action: 'approve', module: 'approvals', description: 'Approved training assignment', targetId: 'APR-015', targetName: 'Customer Service Training Batch' },
  { id: 'AUD-024', timestamp: daysAgo(8), userId: 'NRL-2024-000001', userName: 'Adebayo Okonkwo', userRole: 'admin', action: 'export', module: 'compensation', description: 'Exported salary records as CSV', ipAddress: '192.168.1.10' },
  { id: 'AUD-025', timestamp: daysAgo(10), userId: 'NRL-2022-000088', userName: 'Alhaji Musa Ibrahim', userRole: 'dealer', action: 'create', module: 'employees', description: 'Submitted new employee registration', targetId: 'NRL-2026-000401', targetName: 'Fatima Bello' },
  { id: 'AUD-026', timestamp: daysAgo(12), userId: 'NRL-2024-000001', userName: 'Adebayo Okonkwo', userRole: 'admin', action: 'login', module: 'auth', description: 'Logged in via Active Directory SSO', ipAddress: '192.168.1.10' },
  { id: 'AUD-027', timestamp: daysAgo(12), userId: 'NRL-2024-000001', userName: 'Adebayo Okonkwo', userRole: 'admin', action: 'update', module: 'compensation', description: 'Updated bonus allocation for Q4 2025' },
  { id: 'AUD-028', timestamp: daysAgo(14), userId: 'NRL-2023-000015', userName: 'Fatima Abdullahi', userRole: 'regional_manager', action: 'login', module: 'auth', description: 'Logged in via credentials', ipAddress: '10.0.1.15' },
  { id: 'AUD-029', timestamp: daysAgo(14), userId: 'NRL-2023-000015', userName: 'Fatima Abdullahi', userRole: 'regional_manager', action: 'approve', module: 'approvals', description: 'Approved incident resolution report', targetId: 'APR-020', targetName: 'Equipment Malfunction - STN-005' },
  { id: 'AUD-030', timestamp: daysAgo(18), userId: 'NRL-2024-000156', userName: 'Ngozi Okafor', userRole: 'supervisor', action: 'create', module: 'shifts', description: 'Created shift assignment for afternoon shift', targetId: 'SHF-092', targetName: 'Afternoon Shift - Emeka Nwankwo' },
  { id: 'AUD-031', timestamp: daysAgo(20), userId: 'NRL-2024-000001', userName: 'Adebayo Okonkwo', userRole: 'admin', action: 'delete', module: 'incidents', description: 'Removed duplicate incident report', targetId: 'INC-039', targetName: 'Duplicate - Customer Complaint' },
  { id: 'AUD-032', timestamp: daysAgo(22), userId: 'NRL-2022-000088', userName: 'Alhaji Musa Ibrahim', userRole: 'dealer', action: 'export', module: 'shifts', description: 'Exported shift schedule as PDF' },
  { id: 'AUD-033', timestamp: daysAgo(25), userId: 'NRL-2023-000042', userName: 'Chinedu Eze', userRole: 'branch_manager', action: 'login', module: 'auth', description: 'Logged in via credentials', ipAddress: '10.0.0.88' },
  { id: 'AUD-034', timestamp: daysAgo(25), userId: 'NRL-2023-000042', userName: 'Chinedu Eze', userRole: 'branch_manager', action: 'create', module: 'performance', description: 'Set sales target for January 2026', targetId: 'TGT-045', targetName: 'Sales Target - STN-001 Jan 2026' },
  { id: 'AUD-035', timestamp: daysAgo(28), userId: 'NRL-2024-000001', userName: 'Adebayo Okonkwo', userRole: 'admin', action: 'logout', module: 'auth', description: 'Logged out', ipAddress: '192.168.1.10' },
];
