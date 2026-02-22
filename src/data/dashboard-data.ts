/**
 * Realistic NNPC Retail mock data for the dashboard.
 *
 * Sources: NNPC 2024 Audited Financial Statement, NMDPRA, GlobalPetrolPrices
 *
 * NNPC Retail: ~1,096 outlets nationwide (2024)
 * National PMS consumption: ~57M litres/day
 * Per-station estimates:
 * - PMS (petrol): Mega 80,000–150,000 l/day, Standard 30,000–60,000 l/day
 * - AGO (diesel): Mega 25,000–60,000 l/day, Standard 8,000–25,000 l/day
 * - DPK (kerosene): Mega 5,000–15,000 l/day, Standard 2,000–6,000 l/day
 * - Lubricant revenue: Mega ₦800K–₦2M/day, Standard ₦250K–₦700K/day
 *
 * Fuel prices (Feb 2026):
 * - PMS: ₦795/litre
 * - AGO: ₦880/litre
 * - DPK: ₦1,100/litre
 *
 * Attendance: 88–97%
 * Training compliance: 55–85%
 */

import { stations } from './stations';
import { regions } from './regions';

// ── Seeded PRNG for consistent numbers ──────────────────────────────
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function randBetween(rng: () => number, min: number, max: number) {
  return Math.round(min + rng() * (max - min));
}

// ── Types ────────────────────────────────────────────────────────────
export interface StationMonthData {
  stationId: string;
  stationName: string;
  month: string;           // "Jan", "Feb", etc.
  monthIndex: number;      // 0–11
  pmsVolume: number;       // litres
  agoVolume: number;       // litres
  dpkVolume: number;       // litres
  pmsRevenue: number;      // ₦
  agoRevenue: number;      // ₦
  dpkRevenue: number;      // ₦
  lubricantRevenue: number;// ₦
  totalRevenue: number;    // ₦
  attendanceRate: number;  // 0–100
  trainingCompliance: number; // 0–100
  incidentCount: number;
  employeeCount: number;
}

export interface AggregatedMonthData {
  month: string;
  monthIndex: number;
  pmsVolume: number;
  agoVolume: number;
  dpkVolume: number;
  pmsRevenue: number;
  agoRevenue: number;
  dpkRevenue: number;
  lubricantRevenue: number;
  totalRevenue: number;
  attendanceRate: number;
  trainingCompliance: number;
  incidentCount: number;
  employeeCount: number;
  stationCount: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PMS_PRICE = 795;
const AGO_PRICE = 880;
const DPK_PRICE = 1100;

// ── Generate per-station monthly data ────────────────────────────────
function generateStationData(): StationMonthData[] {
  const data: StationMonthData[] = [];

  for (const station of stations) {
    const isMega = station.name.includes('Mega');
    const isActive = station.status === 'active';
    const baseSeed = parseInt(station.id.replace('STN-', ''), 10) * 1000;

    for (let m = 0; m < 12; m++) {
      const rng = seededRandom(baseSeed + m * 7 + 31);

      if (!isActive) {
        // Inactive stations: minimal/zero throughput
        data.push({
          stationId: station.id,
          stationName: station.name,
          month: MONTHS[m],
          monthIndex: m,
          pmsVolume: 0,
          agoVolume: 0,
          dpkVolume: 0,
          pmsRevenue: 0,
          agoRevenue: 0,
          dpkRevenue: 0,
          lubricantRevenue: 0,
          totalRevenue: 0,
          attendanceRate: 0,
          trainingCompliance: 0,
          incidentCount: 0,
          employeeCount: station.employeeCount,
        });
        continue;
      }

      // Seasonal multiplier: higher in Dec–Jan (festive), lower in Feb–Mar
      const seasonal = [1.12, 0.88, 0.85, 0.9, 0.95, 1.0, 1.02, 1.0, 0.98, 1.05, 1.08, 1.18][m];

      // Daily volumes based on station type (NNPC Retail real-world estimates)
      const dailyPMS = isMega
        ? randBetween(rng, 80000, 150000)
        : randBetween(rng, 30000, 60000);
      const dailyAGO = isMega
        ? randBetween(rng, 25000, 60000)
        : randBetween(rng, 8000, 25000);
      const dailyDPK = isMega
        ? randBetween(rng, 5000, 15000)
        : randBetween(rng, 2000, 6000);
      const dailyLub = isMega
        ? randBetween(rng, 800000, 2000000)
        : randBetween(rng, 250000, 700000);

      // Monthly = daily × 30 × seasonal factor
      const daysInMonth = 30;
      const pmsVol = Math.round(dailyPMS * daysInMonth * seasonal);
      const agoVol = Math.round(dailyAGO * daysInMonth * seasonal);
      const dpkVol = Math.round(dailyDPK * daysInMonth * seasonal);
      const lubRev = Math.round(dailyLub * daysInMonth * seasonal);

      const pmsRev = pmsVol * PMS_PRICE;
      const agoRev = agoVol * AGO_PRICE;
      const dpkRev = dpkVol * DPK_PRICE;

      data.push({
        stationId: station.id,
        stationName: station.name,
        month: MONTHS[m],
        monthIndex: m,
        pmsVolume: pmsVol,
        agoVolume: agoVol,
        dpkVolume: dpkVol,
        pmsRevenue: pmsRev,
        agoRevenue: agoRev,
        dpkRevenue: dpkRev,
        lubricantRevenue: lubRev,
        totalRevenue: pmsRev + agoRev + dpkRev + lubRev,
        attendanceRate: randBetween(rng, 88, 97),
        trainingCompliance: randBetween(rng, 55, 85),
        incidentCount: randBetween(rng, 0, 3),
        employeeCount: station.employeeCount,
      });
    }
  }

  return data;
}

export const allStationMonthlyData = generateStationData();

// ── Aggregation helpers ──────────────────────────────────────────────

function aggregateMonths(rows: StationMonthData[]): AggregatedMonthData[] {
  const byMonth = new Map<number, StationMonthData[]>();
  for (const row of rows) {
    const existing = byMonth.get(row.monthIndex) || [];
    existing.push(row);
    byMonth.set(row.monthIndex, existing);
  }

  return MONTHS.map((month, idx) => {
    const monthRows = byMonth.get(idx) || [];
    const activeRows = monthRows.filter(r => r.attendanceRate > 0);
    const totalEmp = monthRows.reduce((s, r) => s + r.employeeCount, 0);

    return {
      month,
      monthIndex: idx,
      pmsVolume: monthRows.reduce((s, r) => s + r.pmsVolume, 0),
      agoVolume: monthRows.reduce((s, r) => s + r.agoVolume, 0),
      dpkVolume: monthRows.reduce((s, r) => s + r.dpkVolume, 0),
      pmsRevenue: monthRows.reduce((s, r) => s + r.pmsRevenue, 0),
      agoRevenue: monthRows.reduce((s, r) => s + r.agoRevenue, 0),
      dpkRevenue: monthRows.reduce((s, r) => s + r.dpkRevenue, 0),
      lubricantRevenue: monthRows.reduce((s, r) => s + r.lubricantRevenue, 0),
      totalRevenue: monthRows.reduce((s, r) => s + r.totalRevenue, 0),
      attendanceRate: activeRows.length > 0
        ? Math.round(activeRows.reduce((s, r) => s + r.attendanceRate * r.employeeCount, 0) / (activeRows.reduce((s, r) => s + r.employeeCount, 0) || 1))
        : 0,
      trainingCompliance: activeRows.length > 0
        ? Math.round(activeRows.reduce((s, r) => s + r.trainingCompliance * r.employeeCount, 0) / (activeRows.reduce((s, r) => s + r.employeeCount, 0) || 1))
        : 0,
      incidentCount: monthRows.reduce((s, r) => s + r.incidentCount, 0),
      employeeCount: totalEmp,
      stationCount: monthRows.length,
    };
  });
}

/** Get station IDs matching a filter combination */
export function getFilteredStationIds(
  regionId?: string,
  branchId?: string,
  stationId?: string,
): string[] {
  if (stationId) return [stationId];

  if (branchId) {
    for (const region of regions) {
      const branch = region.branches.find(b => b.id === branchId);
      if (branch) return branch.stationIds;
    }
    return [];
  }

  if (regionId) {
    const region = regions.find(r => r.id === regionId);
    if (!region) return [];
    return region.branches.flatMap(b => b.stationIds);
  }

  return stations.map(s => s.id);
}

/** Get aggregated monthly data for the given filters */
export function getFilteredMonthlyData(
  regionId?: string,
  branchId?: string,
  stationId?: string,
): AggregatedMonthData[] {
  const ids = new Set(getFilteredStationIds(regionId, branchId, stationId));
  const filtered = allStationMonthlyData.filter(r => ids.has(r.stationId));
  return aggregateMonths(filtered);
}

/** Latest month snapshot for KPI cards */
export function getLatestMonthKPIs(
  regionId?: string,
  branchId?: string,
  stationId?: string,
) {
  const monthly = getFilteredMonthlyData(regionId, branchId, stationId);
  const latest = monthly[monthly.length - 1]; // December
  const prev = monthly[monthly.length - 2];   // November

  const ids = new Set(getFilteredStationIds(regionId, branchId, stationId));
  const filteredStations = stations.filter(s => ids.has(s.id));
  const activeStations = filteredStations.filter(s => s.status === 'active').length;
  const totalStations = filteredStations.length;
  const totalStaff = filteredStations.reduce((s, st) => s + st.employeeCount, 0);

  // Trend = % change from previous month
  const revTrend = prev.totalRevenue > 0
    ? Math.round(((latest.totalRevenue - prev.totalRevenue) / prev.totalRevenue) * 100)
    : 0;
  const attTrend = prev.attendanceRate > 0
    ? Math.round(((latest.attendanceRate - prev.attendanceRate) / prev.attendanceRate) * 100)
    : 0;

  return {
    totalStaff,
    activeStations,
    totalStations,
    checkedIn: Math.round(totalStaff * (latest.attendanceRate / 100)),
    totalRevenue: latest.totalRevenue,
    dailyRevenue: Math.round(latest.totalRevenue / 30),
    attendanceRate: latest.attendanceRate,
    trainingCompliance: latest.trainingCompliance,
    incidentCount: latest.incidentCount,
    revenueTrend: revTrend,
    attendanceTrend: attTrend,
  };
}

/** Top performers data scaled by filter scope */
export function getTopPerformers(
  regionId?: string,
  branchId?: string,
  stationId?: string,
) {
  const ids = new Set(getFilteredStationIds(regionId, branchId, stationId));
  const filteredStations = stations.filter(s => ids.has(s.id) && s.status === 'active');

  // Generate consistent performers per station
  const allPerformers = [
    { name: 'Oluwaseun Adeyinka', station: 'Ikoyi', stationId: 'STN-001', sales: 97, rating: 4.8 },
    { name: 'Grace Okafor', station: 'Trans Amadi', stationId: 'STN-004', sales: 94, rating: 4.6 },
    { name: 'Emeka Nwankwo', station: 'Owerri', stationId: 'STN-025', sales: 92, rating: 4.5 },
    { name: 'Folake Adeyemi', station: 'Ring Road', stationId: 'STN-003', sales: 90, rating: 4.3 },
    { name: 'Ibrahim Musa', station: 'Sharada', stationId: 'STN-005', sales: 89, rating: 4.2 },
    { name: 'Amina Bello', station: 'Wuse', stationId: 'STN-002', sales: 88, rating: 4.1 },
    { name: 'Chidera Obi', station: 'Lekki', stationId: 'STN-019', sales: 87, rating: 4.0 },
    { name: 'Yakubu Garba', station: 'Jos Road', stationId: 'STN-009', sales: 86, rating: 3.9 },
    { name: 'Biodun Sowemimo', station: 'Abeokuta', stationId: 'STN-013', sales: 85, rating: 3.9 },
    { name: 'Terseer Aondo', station: 'Makurdi', stationId: 'STN-024', sales: 84, rating: 3.8 },
    { name: 'Iniobong Essien', station: 'Uyo', stationId: 'STN-015', sales: 83, rating: 3.7 },
    { name: 'Osaze Omoregie', station: 'Benin GRA', stationId: 'STN-008', sales: 82, rating: 3.6 },
  ];

  const filteredIds = new Set(filteredStations.map(s => s.id));
  return allPerformers
    .filter(p => filteredIds.has(p.stationId))
    .slice(0, 5);
}

// ── Date Range Time Series ──────────────────────────────────────────

export type DateRangeKey = 'today' | '1w' | '30d' | '1y' | '5y';

export interface TimeSeriesPoint {
  label: string;
  pmsRevenue: number;
  agoRevenue: number;
  dpkRevenue: number;
  lubricantRevenue: number;
  totalRevenue: number;
}

export interface TimeSeriesSummary {
  periodLabel: string;
  periodTotal: number;
  avgLabel: string;
  avgValue: number;
  trendLabel: string;
  trendValue: number;
}

// Realistic fuel station hourly demand curve (sums to 1.0)
const HOURLY_WEIGHTS = [
  0.015, 0.012, 0.010, 0.010, 0.012, 0.020,  // 12AM–5AM
  0.035, 0.050, 0.060, 0.065, 0.070, 0.072,  // 6AM–11AM
  0.070, 0.068, 0.065, 0.060, 0.058, 0.055,  // 12PM–5PM
  0.048, 0.042, 0.035, 0.030, 0.022, 0.016,  // 6PM–11PM
];

const HOUR_LABELS = [
  '12AM', '1AM', '2AM', '3AM', '4AM', '5AM',
  '6AM', '7AM', '8AM', '9AM', '10AM', '11AM',
  '12PM', '1PM', '2PM', '3PM', '4PM', '5PM',
  '6PM', '7PM', '8PM', '9PM', '10PM', '11PM',
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Distribute a monthly aggregate into N daily-like buckets with seeded variance */
function distributeWithVariance(
  total: number,
  buckets: number,
  seed: number,
): number[] {
  const rng = seededRandom(seed);
  const raw = Array.from({ length: buckets }, () => 0.85 + rng() * 0.30);
  const sum = raw.reduce((s, v) => s + v, 0);
  return raw.map(v => Math.round((v / sum) * total));
}

/** Get time series data for the revenue chart based on date range */
export function getFilteredTimeSeriesData(
  rangeKey: DateRangeKey,
  regionId?: string,
  branchId?: string,
  stationId?: string,
): TimeSeriesPoint[] {
  const monthly = getFilteredMonthlyData(regionId, branchId, stationId);

  if (rangeKey === '1y') {
    return monthly.map(m => ({
      label: m.month,
      pmsRevenue: m.pmsRevenue,
      agoRevenue: m.agoRevenue,
      dpkRevenue: m.dpkRevenue,
      lubricantRevenue: m.lubricantRevenue,
      totalRevenue: m.totalRevenue,
    }));
  }

  // Use December (latest month) as the base for daily/hourly derivations
  const dec = monthly[11];

  if (rangeKey === 'today') {
    // 24 hourly data points from December daily average
    return HOUR_LABELS.map((label, i) => {
      const w = HOURLY_WEIGHTS[i];
      const dailyTotal = dec.totalRevenue / 30;
      return {
        label,
        pmsRevenue: Math.round((dec.pmsRevenue / 30) * w * 24),
        agoRevenue: Math.round((dec.agoRevenue / 30) * w * 24),
        dpkRevenue: Math.round((dec.dpkRevenue / 30) * w * 24),
        lubricantRevenue: Math.round((dec.lubricantRevenue / 30) * w * 24),
        totalRevenue: Math.round(dailyTotal * w * 24),
      };
    });
  }

  if (rangeKey === '1w') {
    const seed = 77701;
    const pmsDays = distributeWithVariance(Math.round(dec.pmsRevenue / 30 * 7), 7, seed);
    const agoDays = distributeWithVariance(Math.round(dec.agoRevenue / 30 * 7), 7, seed + 1);
    const dpkDays = distributeWithVariance(Math.round(dec.dpkRevenue / 30 * 7), 7, seed + 2);
    const lubDays = distributeWithVariance(Math.round(dec.lubricantRevenue / 30 * 7), 7, seed + 3);

    return DAY_LABELS.map((label, i) => ({
      label,
      pmsRevenue: pmsDays[i],
      agoRevenue: agoDays[i],
      dpkRevenue: dpkDays[i],
      lubricantRevenue: lubDays[i],
      totalRevenue: pmsDays[i] + agoDays[i] + dpkDays[i] + lubDays[i],
    }));
  }

  if (rangeKey === '30d') {
    const seed = 88801;
    const pmsDays = distributeWithVariance(dec.pmsRevenue, 30, seed);
    const agoDays = distributeWithVariance(dec.agoRevenue, 30, seed + 1);
    const dpkDays = distributeWithVariance(dec.dpkRevenue, 30, seed + 2);
    const lubDays = distributeWithVariance(dec.lubricantRevenue, 30, seed + 3);

    return Array.from({ length: 30 }, (_, i) => ({
      label: `Dec ${i + 1}`,
      pmsRevenue: pmsDays[i],
      agoRevenue: agoDays[i],
      dpkRevenue: dpkDays[i],
      lubricantRevenue: lubDays[i],
      totalRevenue: pmsDays[i] + agoDays[i] + dpkDays[i] + lubDays[i],
    }));
  }

  // '5y' — 20 quarterly data points (Q1 2022 → Q4 2026)
  const yearLabels = ['22', '23', '24', '25', '26'];
  const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
  const points: TimeSeriesPoint[] = [];

  for (let y = 0; y < 5; y++) {
    const yearsBack = 4 - y; // year 0 = 2022 (4 years back), year 4 = 2026 (current)
    const growthFactor = Math.pow(0.88, yearsBack); // ~12% YoY growth going back

    for (let q = 0; q < 4; q++) {
      // Sum 3 months for the quarter from the current year data, then scale
      const m1 = q * 3;
      const qMonths = [monthly[m1], monthly[m1 + 1], monthly[m1 + 2]];

      points.push({
        label: `${quarterLabels[q]} '${yearLabels[y]}`,
        pmsRevenue: Math.round(qMonths.reduce((s, m) => s + m.pmsRevenue, 0) * growthFactor),
        agoRevenue: Math.round(qMonths.reduce((s, m) => s + m.agoRevenue, 0) * growthFactor),
        dpkRevenue: Math.round(qMonths.reduce((s, m) => s + m.dpkRevenue, 0) * growthFactor),
        lubricantRevenue: Math.round(qMonths.reduce((s, m) => s + m.lubricantRevenue, 0) * growthFactor),
        totalRevenue: Math.round(qMonths.reduce((s, m) => s + m.totalRevenue, 0) * growthFactor),
      });
    }
  }

  return points;
}

/** Summary stats for the selected time range */
export function getTimeSeriesSummary(
  rangeKey: DateRangeKey,
  data: TimeSeriesPoint[],
): TimeSeriesSummary {
  const total = data.reduce((s, d) => s + d.totalRevenue, 0);
  const count = data.length;

  switch (rangeKey) {
    case 'today': {
      // Compare today vs yesterday (estimate yesterday as slightly different)
      const trend = 3.2; // Simulated daily variance
      return {
        periodLabel: "Today's Revenue",
        periodTotal: total,
        avgLabel: 'Hourly Average',
        avgValue: Math.round(total / 24),
        trendLabel: 'vs Yesterday',
        trendValue: trend,
      };
    }
    case '1w': {
      return {
        periodLabel: 'Weekly Total',
        periodTotal: total,
        avgLabel: 'Daily Average',
        avgValue: Math.round(total / 7),
        trendLabel: 'vs Last Week',
        trendValue: 5.1,
      };
    }
    case '30d': {
      return {
        periodLabel: 'Monthly Total',
        periodTotal: total,
        avgLabel: 'Daily Average',
        avgValue: Math.round(total / 30),
        trendLabel: 'vs Last Month',
        trendValue: 8.4,
      };
    }
    case '1y': {
      const lastMonth = data[data.length - 1]?.totalRevenue || 0;
      const prevMonth = data[data.length - 2]?.totalRevenue || 1;
      const trend = Math.round(((lastMonth - prevMonth) / prevMonth) * 100);
      return {
        periodLabel: 'Annual Total',
        periodTotal: total,
        avgLabel: 'Monthly Average',
        avgValue: Math.round(total / 12),
        trendLabel: 'Month-over-Month',
        trendValue: trend,
      };
    }
    case '5y': {
      const lastQ = data[data.length - 1]?.totalRevenue || 0;
      const prevQ = data[data.length - 2]?.totalRevenue || 1;
      const trend = Math.round(((lastQ - prevQ) / prevQ) * 100);
      return {
        periodLabel: '5-Year Total',
        periodTotal: total,
        avgLabel: 'Quarterly Average',
        avgValue: Math.round(total / count),
        trendLabel: 'Quarter-over-Quarter',
        trendValue: trend,
      };
    }
  }
}

/** Revenue breakdown by product for the pie chart */
export function getRevenueBreakdown(
  regionId?: string,
  branchId?: string,
  stationId?: string,
) {
  const monthly = getFilteredMonthlyData(regionId, branchId, stationId);
  const latest = monthly[monthly.length - 1];

  return [
    { name: 'PMS (Petrol)', value: latest.pmsRevenue, color: '#22c55e' },
    { name: 'AGO (Diesel)', value: latest.agoRevenue, color: '#3b82f6' },
    { name: 'DPK (Kerosene)', value: latest.dpkRevenue, color: '#f59e0b' },
    { name: 'Lubricants', value: latest.lubricantRevenue, color: '#a855f7' },
  ];
}
