import type { TrainingModule, TrainingAssignment } from '@/types';

export const trainingModules: TrainingModule[] = [
  {
    id: 'TM-001',
    name: 'Fuel Pump Operations & Safety',
    description: 'Comprehensive training on safe fuel pump operation, including startup/shutdown procedures, leak detection, and spill response protocols for NNPC retail stations.',
    category: 'Safety',
    durationHours: 8,
    mandatory: true,
  },
  {
    id: 'TM-002',
    name: 'Customer Service Excellence',
    description: 'Training on delivering outstanding customer experience at NNPC fuel stations, covering greeting protocols, complaint handling, and upselling techniques.',
    category: 'Customer Service',
    durationHours: 6,
    mandatory: true,
  },
  {
    id: 'TM-003',
    name: 'Fire Safety & Emergency Response',
    description: 'Essential fire prevention, detection, and emergency evacuation procedures specific to fuel station environments. Includes hands-on fire extinguisher training.',
    category: 'Emergency Procedures',
    durationHours: 4,
    mandatory: true,
  },
  {
    id: 'TM-004',
    name: 'Lubricant Product Knowledge',
    description: 'Detailed knowledge of NNPC lubricant products, their applications, and sales techniques. Covers engine oils, gear oils, and industrial lubricants.',
    category: 'Lubricant Sales',
    durationHours: 3,
    mandatory: true,
  },
  {
    id: 'TM-005',
    name: 'Cash Handling & POS Operations',
    description: 'Training on proper cash handling procedures, POS terminal operation, daily reconciliation, and fraud prevention measures.',
    category: 'Equipment Operation',
    durationHours: 4,
    mandatory: true,
  },
  {
    id: 'TM-006',
    name: 'Environmental Health & Safety',
    description: 'Comprehensive environmental compliance training including waste management, spill containment, and occupational health standards at fuel stations.',
    category: 'Safety',
    durationHours: 6,
    mandatory: true,
  },
  {
    id: 'TM-007',
    name: 'Anti-Fraud & Loss Prevention',
    description: 'Identification and prevention of common fraud schemes at fuel stations, including meter tampering, fuel diversion, and cashier fraud.',
    category: 'Safety',
    durationHours: 3,
    mandatory: false,
  },
  {
    id: 'TM-008',
    name: 'First Aid Training',
    description: 'Basic first aid and CPR training tailored for fuel station emergencies, including burns treatment, chemical exposure response, and injury management.',
    category: 'Emergency Procedures',
    durationHours: 4,
    mandatory: false,
  },
  {
    id: 'TM-009',
    name: 'NNPC Brand Standards & Compliance',
    description: 'Overview of NNPC brand identity guidelines, station appearance standards, uniform requirements, and regulatory compliance expectations.',
    category: 'Customer Service',
    durationHours: 2,
    mandatory: true,
  },
];

export const trainingAssignments: TrainingAssignment[] = [
  // Employee NRL-2025-000312
  {
    id: 'TA-001',
    employeeId: 'NRL-2025-000312',
    moduleId: 'TM-001',
    assignedDate: '2025-11-01',
    deadline: '2025-12-15',
    completionDate: '2025-12-10',
    score: 88,
    status: 'completed',
  },
  {
    id: 'TA-002',
    employeeId: 'NRL-2025-000312',
    moduleId: 'TM-002',
    assignedDate: '2025-12-01',
    deadline: '2026-01-15',
    completionDate: '2026-01-12',
    score: 92,
    status: 'completed',
  },
  {
    id: 'TA-003',
    employeeId: 'NRL-2025-000312',
    moduleId: 'TM-003',
    assignedDate: '2026-01-10',
    deadline: '2026-02-28',
    status: 'in_progress',
  },
  {
    id: 'TA-004',
    employeeId: 'NRL-2025-000312',
    moduleId: 'TM-009',
    assignedDate: '2026-02-01',
    deadline: '2026-03-15',
    status: 'assigned',
  },

  // Employee NRL-2024-000156
  {
    id: 'TA-005',
    employeeId: 'NRL-2024-000156',
    moduleId: 'TM-001',
    assignedDate: '2025-06-15',
    deadline: '2025-08-01',
    completionDate: '2025-07-28',
    score: 95,
    status: 'completed',
  },
  {
    id: 'TA-006',
    employeeId: 'NRL-2024-000156',
    moduleId: 'TM-004',
    assignedDate: '2025-09-01',
    deadline: '2025-10-15',
    completionDate: '2025-10-10',
    score: 78,
    status: 'completed',
  },
  {
    id: 'TA-007',
    employeeId: 'NRL-2024-000156',
    moduleId: 'TM-006',
    assignedDate: '2025-11-15',
    deadline: '2026-01-10',
    status: 'overdue',
  },
  {
    id: 'TA-008',
    employeeId: 'NRL-2024-000156',
    moduleId: 'TM-007',
    assignedDate: '2026-01-20',
    deadline: '2026-03-20',
    status: 'in_progress',
  },

  // Employee NRL-2024-000200
  {
    id: 'TA-009',
    employeeId: 'NRL-2024-000200',
    moduleId: 'TM-001',
    assignedDate: '2025-08-01',
    deadline: '2025-09-15',
    completionDate: '2025-09-12',
    score: 82,
    status: 'completed',
  },
  {
    id: 'TA-010',
    employeeId: 'NRL-2024-000200',
    moduleId: 'TM-002',
    assignedDate: '2025-10-01',
    deadline: '2025-11-15',
    completionDate: '2025-11-14',
    score: 90,
    status: 'completed',
  },
  {
    id: 'TA-011',
    employeeId: 'NRL-2024-000200',
    moduleId: 'TM-005',
    assignedDate: '2026-01-05',
    deadline: '2026-02-15',
    status: 'overdue',
  },

  // Employee NRL-2024-000215
  {
    id: 'TA-012',
    employeeId: 'NRL-2024-000215',
    moduleId: 'TM-003',
    assignedDate: '2025-07-10',
    deadline: '2025-08-20',
    completionDate: '2025-08-18',
    score: 85,
    status: 'completed',
  },
  {
    id: 'TA-013',
    employeeId: 'NRL-2024-000215',
    moduleId: 'TM-006',
    assignedDate: '2025-12-01',
    deadline: '2026-01-31',
    completionDate: '2026-01-25',
    score: 91,
    status: 'completed',
  },

  // Employee NRL-2024-000230
  {
    id: 'TA-014',
    employeeId: 'NRL-2024-000230',
    moduleId: 'TM-001',
    assignedDate: '2025-09-15',
    deadline: '2025-11-01',
    completionDate: '2025-10-28',
    score: 76,
    status: 'completed',
  },
  {
    id: 'TA-015',
    employeeId: 'NRL-2024-000230',
    moduleId: 'TM-008',
    assignedDate: '2026-01-15',
    deadline: '2026-03-01',
    status: 'in_progress',
  },

  // Employee NRL-2024-000245
  {
    id: 'TA-016',
    employeeId: 'NRL-2024-000245',
    moduleId: 'TM-002',
    assignedDate: '2025-10-20',
    deadline: '2025-12-05',
    status: 'overdue',
  },
  {
    id: 'TA-017',
    employeeId: 'NRL-2024-000245',
    moduleId: 'TM-004',
    assignedDate: '2026-02-01',
    deadline: '2026-03-15',
    status: 'assigned',
  },

  // Employee NRL-2025-000260
  {
    id: 'TA-018',
    employeeId: 'NRL-2025-000260',
    moduleId: 'TM-001',
    assignedDate: '2025-11-10',
    deadline: '2025-12-25',
    completionDate: '2025-12-20',
    score: 87,
    status: 'completed',
  },
  {
    id: 'TA-019',
    employeeId: 'NRL-2025-000260',
    moduleId: 'TM-005',
    assignedDate: '2026-01-15',
    deadline: '2026-02-28',
    status: 'in_progress',
  },

  // Employee NRL-2025-000275
  {
    id: 'TA-020',
    employeeId: 'NRL-2025-000275',
    moduleId: 'TM-003',
    assignedDate: '2025-12-10',
    deadline: '2026-01-20',
    completionDate: '2026-01-18',
    score: 93,
    status: 'completed',
  },
  {
    id: 'TA-021',
    employeeId: 'NRL-2025-000275',
    moduleId: 'TM-009',
    assignedDate: '2026-02-05',
    deadline: '2026-03-10',
    status: 'assigned',
  },

  // Employee NRL-2025-000288
  {
    id: 'TA-022',
    employeeId: 'NRL-2025-000288',
    moduleId: 'TM-006',
    assignedDate: '2025-10-01',
    deadline: '2025-11-30',
    completionDate: '2025-11-28',
    score: 80,
    status: 'completed',
  },
  {
    id: 'TA-023',
    employeeId: 'NRL-2025-000288',
    moduleId: 'TM-007',
    assignedDate: '2026-01-20',
    deadline: '2026-03-20',
    status: 'in_progress',
  },

  // Employee NRL-2025-000295
  {
    id: 'TA-024',
    employeeId: 'NRL-2025-000295',
    moduleId: 'TM-001',
    assignedDate: '2025-12-01',
    deadline: '2026-01-15',
    status: 'overdue',
  },
  {
    id: 'TA-025',
    employeeId: 'NRL-2025-000295',
    moduleId: 'TM-002',
    assignedDate: '2026-02-10',
    deadline: '2026-03-25',
    status: 'assigned',
  },

  // Employee NRL-2025-000305
  {
    id: 'TA-026',
    employeeId: 'NRL-2025-000305',
    moduleId: 'TM-004',
    assignedDate: '2025-11-20',
    deadline: '2025-12-30',
    completionDate: '2025-12-28',
    score: 84,
    status: 'completed',
  },
  {
    id: 'TA-027',
    employeeId: 'NRL-2025-000305',
    moduleId: 'TM-008',
    assignedDate: '2026-01-25',
    deadline: '2026-03-10',
    status: 'assigned',
  },

  // Employee NRL-2025-000318
  {
    id: 'TA-028',
    employeeId: 'NRL-2025-000318',
    moduleId: 'TM-001',
    assignedDate: '2026-01-05',
    deadline: '2026-02-20',
    status: 'in_progress',
  },
  {
    id: 'TA-029',
    employeeId: 'NRL-2025-000318',
    moduleId: 'TM-003',
    assignedDate: '2026-02-15',
    deadline: '2026-03-30',
    status: 'assigned',
  },

  // Employee NRL-2025-000325
  {
    id: 'TA-030',
    employeeId: 'NRL-2025-000325',
    moduleId: 'TM-005',
    assignedDate: '2025-10-15',
    deadline: '2025-11-30',
    completionDate: '2025-11-25',
    score: 89,
    status: 'completed',
  },
  {
    id: 'TA-031',
    employeeId: 'NRL-2025-000325',
    moduleId: 'TM-006',
    assignedDate: '2025-12-20',
    deadline: '2026-02-05',
    status: 'overdue',
  },

  // Employee NRL-2025-000330
  {
    id: 'TA-032',
    employeeId: 'NRL-2025-000330',
    moduleId: 'TM-002',
    assignedDate: '2025-11-05',
    deadline: '2025-12-20',
    completionDate: '2025-12-18',
    score: 96,
    status: 'completed',
  },
  {
    id: 'TA-033',
    employeeId: 'NRL-2025-000330',
    moduleId: 'TM-009',
    assignedDate: '2026-01-10',
    deadline: '2026-02-15',
    completionDate: '2026-02-12',
    score: 90,
    status: 'completed',
  },

  // Employee NRL-2025-000335
  {
    id: 'TA-034',
    employeeId: 'NRL-2025-000335',
    moduleId: 'TM-001',
    assignedDate: '2026-01-20',
    deadline: '2026-03-05',
    status: 'in_progress',
  },

  // Employee NRL-2025-000340
  {
    id: 'TA-035',
    employeeId: 'NRL-2025-000340',
    moduleId: 'TM-003',
    assignedDate: '2025-11-15',
    deadline: '2025-12-30',
    completionDate: '2025-12-22',
    score: 74,
    status: 'completed',
  },
  {
    id: 'TA-036',
    employeeId: 'NRL-2025-000340',
    moduleId: 'TM-007',
    assignedDate: '2026-02-01',
    deadline: '2026-04-01',
    status: 'assigned',
  },

  // Employee NRL-2024-000210
  {
    id: 'TA-037',
    employeeId: 'NRL-2024-000210',
    moduleId: 'TM-004',
    assignedDate: '2025-08-20',
    deadline: '2025-10-01',
    completionDate: '2025-09-28',
    score: 86,
    status: 'completed',
  },

  // Employee NRL-2024-000225
  {
    id: 'TA-038',
    employeeId: 'NRL-2024-000225',
    moduleId: 'TM-006',
    assignedDate: '2025-09-10',
    deadline: '2025-11-10',
    status: 'overdue',
  },

  // Employee NRL-2024-000240
  {
    id: 'TA-039',
    employeeId: 'NRL-2024-000240',
    moduleId: 'TM-005',
    assignedDate: '2026-02-10',
    deadline: '2026-03-25',
    status: 'assigned',
  },

  // Employee NRL-2025-000310
  {
    id: 'TA-040',
    employeeId: 'NRL-2025-000310',
    moduleId: 'TM-008',
    assignedDate: '2025-12-15',
    deadline: '2026-02-01',
    completionDate: '2026-01-30',
    score: 81,
    status: 'completed',
  },
];
