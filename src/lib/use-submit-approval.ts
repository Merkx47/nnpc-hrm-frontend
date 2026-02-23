import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import { useApprovalStore } from '@/lib/approval-store';
import type { ApprovalActionType } from '@/types';

export function useSubmitApproval() {
  const currentUser = useAppStore((s) => s.currentUser);
  const submitRequest = useApprovalStore((s) => s.submitRequest);

  return (params: {
    actionType: ApprovalActionType;
    actionLabel: string;
    stationId?: string;
    payload: Record<string, unknown>;
    entityName?: string;
  }) => {
    if (!currentUser) {
      toast.error('You must be logged in');
      return null;
    }

    const result = submitRequest({
      actionType: params.actionType,
      actionLabel: params.actionLabel,
      submittedById: currentUser.employee.id,
      submittedByName: `${currentUser.employee.firstName} ${currentUser.employee.lastName}`,
      submittedByRole: currentUser.role,
      stationId: params.stationId ?? currentUser.employee.stationId,
      payload: params.payload,
    });

    toast.success('Submitted for approval', {
      description: params.entityName
        ? `${params.actionLabel} for ${params.entityName} is pending review.`
        : `Your ${params.actionLabel.toLowerCase()} is pending review.`,
    });

    return result;
  };
}
