import type { User } from '@/types';
import { regions } from '@/data/regions';
import { stations } from '@/data/stations';

export interface UserScope {
  regionId?: string;
  branchId?: string;
  stationId?: string;
  stationIds: string[];
}

export function getUserScope(user: User): UserScope {
  const { role, employee } = user;
  const sid = employee.stationId;

  if (role === 'admin') {
    return { stationIds: stations.map((s) => s.id) };
  }

  let foundRegionId: string | undefined;
  let foundBranchId: string | undefined;

  for (const region of regions) {
    for (const branch of region.branches) {
      if (branch.stationIds.includes(sid)) {
        foundRegionId = region.id;
        foundBranchId = branch.id;
        break;
      }
    }
    if (foundRegionId) break;
  }

  if (role === 'regional_manager') {
    const region = regions.find((r) => r.id === foundRegionId);
    const stationIds = region ? region.branches.flatMap((b) => b.stationIds) : [sid];
    return { regionId: foundRegionId, stationIds };
  }

  if (role === 'branch_manager') {
    const region = regions.find((r) => r.id === foundRegionId);
    const branch = region?.branches.find((b) => b.id === foundBranchId);
    const stationIds = branch ? branch.stationIds : [sid];
    return { regionId: foundRegionId, branchId: foundBranchId, stationIds };
  }

  return {
    regionId: foundRegionId,
    branchId: foundBranchId,
    stationId: sid,
    stationIds: [sid],
  };
}

export function isRequestInScope(
  requestStationId: string | undefined,
  userScope: UserScope,
): boolean {
  if (!requestStationId) return true;
  return userScope.stationIds.includes(requestStationId);
}
