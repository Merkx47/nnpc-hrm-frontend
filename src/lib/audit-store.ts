import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '@/types';

export type AuditAction = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'return' | 'export';
export type AuditModule = 'auth' | 'employees' | 'shifts' | 'attendance' | 'incidents' | 'training' | 'performance' | 'approvals' | 'compensation' | 'settings';

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: AuditAction;
  module: AuditModule;
  description: string;
  targetId?: string;
  targetName?: string;
  ipAddress?: string;
}

interface AuditState {
  entries: AuditEntry[];
  initialized: boolean;
  initializeMockData: () => void;
  addEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
}

let counter = 0;

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      entries: [],
      initialized: false,

      initializeMockData: () => {
        if (get().initialized) return;
        import('@/data/audit-entries').then((mod) => {
          set({ entries: mod.auditEntries, initialized: true });
        });
      },

      addEntry: (entry) => {
        counter += 1;
        const id = `AUD-${Date.now()}-${counter}`;
        const newEntry: AuditEntry = {
          ...entry,
          id,
          timestamp: new Date().toISOString(),
        };
        const updated = [newEntry, ...get().entries];
        set({ entries: updated.slice(0, 1000) });
      },
    }),
    { name: 'nnpc-hrm-audit' },
  ),
);
