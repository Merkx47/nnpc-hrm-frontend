import type { ApprovalActionType } from '@/types';
import { ROLE_LABELS, SHIFT_LABELS } from '@/lib/constants';
import type { Role, ShiftType } from '@/types';

interface PayloadPreviewProps {
  actionType: ApprovalActionType;
  payload: Record<string, unknown>;
}

function Field({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined || value === '') return null;
  return (
    <div>
      <span className="text-[11px] text-[var(--muted-foreground)]">{label}</span>
      <p className="text-sm text-[var(--foreground)]">{String(value)}</p>
    </div>
  );
}

export function PayloadPreview({ actionType, payload }: PayloadPreviewProps) {
  const p = payload;

  const grid = (fields: { label: string; value: string | number | undefined }[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {fields.map((f) => <Field key={f.label} {...f} />)}
    </div>
  );

  switch (actionType) {
    case 'create_employee':
    case 'edit_employee':
      return grid([
        { label: 'First Name', value: p.firstName as string },
        { label: 'Last Name', value: p.lastName as string },
        { label: 'Email', value: p.email as string },
        { label: 'Phone', value: p.phone as string },
        { label: 'Role', value: ROLE_LABELS[(p.role as Role) ?? 'attendant'] },
        { label: 'Station', value: p.stationId as string },
      ]);

    case 'create_shift':
      return grid([
        { label: 'Employee', value: p.employeeName as string },
        { label: 'Date', value: p.date as string },
        { label: 'Shift', value: SHIFT_LABELS[(p.shift as ShiftType) ?? 'morning'] },
        { label: 'Station', value: p.station as string },
        { label: 'Pump', value: p.pump as string },
      ]);

    case 'create_leave_request':
      return grid([
        { label: 'Type', value: p.type as string },
        { label: 'Start Date', value: p.startDate as string },
        { label: 'End Date', value: p.endDate as string },
        { label: 'Days', value: p.days as number },
        { label: 'Reason', value: p.reason as string },
      ]);

    case 'create_transfer':
    case 'transfer_employee':
      return grid([
        { label: 'Employee', value: p.employeeName as string },
        { label: 'From', value: p.fromStationName as string },
        { label: 'To', value: p.toStationName as string },
        { label: 'Reason', value: p.reason as string },
        { label: 'Effective Date', value: p.effectiveDate as string },
      ]);

    case 'create_training_assignment':
      return grid([
        { label: 'Module', value: p.moduleName as string },
        { label: 'Employees', value: Array.isArray(p.employeeNames) ? (p.employeeNames as string[]).join(', ') : String(p.employeeIds ?? '') },
        { label: 'Deadline', value: p.deadline as string },
      ]);

    case 'create_incident':
      return grid([
        { label: 'Type', value: p.type as string },
        { label: 'Severity', value: p.severity as string },
        { label: 'Date', value: p.date as string },
        { label: 'Description', value: p.description as string },
      ]);

    case 'create_review':
      return grid([
        { label: 'Employee', value: p.employeeName as string },
        { label: 'Period', value: p.period as string },
        { label: 'Sales', value: p.sales as number },
        { label: 'Punctuality', value: p.punctuality as number },
        { label: 'Customer Service', value: p.customerService as number },
        { label: 'Teamwork', value: p.teamwork as number },
      ]);

    case 'create_sales_target':
      return grid([
        { label: 'Employee', value: p.employeeName as string },
        { label: 'Product', value: p.product as string },
        { label: 'Target', value: p.targetAmount as number },
        { label: 'Period', value: p.period as string },
        { label: 'Start', value: p.startDate as string },
        { label: 'End', value: p.endDate as string },
      ]);

    case 'delete_employee':
    case 'delete_shift':
    case 'delete_transfer':
    case 'delete_leave_request':
    case 'delete_incident':
    case 'delete_training_assignment':
    case 'delete_review':
    case 'delete_sales_target':
      return grid([
        { label: 'Record ID', value: p.targetId as string },
        { label: 'Record Name', value: p.targetName as string },
        { label: 'Reason', value: p.reason as string },
      ]);

    default: {
      // Generic fallback
      const entries = Object.entries(p).slice(0, 8);
      return grid(entries.map(([k, v]) => ({ label: k, value: String(v) })));
    }
  }
}
