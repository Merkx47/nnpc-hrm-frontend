import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  MapPin, Users, Search, Building2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { stations } from '@/data/stations';
import { employees } from '@/data/employees';

function getPageNumbers(current: number, total: number): (number | 'dots')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | 'dots')[] = [1];

  if (current > 3) pages.push('dots');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('dots');

  pages.push(total);
  return pages;
}

export function StationsPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const regions = useMemo(() => {
    const set = new Set(stations.map((s) => s.region));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return stations.filter((s) => {
      if (regionFilter !== 'all' && s.region !== regionFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.state.toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchQuery, regionFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, regionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedStations = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const totalEmployees = employees.length;
  const activeStations = stations.filter((s) => s.status === 'active').length;

  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <div className="space-y-6">
      <PageHeader title="Stations" description={`${stations.length} NNPC retail stations across Nigeria`} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Stations" value={stations.length} icon={MapPin} delay={0} />
        <StatCard title="Active Stations" value={activeStations} icon={Building2} delay={0.1} />
        <StatCard title="Total Employees" value={totalEmployees} icon={Users} delay={0.2} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stations by name, city, or state..."
            className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <select
          className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
        >
          <option value="all">All Regions</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Station Cards Grid */}
      {paginatedStations.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedStations.map((station, i) => {
              const stationEmployees = employees.filter((e) => e.stationId === station.id).length;
              return (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setLocation(`/stations/${station.id}`)}
                  className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="rounded-lg bg-[var(--primary)]/10 p-2">
                      <MapPin className="h-5 w-5 text-[var(--primary)]" />
                    </div>
                    <StatusBadge
                      label={station.status === 'active' ? 'Active' : 'Inactive'}
                      colorClass={station.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300'}
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">{station.name}</h3>
                  <p className="text-xs text-[var(--muted-foreground)] mb-3">{station.address}, {station.city}, {station.state}</p>
                  <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                    <span>{station.region}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {stationEmployees} staff
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                    Dealer: {station.dealerName}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {filtered.length > pageSize && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              {/* Left: count + page size */}
              <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
                <span>
                  Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length} stations
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="rounded-lg border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-sm text-[var(--foreground)] focus:outline-none"
                >
                  {[12, 24, 48].map((size) => (
                    <option key={size} value={size}>{size} per page</option>
                  ))}
                </select>
              </div>

              {/* Right: page navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={safePage === 1}
                  className={cn(
                    'rounded-md p-1.5 transition-colors',
                    safePage === 1
                      ? 'text-[var(--muted-foreground)]/40 cursor-not-allowed'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
                  )}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className={cn(
                    'rounded-md p-1.5 transition-colors',
                    safePage === 1
                      ? 'text-[var(--muted-foreground)]/40 cursor-not-allowed'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {pageNumbers.map((page, idx) =>
                  page === 'dots' ? (
                    <span key={`dots-${idx}`} className="px-2 text-sm text-[var(--muted-foreground)]">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'h-8 w-8 rounded-md text-sm font-medium transition-colors',
                        safePage === page
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                          : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
                      )}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className={cn(
                    'rounded-md p-1.5 transition-colors',
                    safePage === totalPages
                      ? 'text-[var(--muted-foreground)]/40 cursor-not-allowed'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safePage === totalPages}
                  className={cn(
                    'rounded-md p-1.5 transition-colors',
                    safePage === totalPages
                      ? 'text-[var(--muted-foreground)]/40 cursor-not-allowed'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
                  )}
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">No stations found</p>
        </div>
      )}
    </div>
  );
}
