export type Role = 'admin' | 'regional_manager' | 'branch_manager' | 'dealer' | 'supervisor' | 'attendant';

export type EmploymentStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';

export type IDType = 'NIN' | 'Voters Card' | 'Drivers License' | 'Passport';

export type ShiftType = 'morning' | 'afternoon' | 'night';

export type LeaveType = 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type IncidentType = 'safety' | 'fuel_discrepancy' | 'customer_complaint' | 'equipment_malfunction' | 'other';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'reported' | 'under_review' | 'resolved';

export type ApplicationStatus = 'applied' | 'screening' | 'shortlisted' | 'interview' | 'offered' | 'onboarding' | 'hired' | 'rejected';

export type TrainingStatus = 'assigned' | 'in_progress' | 'completed' | 'overdue';

export type TransferStatus = 'requested' | 'approved' | 'completed' | 'rejected';

export type NotificationType =
  | 'underperformance'
  | 'absence'
  | 'missing_log'
  | 'training_overdue'
  | 'certification_expiry'
  | 'shift_assignment'
  | 'promotion_eligible'
  | 'new_application';

export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success';

export interface ContactInfo {
  name: string;
  phone: string;
  relationship: string;
}

export interface EmploymentHistoryEntry {
  id: string;
  date: string;
  action: 'hired' | 'transferred' | 'promoted' | 'role_change' | 'status_change';
  fromStation?: string;
  toStation?: string;
  fromRole?: Role;
  toRole?: Role;
  details: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  photo?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  stateOfOrigin: string;
  lga: string;
  address: string;
  nextOfKin: ContactInfo;
  emergencyContact: ContactInfo;
  idType: IDType;
  idNumber: string;
  role: Role;
  stationId: string;
  dealerId: string;
  dealerName: string;
  employmentStatus: EmploymentStatus;
  yearOfEmployment: number;
  employmentHistory: EmploymentHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  region: string;
  branch: string;
  dealerId: string;
  dealerName: string;
  status: 'active' | 'inactive';
  employeeCount: number;
  coordinates: { lng: number; lat: number };
}

export interface Region {
  id: string;
  name: string;
  states: string[];
  branches: Branch[];
}

export interface Branch {
  id: string;
  name: string;
  regionId: string;
  stationIds: string[];
}

export interface TrainingModule {
  id: string;
  name: string;
  description: string;
  category: string;
  durationHours: number;
  mandatory: boolean;
}

export interface TrainingAssignment {
  id: string;
  employeeId: string;
  moduleId: string;
  assignedDate: string;
  deadline: string;
  completionDate?: string;
  score?: number;
  status: TrainingStatus;
}

export interface Certification {
  id: string;
  employeeId: string;
  name: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  stationId: string;
  stationName: string;
  requirements: string[];
  postedBy: string;
  postedDate: string;
  deadline: string;
  status: 'open' | 'closed';
  applicationsCount: number;
}

export interface Application {
  id: string;
  jobPostingId: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string;
  appliedDate: string;
  status: ApplicationStatus;
  positionTitle: string;
  stationName: string;
}

export interface ShiftEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  stationId: string;
  date: string;
  shift: ShiftType;
  pumpAssignment: string;
  checkInTime?: string;
  checkOutTime?: string;
  salesFigure: number;
  hoursWorked: number;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'on_leave' | 'holiday';
  checkIn?: string;
  checkOut?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
}

export interface SalesTarget {
  id: string;
  employeeId: string;
  employeeName: string;
  stationId: string;
  product: string;
  targetAmount: number;
  actualAmount: number;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  reviewPeriod: string;
  salesRating: number;
  punctualityRating: number;
  customerServiceRating: number;
  teamworkRating: number;
  trainingRating: number;
  overallRating: number;
  comments: string;
  date: string;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: Role;
  stationName: string;
  baseSalary: number;
  transportAllowance: number;
  housingAllowance: number;
  otherAllowances: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  month: string;
  year: number;
}

export interface Incident {
  id: string;
  reportedBy: string;
  reporterName: string;
  stationId: string;
  stationName: string;
  type: IncidentType;
  severity: Severity;
  description: string;
  date: string;
  time: string;
  status: IncidentStatus;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  type: 'National ID' | 'Passport Photo' | 'Employment Contract' | 'Certificate' | 'Training Completion' | 'Other';
  name: string;
  uploadDate: string;
  fileSize: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
  read: boolean;
  createdAt: string;
}

export interface Transfer {
  id: string;
  employeeId: string;
  employeeName: string;
  fromStationId: string;
  fromStationName: string;
  toStationId: string;
  toStationName: string;
  reason: string;
  requestDate: string;
  effectiveDate: string;
  status: TransferStatus;
}

export interface User {
  id: string;
  employee: Employee;
  role: Role;
}

// ── Maker-Checker Approval Types ──────────────────────────────────

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'returned';

export type ApprovalActionType =
  | 'create_employee'
  | 'edit_employee'
  | 'transfer_employee'
  | 'create_shift'
  | 'create_leave_request'
  | 'create_transfer'
  | 'create_training_assignment'
  | 'create_incident'
  | 'create_review'
  | 'create_sales_target';

export interface ApprovalNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  note: string;
  action: 'submitted' | 'approved' | 'rejected' | 'returned' | 'resubmitted';
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  actionType: ApprovalActionType;
  actionLabel: string;
  submittedById: string;
  submittedByName: string;
  submittedByRole: Role;
  submittedAt: string;
  reviewerRole: Role;
  reviewerId?: string;
  reviewerName?: string;
  stationId?: string;
  payload: Record<string, unknown>;
  status: ApprovalStatus;
  notes: ApprovalNote[];
  updatedAt: string;
}
