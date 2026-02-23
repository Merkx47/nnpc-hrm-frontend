import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Employee, Transfer, ShiftEntry, LeaveRequest,
  Incident, TrainingAssignment, PerformanceReview, SalesTarget,
  ApprovalRequest, Role, IDType, ShiftType, LeaveType,
  IncidentType, Severity, TrainingStatus,
} from '@/types';
import { stations } from '@/data/stations';

/* ── ID generators ───────────────────────────────── */
let seqCounter = Date.now();
function seq() { return String(++seqCounter).slice(-6); }
function empId() { return `NRL-2026-${seq()}`; }
function trfId() { return `TRF-${seq()}`; }
function shfId() { return `SHF-${seq()}`; }
function lrId() { return `LR-${seq()}`; }
function incId() { return `INC-${seq()}`; }
function taId() { return `TA-${seq()}`; }
function prId() { return `PR-${seq()}`; }
function stId() { return `ST-${seq()}`; }

function today() { return new Date().toISOString().slice(0, 10); }

/* ── Store Interface ─────────────────────────────── */

interface DataState {
  addedEmployees: Employee[];
  addedTransfers: Transfer[];
  addedShifts: ShiftEntry[];
  addedLeaveRequests: LeaveRequest[];
  addedIncidents: Incident[];
  addedTrainingAssignments: TrainingAssignment[];
  addedReviews: PerformanceReview[];
  addedSalesTargets: SalesTarget[];

  // Deleted IDs — works for both static mock data and dynamically created data
  deletedEmployeeIds: string[];
  deletedTransferIds: string[];
  deletedShiftIds: string[];
  deletedLeaveRequestIds: string[];
  deletedIncidentIds: string[];
  deletedTrainingAssignmentIds: string[];
  deletedReviewIds: string[];
  deletedSalesTargetIds: string[];

  applyApprovedRequest: (request: ApprovalRequest) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      addedEmployees: [],
      addedTransfers: [],
      addedShifts: [],
      addedLeaveRequests: [],
      addedIncidents: [],
      addedTrainingAssignments: [],
      addedReviews: [],
      addedSalesTargets: [],

      deletedEmployeeIds: [],
      deletedTransferIds: [],
      deletedShiftIds: [],
      deletedLeaveRequestIds: [],
      deletedIncidentIds: [],
      deletedTrainingAssignmentIds: [],
      deletedReviewIds: [],
      deletedSalesTargetIds: [],

      applyApprovedRequest: (req: ApprovalRequest) => {
        const p = req.payload;

        switch (req.actionType) {
          case 'create_employee': {
            const station = stations.find((s) => s.id === (p.stationId as string));
            const emp: Employee = {
              id: empId(),
              firstName: (p.firstName as string) || '',
              lastName: (p.lastName as string) || '',
              middleName: (p.middleName as string) || undefined,
              email: (p.email as string) || '',
              phone: (p.phone as string) || '',
              dateOfBirth: (p.dateOfBirth as string) || '',
              gender: (p.gender as 'Male' | 'Female') || 'Male',
              stateOfOrigin: (p.stateOfOrigin as string) || '',
              lga: (p.lga as string) || '',
              address: (p.address as string) || '',
              nextOfKin: {
                name: (p.nextOfKinName as string) || '',
                phone: (p.nextOfKinPhone as string) || '',
                relationship: (p.nextOfKinRelationship as string) || '',
              },
              emergencyContact: {
                name: (p.emergencyName as string) || '',
                phone: (p.emergencyPhone as string) || '',
                relationship: (p.emergencyRelationship as string) || '',
              },
              idType: (p.idType as IDType) || 'NIN',
              idNumber: (p.idNumber as string) || '',
              role: (p.role as Role) || 'attendant',
              stationId: (p.stationId as string) || station?.id || '',
              dealerId: station?.dealerId || '',
              dealerName: station?.dealerName || '',
              employmentStatus: 'active',
              yearOfEmployment: Number(p.yearOfEmployment) || new Date().getFullYear(),
              employmentHistory: [{
                id: `EH-${seq()}`,
                date: today(),
                action: 'hired',
                details: 'Employee created via approval system',
              }],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            set((s) => ({ addedEmployees: [...s.addedEmployees, emp] }));
            break;
          }

          case 'create_transfer':
          case 'transfer_employee': {
            const transfer: Transfer = {
              id: trfId(),
              employeeId: (p.employeeId as string) || '',
              employeeName: (p.employeeName as string) || '',
              fromStationId: (p.fromStationId as string) || '',
              fromStationName: (p.fromStationName as string) || '',
              toStationId: (p.toStationId as string) || '',
              toStationName: (p.toStationName as string) || '',
              reason: (p.reason as string) || '',
              requestDate: today(),
              effectiveDate: (p.effectiveDate as string) || today(),
              status: 'approved',
            };
            set((s) => ({ addedTransfers: [...s.addedTransfers, transfer] }));
            break;
          }

          case 'create_shift': {
            const stn = stations.find((s) => s.name === (p.station as string));
            const shift: ShiftEntry = {
              id: shfId(),
              employeeId: (p.employeeId as string) || '',
              employeeName: (p.employeeName as string) || '',
              stationId: (p.stationId as string) || stn?.id || req.stationId || '',
              date: (p.date as string) || today(),
              shift: (p.shift as ShiftType) || 'morning',
              pumpAssignment: (p.pump as string) || '',
              salesFigure: 0,
              hoursWorked: 0,
            };
            set((s) => ({ addedShifts: [...s.addedShifts, shift] }));
            break;
          }

          case 'create_leave_request': {
            const lr: LeaveRequest = {
              id: lrId(),
              employeeId: req.submittedById,
              employeeName: req.submittedByName,
              type: (p.type as LeaveType) || 'personal',
              startDate: (p.startDate as string) || today(),
              endDate: (p.endDate as string) || today(),
              days: (p.days as number) || 1,
              reason: (p.reason as string) || '',
              status: 'approved',
            };
            set((s) => ({ addedLeaveRequests: [...s.addedLeaveRequests, lr] }));
            break;
          }

          case 'create_incident': {
            const incStationId = (p.stationId as string) || req.stationId || '';
            const stationObj = stations.find((s) => s.id === incStationId);
            const inc: Incident = {
              id: incId(),
              reportedBy: req.submittedById,
              reporterName: req.submittedByName,
              stationId: incStationId,
              stationName: (p.stationName as string) || stationObj?.name || '',
              type: (p.type as IncidentType) || 'other',
              severity: (p.severity as Severity) || 'low',
              description: (p.description as string) || '',
              date: (p.date as string) || today(),
              time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
              status: 'reported',
            };
            set((s) => ({ addedIncidents: [...s.addedIncidents, inc] }));
            break;
          }

          case 'create_training_assignment': {
            const employeeIds = (p.employeeIds as string[]) || [];
            const deadline = (p.deadline as string) || '';
            const moduleId = (p.moduleId as string) || '';
            const newAssignments: TrainingAssignment[] = employeeIds.map((eId) => ({
              id: taId(),
              employeeId: eId,
              moduleId,
              assignedDate: today(),
              deadline,
              status: 'assigned' as TrainingStatus,
            }));
            set((s) => ({
              addedTrainingAssignments: [...s.addedTrainingAssignments, ...newAssignments],
            }));
            break;
          }

          case 'create_review': {
            const salesR = Number(p.sales) || 0;
            const punctR = Number(p.punctuality) || 0;
            const custR = Number(p.customerService) || 0;
            const teamR = Number(p.teamwork) || 0;
            const trainR = Number(p.training) || 0;
            const overall = Number(((salesR + punctR + custR + teamR + trainR) / 5).toFixed(1));
            const review: PerformanceReview = {
              id: prId(),
              employeeId: req.submittedById,
              employeeName: (p.employeeName as string) || '',
              reviewerId: req.submittedById,
              reviewerName: req.submittedByName,
              reviewPeriod: (p.period as string) || '',
              salesRating: salesR,
              punctualityRating: punctR,
              customerServiceRating: custR,
              teamworkRating: teamR,
              trainingRating: trainR,
              overallRating: overall,
              comments: (p.comments as string) || '',
              date: today(),
            };
            set((s) => ({ addedReviews: [...s.addedReviews, review] }));
            break;
          }

          case 'create_sales_target': {
            const target: SalesTarget = {
              id: stId(),
              employeeId: req.submittedById,
              employeeName: (p.employeeName as string) || '',
              stationId: req.stationId || '',
              product: (p.product as string) || '',
              targetAmount: Number(p.targetAmount) || 0,
              actualAmount: 0,
              period: (p.period as 'daily' | 'weekly' | 'monthly') || 'monthly',
              startDate: (p.startDate as string) || today(),
              endDate: (p.endDate as string) || today(),
            };
            set((s) => ({ addedSalesTargets: [...s.addedSalesTargets, target] }));
            break;
          }

          /* ── Delete Handlers ────────────────────────── */

          case 'delete_employee': {
            const targetId = (p.targetId as string) || '';
            if (targetId) {
              set((s) => ({
                deletedEmployeeIds: [...s.deletedEmployeeIds, targetId],
                addedEmployees: s.addedEmployees.filter((e) => e.id !== targetId),
              }));
            }
            break;
          }

          case 'delete_shift': {
            const targetId = (p.targetId as string) || '';
            if (targetId) {
              set((s) => ({
                deletedShiftIds: [...s.deletedShiftIds, targetId],
                addedShifts: s.addedShifts.filter((e) => e.id !== targetId),
              }));
            }
            break;
          }

          case 'delete_transfer': {
            const targetId = (p.targetId as string) || '';
            if (targetId) {
              set((s) => ({
                deletedTransferIds: [...s.deletedTransferIds, targetId],
                addedTransfers: s.addedTransfers.filter((e) => e.id !== targetId),
              }));
            }
            break;
          }

          case 'delete_leave_request': {
            const targetId = (p.targetId as string) || '';
            if (targetId) {
              set((s) => ({
                deletedLeaveRequestIds: [...s.deletedLeaveRequestIds, targetId],
                addedLeaveRequests: s.addedLeaveRequests.filter((e) => e.id !== targetId),
              }));
            }
            break;
          }

          case 'delete_incident': {
            const targetId = (p.targetId as string) || '';
            if (targetId) {
              set((s) => ({
                deletedIncidentIds: [...s.deletedIncidentIds, targetId],
                addedIncidents: s.addedIncidents.filter((e) => e.id !== targetId),
              }));
            }
            break;
          }

          case 'delete_training_assignment': {
            const targetId = (p.targetId as string) || '';
            if (targetId) {
              set((s) => ({
                deletedTrainingAssignmentIds: [...s.deletedTrainingAssignmentIds, targetId],
                addedTrainingAssignments: s.addedTrainingAssignments.filter((e) => e.id !== targetId),
              }));
            }
            break;
          }

          case 'delete_review': {
            const targetId = (p.targetId as string) || '';
            if (targetId) {
              set((s) => ({
                deletedReviewIds: [...s.deletedReviewIds, targetId],
                addedReviews: s.addedReviews.filter((e) => e.id !== targetId),
              }));
            }
            break;
          }

          case 'delete_sales_target': {
            const targetId = (p.targetId as string) || '';
            if (targetId) {
              set((s) => ({
                deletedSalesTargetIds: [...s.deletedSalesTargetIds, targetId],
                addedSalesTargets: s.addedSalesTargets.filter((e) => e.id !== targetId),
              }));
            }
            break;
          }

          default:
            break;
        }
      },
    }),
    { name: 'nnpc-hrm-data' }
  )
);
