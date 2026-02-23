import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApprovalRequest, ApprovalStatus, ApprovalActionType, Role } from '@/types';
import { getApproverRole } from '@/lib/approval';
import { mockApprovalRequests } from '@/data/approval-requests';
import { useDataStore } from '@/lib/data-store';

interface ApprovalState {
  requests: ApprovalRequest[];

  initializeMockData: () => void;

  submitRequest: (params: {
    actionType: ApprovalActionType;
    actionLabel: string;
    submittedById: string;
    submittedByName: string;
    submittedByRole: Role;
    stationId?: string;
    payload: Record<string, unknown>;
  }) => ApprovalRequest;

  approveRequest: (requestId: string, reviewerId: string, reviewerName: string, reviewerRole: Role, note: string) => void;
  rejectRequest: (requestId: string, reviewerId: string, reviewerName: string, reviewerRole: Role, note: string) => void;
  returnRequest: (requestId: string, reviewerId: string, reviewerName: string, reviewerRole: Role, note: string) => void;
  resubmitRequest: (requestId: string, submitterId: string, submitterName: string, submitterRole: Role, note: string, updatedPayload?: Record<string, unknown>) => void;
}

let nextId = 100;
function genId() { return `APR-${String(++nextId).padStart(3, '0')}`; }
function now() { return new Date().toISOString(); }
function noteId() { return `NOTE-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

export const useApprovalStore = create<ApprovalState>()(
  persist(
    (set, get) => ({
      requests: [],

      initializeMockData: () => {
        if (get().requests.length === 0) {
          set({ requests: mockApprovalRequests });
        }
      },

      submitRequest: (params) => {
        const reviewerRole = getApproverRole(params.submittedByRole);
        const ts = now();

        const req: ApprovalRequest = {
          id: genId(),
          actionType: params.actionType,
          actionLabel: params.actionLabel,
          submittedById: params.submittedById,
          submittedByName: params.submittedByName,
          submittedByRole: params.submittedByRole,
          submittedAt: ts,
          reviewerRole,
          stationId: params.stationId,
          payload: params.payload,
          status: 'pending',
          notes: [{
            id: noteId(),
            authorId: params.submittedById,
            authorName: params.submittedByName,
            authorRole: params.submittedByRole,
            note: 'Request submitted for review',
            action: 'submitted',
            createdAt: ts,
          }],
          updatedAt: ts,
        };

        set((s) => ({ requests: [req, ...s.requests] }));

        return req;
      },

      approveRequest: (id, reviewerId, reviewerName, reviewerRole, note) => {
        const ts = now();
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id ? {
              ...r,
              status: 'approved' as ApprovalStatus,
              reviewerId, reviewerName, updatedAt: ts,
              notes: [...r.notes, { id: noteId(), authorId: reviewerId, authorName: reviewerName, authorRole: reviewerRole, note, action: 'approved' as const, createdAt: ts }],
            } : r
          ),
        }));

        // Apply data mutations when request is approved
        const approved = get().requests.find((r) => r.id === id);
        if (approved) {
          useDataStore.getState().applyApprovedRequest(approved);
        }
      },

      rejectRequest: (id, reviewerId, reviewerName, reviewerRole, note) => {
        const ts = now();
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id ? {
              ...r,
              status: 'rejected' as ApprovalStatus,
              reviewerId, reviewerName, updatedAt: ts,
              notes: [...r.notes, { id: noteId(), authorId: reviewerId, authorName: reviewerName, authorRole: reviewerRole, note, action: 'rejected' as const, createdAt: ts }],
            } : r
          ),
        }));
      },

      returnRequest: (id, reviewerId, reviewerName, reviewerRole, note) => {
        const ts = now();
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id ? {
              ...r,
              status: 'returned' as ApprovalStatus,
              reviewerId, reviewerName, updatedAt: ts,
              notes: [...r.notes, { id: noteId(), authorId: reviewerId, authorName: reviewerName, authorRole: reviewerRole, note, action: 'returned' as const, createdAt: ts }],
            } : r
          ),
        }));
      },

      resubmitRequest: (id, submitterId, submitterName, submitterRole, note, updatedPayload) => {
        const reviewerRole = getApproverRole(submitterRole);
        const ts = now();
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id ? {
              ...r,
              status: 'pending' as ApprovalStatus,
              reviewerRole,
              payload: updatedPayload ?? r.payload,
              updatedAt: ts,
              notes: [...r.notes, { id: noteId(), authorId: submitterId, authorName: submitterName, authorRole: submitterRole, note, action: 'resubmitted' as const, createdAt: ts }],
            } : r
          ),
        }));
      },
    }),
    { name: 'nnpc-hrm-approvals' }
  )
);
