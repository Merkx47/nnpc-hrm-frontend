import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { stations } from '@/data/stations';
import { regionBoundaries, getRegionBoundary } from '@/data/region-boundaries';
import type { Station } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

// ── Inline SVG icons (no Lucide) ─────────────────────────────────────
function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function CollapseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function LayerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

// ── Map styles ───────────────────────────────────────────────────────
type MapStyleKey = 'satellite' | 'dark' | 'streets';
const MAP_STYLES: Record<MapStyleKey, { label: string; url: string }> = {
  satellite: { label: 'Satellite', url: 'mapbox://styles/mapbox/satellite-streets-v12' },
  dark:      { label: 'Dark',      url: 'mapbox://styles/mapbox/dark-v11' },
  streets:   { label: 'Streets',   url: 'mapbox://styles/mapbox/streets-v12' },
};

// ── Props ────────────────────────────────────────────────────────────
interface StationMapProps {
  /** Station IDs to highlight. If empty/undefined, show all. */
  filteredStationIds?: string[];
  /** Region ID to show boundary outline for. */
  highlightRegionId?: string;
}

// ── Fallback map (when no token) ─────────────────────────────────────
function FallbackMap({ filteredStationIds }: StationMapProps) {
  const [hovered, setHovered] = useState<Station | null>(null);

  const visibleStations = useMemo(() => {
    if (!filteredStationIds || filteredStationIds.length === 0) return stations;
    const ids = new Set(filteredStationIds);
    return stations.filter(s => ids.has(s.id));
  }, [filteredStationIds]);

  const totalEmployees = useMemo(
    () => visibleStations.reduce((sum, s) => sum + s.employeeCount, 0),
    [visibleStations]
  );

  const toPosition = (lng: number, lat: number) => ({
    left: `${((lng - 2.0) / 12.5) * 100}%`,
    top: `${(1 - (lat - 3.5) / 10) * 100}%`,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative h-[480px] rounded-2xl border border-[var(--card-border)] overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #061a0e 0%, #0d2818 40%, #0a1f14 70%, #081a10 100%)',
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div
        className="absolute rounded-full blur-[100px] opacity-20"
        style={{
          width: '300px', height: '300px', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)',
        }}
      />

      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="none">
        {visibleStations.map((s1, i) =>
          visibleStations.slice(i + 1).map((s2) => {
            const dist = Math.sqrt(
              Math.pow(s1.coordinates.lng - s2.coordinates.lng, 2) +
              Math.pow(s1.coordinates.lat - s2.coordinates.lat, 2)
            );
            if (dist > 3) return null;
            const x1 = ((s1.coordinates.lng - 2.0) / 12.5) * 100;
            const y1 = (1 - (s1.coordinates.lat - 3.5) / 10) * 100;
            const x2 = ((s2.coordinates.lng - 2.0) / 12.5) * 100;
            const y2 = (1 - (s2.coordinates.lat - 3.5) / 10) * 100;
            return (
              <line key={`${s1.id}-${s2.id}`} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="#22c55e" strokeWidth="1" />
            );
          })
        )}
      </svg>

      {visibleStations.map((station, i) => {
        const pos = toPosition(station.coordinates.lng, station.coordinates.lat);
        const isHovered = hovered?.id === station.id;
        return (
          <motion.div
            key={station.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.03, type: 'spring', stiffness: 300 }}
            className="absolute z-10 cursor-pointer"
            style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
            onMouseEnter={() => setHovered(station)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="absolute inset-[-4px] rounded-full bg-emerald-500/30 animate-ping" style={{ animationDuration: '3s' }} />
            <div className={cn(
              'relative h-3 w-3 rounded-full border-2 border-emerald-400/60 transition-all duration-200',
              isHovered ? 'bg-emerald-400 scale-150' : 'bg-emerald-500'
            )} />
            {isHovered && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-3 min-w-[180px]">
                <div className="rounded-lg bg-black/80 backdrop-blur-sm border border-emerald-500/20 p-3 shadow-xl">
                  <p className="text-xs font-semibold text-white truncate">{station.name}</p>
                  <p className="text-[10px] text-emerald-300/60 mt-0.5">{station.city}, {station.state}</p>
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/10">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-emerald-400/50">Staff</p>
                      <p className="text-sm font-bold font-mono text-white">{station.employeeCount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-emerald-400/50">Region</p>
                      <p className="text-[10px] text-emerald-300/80">{station.region}</p>
                    </div>
                  </div>
                </div>
                <div className="w-2 h-2 bg-black/80 border-b border-r border-emerald-500/20 rotate-45 mx-auto -mt-1" />
              </motion.div>
            )}
          </motion.div>
        );
      })}

      <div className="absolute top-5 left-6 z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/70">Station Network</span>
        </div>
        <p className="text-2xl font-bold text-white font-mono">{visibleStations.length}</p>
        <p className="text-xs text-emerald-300/40">stations</p>
      </div>

      <div className="absolute top-5 right-6 z-10 text-right">
        <p className="text-2xl font-bold text-white font-mono">{totalEmployees}</p>
        <p className="text-xs text-emerald-300/40">total employees</p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-5">
        <div className="flex items-center justify-center">
          <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
            <span className="text-xs text-emerald-300/70">
              Set <code className="font-mono text-emerald-400">VITE_MAPBOX_TOKEN</code> for interactive 3D map
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Mapbox map ──────────────────────────────────────────────────
export function StationMap({ filteredStationIds, highlightRegionId }: StationMapProps) {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyleKey>('streets');
  const [showStylePicker, setShowStylePicker] = useState(false);
  const mapRef = useRef<MapRef>(null);

  const hasFilter = filteredStationIds && filteredStationIds.length > 0;
  const filterSet = useMemo(() => hasFilter ? new Set(filteredStationIds) : null, [filteredStationIds, hasFilter]);

  const visibleStations = useMemo(() => {
    if (!filterSet) return stations;
    return stations.filter(s => filterSet.has(s.id));
  }, [filterSet]);

  const totalEmployees = useMemo(
    () => visibleStations.reduce((sum, s) => sum + s.employeeCount, 0),
    [visibleStations]
  );

  const activeCount = useMemo(
    () => visibleStations.filter((s) => s.status === 'active').length,
    [visibleStations]
  );

  // Fly to filtered area when filter changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (!filterSet || visibleStations.length === 0) {
      // Reset to Nigeria overview
      mapRef.current.flyTo({
        center: [8.0, 9.0],
        zoom: 5.2,
        pitch: 0,
        bearing: 0,
        duration: 1500,
      });
      return;
    }

    if (visibleStations.length === 1) {
      const s = visibleStations[0];
      mapRef.current.flyTo({
        center: [s.coordinates.lng, s.coordinates.lat],
        zoom: 11,
        pitch: 0,
        bearing: 0,
        duration: 1500,
      });
      setSelectedStation(s);
      return;
    }

    // Fit bounds for multiple stations
    const lngs = visibleStations.map(s => s.coordinates.lng);
    const lats = visibleStations.map(s => s.coordinates.lat);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    mapRef.current.fitBounds(
      [[minLng - 0.5, minLat - 0.5], [maxLng + 0.5, maxLat + 0.5]],
      { duration: 1500, pitch: 0, bearing: 0, padding: 60 }
    );
  }, [filterSet, visibleStations]);

  // Lock body scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isExpanded]);

  // ESC to close expanded
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) setIsExpanded(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isExpanded]);

  const handleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
    setTimeout(() => {
      mapRef.current?.flyTo({
        center: [8.0, 9.0],
        zoom: isExpanded ? 5.0 : 5.5,
        pitch: 0,
        bearing: 0,
        duration: 1200,
      });
    }, 100);
  }, [isExpanded]);

  // Force map resize after mount + animation so canvas fills container
  useEffect(() => {
    // Resize immediately, then again after Framer Motion entry animation
    const timers = [100, 400, 800, 1500].map((ms) =>
      setTimeout(() => mapRef.current?.resize(), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Resize when expanded/collapsed
  useEffect(() => {
    const timer = setTimeout(() => mapRef.current?.resize(), 300);
    return () => clearTimeout(timer);
  }, [isExpanded]);

  const onMapLoad = useCallback(() => {
    // Resize once tiles are ready to ensure canvas matches container
    setTimeout(() => mapRef.current?.resize(), 50);
  }, []);

  if (!MAPBOX_TOKEN) {
    return <FallbackMap filteredStationIds={filteredStationIds} />;
  }

  return (
    <>
      {/* Expanded backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn(
          'rounded-2xl overflow-hidden border border-[var(--card-border)] relative',
          isExpanded
            ? 'fixed inset-4 z-50 h-auto'
            : 'h-[520px]'
        )}
      >
        {/* ── Top overlay bar ─────────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
          <div className="flex items-start justify-between p-4">
            {/* Left: stats */}
            <div className="pointer-events-auto">
              <div className="rounded-xl bg-black/50 backdrop-blur-md border border-white/10 p-3.5 min-w-[160px]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-400/80">
                    {hasFilter ? 'Filtered View' : 'Station Network'}
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mt-2">
                  <div>
                    <p className="text-2xl font-bold text-white font-mono">{visibleStations.length}</p>
                    <p className="text-[10px] text-white/40">stations</p>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div>
                    <p className="text-2xl font-bold text-white font-mono">{totalEmployees}</p>
                    <p className="text-[10px] text-white/40">employees</p>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div>
                    <p className="text-2xl font-bold text-emerald-400 font-mono">{activeCount}</p>
                    <p className="text-[10px] text-white/40">active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Style picker */}
              <div className="relative">
                <button
                  onClick={() => setShowStylePicker((p) => !p)}
                  className="h-9 w-9 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/70 transition-colors"
                  title="Map style"
                >
                  <LayerIcon className="h-4 w-4 text-white/80" />
                </button>
                {showStylePicker && (
                  <div className="absolute right-0 top-full mt-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 p-1 min-w-[120px]">
                    {(Object.keys(MAP_STYLES) as MapStyleKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => { setMapStyle(key); setShowStylePicker(false); }}
                        className={cn(
                          'w-full text-left rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                          mapStyle === key
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        )}
                      >
                        {MAP_STYLES[key].label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Expand button */}
              <button
                onClick={handleExpand}
                className="h-9 w-9 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/70 transition-colors"
                title={isExpanded ? 'Collapse (Esc)' : 'Expand'}
              >
                {isExpanded
                  ? <CollapseIcon className="h-4 w-4 text-white/80" />
                  : <ExpandIcon className="h-4 w-4 text-white/80" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom region bar ────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
          <div className="bg-gradient-to-t from-black/60 via-black/30 to-transparent p-4">
            <div className="flex items-center justify-center gap-4 flex-wrap pointer-events-auto">
              {['South-West', 'North-Central', 'South-South', 'North-West', 'South-East', 'North-East'].map((region) => {
                const count = visibleStations.filter((s) => s.region === region).length;
                return (
                  <div key={region} className="flex items-center gap-1.5 rounded-md bg-black/30 backdrop-blur-sm px-2 py-1">
                    <div className={cn('h-1.5 w-1.5 rounded-full', count > 0 ? 'bg-emerald-500' : 'bg-white/20')} />
                    <span className={cn('text-[10px]', count > 0 ? 'text-white/50' : 'text-white/20')}>{region}</span>
                    <span className={cn('text-[10px] font-mono font-bold', count > 0 ? 'text-white/80' : 'text-white/20')}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Mapbox GL ───────────────────────────────────────── */}
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: 8.0,
            latitude: 9.0,
            zoom: 5.2,
            pitch: 0,
            bearing: 0,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={MAP_STYLES[mapStyle].url}
          mapboxAccessToken={MAPBOX_TOKEN}
          maxPitch={0}
          scrollZoom={false}
          onLoad={onMapLoad}
          onClick={() => { setSelectedStation(null); setShowStylePicker(false); }}
        >
          <NavigationControl position="bottom-right" showCompass />

          {stations.map((station) => {
            const isVisible = !filterSet || filterSet.has(station.id);
            return (
              <Marker
                key={station.id}
                longitude={station.coordinates.lng}
                latitude={station.coordinates.lat}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  if (isVisible) setSelectedStation(station);
                }}
              >
                <div className={cn(
                  'relative cursor-pointer group transition-opacity duration-500',
                  isVisible ? 'opacity-100' : 'opacity-15'
                )}>
                  {/* Pulse ring — only on visible stations */}
                  {isVisible && (
                    <div
                      className="absolute inset-[-4px] rounded-full animate-ping"
                      style={{
                        animationDuration: '3s',
                        backgroundColor: station.status === 'active' ? 'rgba(26,86,50,0.2)' : 'rgba(185,28,28,0.2)',
                      }}
                    />
                  )}
                  {/* Outer ring */}
                  <div className={cn(
                    'h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center transition-transform',
                    isVisible ? 'group-hover:scale-[1.5]' : '',
                    station.status === 'active'
                      ? 'border-[#1A5632] bg-[#1A5632]/30'
                      : 'border-red-700 bg-red-700/30'
                  )}>
                    {/* Inner dot */}
                    <div className={cn(
                      'h-2 w-2 rounded-full transition-all',
                      isVisible ? 'group-hover:scale-110' : '',
                      station.status === 'active'
                        ? 'bg-[#1A5632] group-hover:bg-[#22703f]'
                        : 'bg-red-700 group-hover:bg-red-600'
                    )} />
                  </div>
                  {/* Label */}
                  {isVisible && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="rounded bg-black/80 backdrop-blur-sm px-1.5 py-0.5 whitespace-nowrap">
                        <span className="text-[9px] font-medium text-white">{station.city}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Marker>
            );
          })}

          {/* ── Region boundary overlay ──────────────────────── */}
          {highlightRegionId && (
            <Source
              id="region-boundary"
              type="geojson"
              data={getRegionBoundary(highlightRegionId) || regionBoundaries}
            >
              <Layer
                id="region-boundary-fill"
                type="fill"
                paint={{
                  'fill-color': '#1A5632',
                  'fill-opacity': 0.08,
                }}
              />
              <Layer
                id="region-boundary-line"
                type="line"
                paint={{
                  'line-color': '#1A5632',
                  'line-width': 2.5,
                  'line-dasharray': [3, 2],
                  'line-opacity': 0.7,
                }}
              />
            </Source>
          )}

          {selectedStation && (
            <Popup
              longitude={selectedStation.coordinates.lng}
              latitude={selectedStation.coordinates.lat}
              anchor="bottom"
              onClose={() => setSelectedStation(null)}
              closeButton={true}
              closeOnClick={false}
              offset={16}
              className="station-popup"
              maxWidth="290px"
            >
              <div className="min-w-[260px]">
                {/* Gradient header */}
                <div className="px-4 py-3 bg-gradient-to-r from-[#1A5632] to-[#1D8A4E]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className={cn(
                      'h-2 w-2 rounded-full ring-2',
                      selectedStation.status === 'active'
                        ? 'bg-emerald-300 ring-emerald-300/30'
                        : 'bg-red-300 ring-red-300/30'
                    )} />
                    <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">
                      {selectedStation.status === 'active' ? 'Active Station' : 'Inactive'}
                    </span>
                  </div>
                  <h3 className="font-bold text-[13px] text-white leading-snug">{selectedStation.name}</h3>
                  <p className="text-[11px] text-white/60 mt-0.5">{selectedStation.address}, {selectedStation.city}</p>
                </div>

                {/* Stats grid */}
                <div className="px-4 py-3 grid grid-cols-3 gap-2 bg-white">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 font-mono leading-tight">{selectedStation.employeeCount}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Staff</p>
                  </div>
                  <div className="text-center border-x border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-700 leading-tight mt-0.5">{selectedStation.region}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Region</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold text-gray-700 leading-tight mt-0.5 truncate px-1">{selectedStation.dealerName}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Dealer</p>
                  </div>
                </div>

                {/* Footer with station type */}
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-mono">{selectedStation.id}</span>
                  <span className="text-[10px] font-medium text-[#1A5632] bg-[#1A5632]/10 rounded-full px-2 py-0.5">
                    {selectedStation.name.includes('Mega') ? 'Mega Station' : 'Retail Outlet'}
                  </span>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </motion.div>
    </>
  );
}
