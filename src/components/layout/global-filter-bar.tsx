import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { regions } from '@/data/regions';
import { stations } from '@/data/stations';
import { cn } from '@/lib/utils';

// ── Inline SVG icons ─────────────────────────────────────────────────
function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </svg>
  );
}

function FuelIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17" />
      <path d="M15 10h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a1 1 0 0 0 1-1V9l-3-3" />
      <path d="M7 10h4" />
    </svg>
  );
}

export function GlobalFilterBar() {
  const {
    currentUser,
    selectedRegionId, selectedBranchId, selectedStationId,
    setSelectedRegionId, setSelectedBranchId, setSelectedStationId,
    clearFilters,
  } = useAppStore();

  const role = currentUser?.role;
  const isAdmin = role && ['admin', 'regional_manager', 'branch_manager'].includes(role);

  const availableBranches = useMemo(() => {
    if (!selectedRegionId) return regions.flatMap(r => r.branches);
    const region = regions.find(r => r.id === selectedRegionId);
    return region ? region.branches : [];
  }, [selectedRegionId]);

  const availableStations = useMemo(() => {
    if (selectedBranchId) {
      const branch = availableBranches.find(b => b.id === selectedBranchId);
      if (branch) return stations.filter(s => branch.stationIds.includes(s.id));
    }
    if (selectedRegionId) {
      const stationIds = new Set(availableBranches.flatMap(b => b.stationIds));
      return stations.filter(s => stationIds.has(s.id));
    }
    return stations;
  }, [selectedRegionId, selectedBranchId, availableBranches]);

  const hasActiveFilter = selectedRegionId || selectedBranchId || selectedStationId;

  if (!isAdmin) return null;

  const selectBase =
    'h-9 rounded-md border border-[var(--input)] bg-[var(--background)]/50 px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 cursor-pointer appearance-none transition-colors';

  const chevronBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`;

  return (
    <div className="flex items-center gap-3">
      {/* Region */}
      <div className="flex items-center gap-2">
        <MapPinIcon className="h-4 w-4 text-[var(--muted-foreground)] shrink-0 hidden lg:block" />
        <select
          value={selectedRegionId}
          onChange={(e) => setSelectedRegionId(e.target.value)}
          className={cn(selectBase, 'w-[180px] pr-8')}
          style={{ backgroundImage: chevronBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
        >
          <option value="">All Regions</option>
          {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      <div className="h-6 w-px bg-[var(--border)] hidden md:block" />

      {/* Branch */}
      <div className="flex items-center gap-2">
        <BuildingIcon className="h-4 w-4 text-[var(--muted-foreground)] shrink-0 hidden lg:block" />
        <select
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          className={cn(selectBase, 'w-[180px] pr-8')}
          style={{ backgroundImage: chevronBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
        >
          <option value="">All Branches</option>
          {availableBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="h-6 w-px bg-[var(--border)] hidden md:block" />

      {/* Station */}
      <div className="flex items-center gap-2">
        <FuelIcon className="h-4 w-4 text-[var(--muted-foreground)] shrink-0 hidden lg:block" />
        <select
          value={selectedStationId}
          onChange={(e) => setSelectedStationId(e.target.value)}
          className={cn(selectBase, 'w-[220px] pr-8')}
          style={{ backgroundImage: chevronBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
        >
          <option value="">All Stations</option>
          {availableStations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Clear button */}
      {hasActiveFilter && (
        <button
          onClick={clearFilters}
          className="h-9 w-9 rounded-md border border-transparent flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
          title="Clear filters"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
