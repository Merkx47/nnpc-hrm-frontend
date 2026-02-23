import type { Region } from '@/types';

export const regions: Region[] = [
  {
    id: 'REG-001',
    name: 'South-West Region',
    states: ['Lagos', 'Ogun', 'Oyo', 'Ondo', 'Osun', 'Ekiti'],
    branches: [
      {
        id: 'BRN-001',
        name: 'Lagos Branch',
        regionId: 'REG-001',
        stationIds: ['STN-001', 'STN-019', 'STN-020'],
      },
      {
        id: 'BRN-002',
        name: 'Abeokuta Branch',
        regionId: 'REG-001',
        stationIds: ['STN-013', 'STN-014', 'STN-027'],
      },
      {
        id: 'BRN-016',
        name: 'Ibadan Branch',
        regionId: 'REG-001',
        stationIds: ['STN-003'],
      },
    ],
  },
  {
    id: 'REG-002',
    name: 'South-East Region',
    states: ['Enugu', 'Anambra', 'Imo', 'Abia', 'Ebonyi'],
    branches: [
      {
        id: 'BRN-003',
        name: 'Enugu Branch',
        regionId: 'REG-002',
        stationIds: ['STN-006', 'STN-034'],
      },
      {
        id: 'BRN-013',
        name: 'Owerri Branch',
        regionId: 'REG-002',
        stationIds: ['STN-010', 'STN-025'],
      },
    ],
  },
  {
    id: 'REG-003',
    name: 'South-South Region',
    states: ['Rivers', 'Delta', 'Edo', 'Bayelsa', 'Cross River', 'Akwa Ibom'],
    branches: [
      {
        id: 'BRN-004',
        name: 'Port Harcourt Branch',
        regionId: 'REG-003',
        stationIds: ['STN-004', 'STN-007'],
      },
      {
        id: 'BRN-005',
        name: 'Benin Branch',
        regionId: 'REG-003',
        stationIds: ['STN-008', 'STN-026', 'STN-035'],
      },
      {
        id: 'BRN-015',
        name: 'Calabar Branch',
        regionId: 'REG-003',
        stationIds: ['STN-015', 'STN-018'],
      },
    ],
  },
  {
    id: 'REG-004',
    name: 'North-Central Region',
    states: ['Abuja FCT', 'Plateau', 'Kwara', 'Kogi', 'Nasarawa', 'Niger', 'Benue'],
    branches: [
      {
        id: 'BRN-006',
        name: 'Abuja Branch',
        regionId: 'REG-004',
        stationIds: ['STN-002', 'STN-028', 'STN-030'],
      },
      {
        id: 'BRN-014',
        name: 'Jos Branch',
        regionId: 'REG-004',
        stationIds: ['STN-011', 'STN-024', 'STN-029'],
      },
      {
        id: 'BRN-007',
        name: 'Ilorin Branch',
        regionId: 'REG-004',
        stationIds: ['STN-017'],
      },
    ],
  },
  {
    id: 'REG-005',
    name: 'North-West Region',
    states: ['Kano', 'Kaduna', 'Sokoto', 'Zamfara', 'Kebbi', 'Katsina', 'Jigawa'],
    branches: [
      {
        id: 'BRN-008',
        name: 'Kano Branch',
        regionId: 'REG-005',
        stationIds: ['STN-005', 'STN-032'],
      },
      {
        id: 'BRN-009',
        name: 'Kaduna Branch',
        regionId: 'REG-005',
        stationIds: ['STN-009', 'STN-012'],
      },
      {
        id: 'BRN-011',
        name: 'Sokoto Branch',
        regionId: 'REG-005',
        stationIds: ['STN-021', 'STN-033'],
      },
    ],
  },
  {
    id: 'REG-006',
    name: 'North-East Region',
    states: ['Borno', 'Adamawa', 'Bauchi', 'Gombe', 'Yobe', 'Taraba'],
    branches: [
      {
        id: 'BRN-010',
        name: 'Maiduguri Branch',
        regionId: 'REG-006',
        stationIds: ['STN-016', 'STN-023'],
      },
      {
        id: 'BRN-012',
        name: 'Bauchi Branch',
        regionId: 'REG-006',
        stationIds: ['STN-022', 'STN-031'],
      },
    ],
  },
];
