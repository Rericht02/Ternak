import { Cycle, FarmState, FarmStats, IpCategory } from '../types';

export const STORAGE_KEY = 'broiler_farm_pro_v2_data';

export const toIDR = (val: number | null | undefined): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);
};

export const toNum = (val: number | null | undefined, dec = 2): string => {
  const n = Number(val);
  return Number.isFinite(n)
    ? n.toLocaleString('id-ID', {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      })
    : '—';
};

export const n = (val: number | string | null | undefined): number => Number(val) || 0;

export const uid = (): string => {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
};

export function getActiveCycle(state: FarmState): Cycle | undefined {
  return state.cycles.find((c) => c.id === state.active) || state.cycles[0];
}

export function getAgeAtDate(cycleDate: string | undefined, targetDate: string | undefined): number {
  if (!cycleDate || !targetDate) return 0;
  const t1 = Date.parse(cycleDate + 'T00:00:00');
  const t2 = Date.parse(targetDate + 'T00:00:00');
  return Math.round((t2 - t1) / 86400000);
}

export function getLivePopulationAt(
  state: FarmState,
  cycle: Cycle,
  dateStr: string,
  excludeId: string | null = null
): number {
  const daily = state.daily.filter((r) => r.cycleId === cycle.id);
  const harvest = state.harvest.filter((h) => h.cycleId === cycle.id);

  let dead = 0;
  let cull = 0;
  let harvestBirds = 0;

  for (const r of daily) {
    if (r.id !== excludeId && r.date <= dateStr) {
      dead += n(r.dead);
      cull += n(r.cull);
    }
  }

  for (const h of harvest) {
    if (h.id !== excludeId && h.date <= dateStr) {
      harvestBirds += n(h.birds);
    }
  }

  return Math.max(0, cycle.doc - dead - cull - harvestBirds);
}

export function calculateStats(state: FarmState): FarmStats | null {
  const cycle = getActiveCycle(state);
  if (!cycle) return null;

  const daily = state.daily.filter((r) => r.cycleId === cycle.id);
  const feed = state.feed.filter((r) => r.cycleId === cycle.id);
  const harvest = state.harvest.filter((r) => r.cycleId === cycle.id);
  const expenses = state.expenses.filter((r) => r.cycleId === cycle.id);

  // 1. Populasi & Mortalitas
  const totalDead = daily.reduce((acc, r) => acc + n(r.dead), 0);
  const totalCull = daily.reduce((acc, r) => acc + n(r.cull), 0);
  const totalDepleted = totalDead + totalCull;
  const totalHarvestBirds = harvest.reduce((acc, r) => acc + n(r.birds), 0);
  const totalHarvestKg = harvest.reduce((acc, r) => acc + n(r.kg), 0);
  const currentLive = Math.max(0, cycle.doc - totalDepleted - totalHarvestBirds);
  const mortalityRate = cycle.doc > 0 ? (totalDead / cycle.doc) * 100 : 0;
  const depletionRate = cycle.doc > 0 ? (totalDepleted / cycle.doc) * 100 : 0;
  const survivalRate = cycle.doc > 0 ? ((cycle.doc - totalDepleted) / cycle.doc) * 100 : 0;

  // 2. Umur & Bobot
  const today = new Date().toISOString().slice(0, 10);
  const calendarAge = Math.max(0, getAgeAtDate(cycle.date, today));

  const sortedDailyWithWeight = [...daily]
    .filter((r) => n(r.weight) > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
  const lastSampling = sortedDailyWithWeight[0];
  const currentAvgWeightKg = lastSampling ? n(lastSampling.weight) / 1000 : 0;
  const currentBiomassKg = currentLive * currentAvgWeightKg;
  const totalBiomassGain = currentBiomassKg + totalHarvestKg;

  // 3. Pakan
  const feedReceived = feed.filter((r) => r.kind === 'masuk').reduce((acc, r) => acc + n(r.kg), 0);
  const feedConsumed = feed.filter((r) => r.kind === 'pakai').reduce((acc, r) => acc + n(r.kg), 0);
  const feedStock = feedReceived - feedConsumed;

  const totalFeedPurchasedCost = feed
    .filter((r) => r.kind === 'masuk')
    .reduce((acc, r) => acc + n(r.kg) * n(r.price), 0);
  const avgFeedPricePerKg = feedReceived > 0 ? totalFeedPurchasedCost / feedReceived : 8800;

  const feedCostActual = feed
    .filter((r) => r.kind === 'pakai')
    .reduce((acc, r) => acc + n(r.kg) * (n(r.price) || avgFeedPricePerKg), 0);

  // 4. FCR (Feed Conversion Ratio)
  // FCR = Total Pakan Dikonsumsi / (Biomassa Hidup saat ini + Bobot Total Panen yang telah dikeluarkan)
  const runningFcr = totalBiomassGain > 0 ? feedConsumed / totalBiomassGain : null;

  // 5. Indeks Performa (IP / EPEF)
  // IP = (Daya Hidup (%) * Bobot Rata-rata (kg)) / (FCR * Umur rata-rata (hari)) * 100
  let ip: number | null = null;
  const effectiveAge = calendarAge > 0 ? calendarAge : 1;
  if (runningFcr && runningFcr > 0 && currentAvgWeightKg > 0 && effectiveAge > 0) {
    ip = ((survivalRate * currentAvgWeightKg) / (runningFcr * effectiveAge)) * 100;
  }

  let ipCategory: IpCategory = {
    text: 'Belum Ada',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  if (ip !== null) {
    if (ip >= 400) {
      ipCategory = {
        text: 'Istimewa (Superb)',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    } else if (ip >= 351) {
      ipCategory = {
        text: 'Baik (Good)',
        color: 'bg-green-100 text-green-800 border-green-300',
      };
    } else if (ip >= 325) {
      ipCategory = {
        text: 'Cukup (Average)',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    } else {
      ipCategory = {
        text: 'Kurang (Underperform)',
        color: 'bg-rose-100 text-rose-800 border-rose-300',
      };
    }
  }

  // 6. Finansial Realisasi Berjalan
  const docCost = cycle.doc * cycle.docPrice;
  const expenseCost = expenses.reduce((acc, r) => acc + n(r.amount), 0);
  const runningCost = docCost + feedCostActual + expenseCost;
  const harvestRevenue = harvest.reduce((acc, r) => acc + n(r.kg) * n(r.price), 0);

  const hppPerKg = totalBiomassGain > 0 ? runningCost / totalBiomassGain : 0;
  const hppPerBird = cycle.doc - totalDepleted > 0 ? runningCost / (cycle.doc - totalDepleted) : 0;

  // 7. Proyeksi Sampai Panen Target
  const daysRemaining = Math.max(0, cycle.targetAge - calendarAge);
  const projectedMortalityRemaining = Math.round(currentLive * 0.0008 * daysRemaining);
  const projectedHarvestBirds = Math.max(0, currentLive - projectedMortalityRemaining);
  const projectedHarvestKg = projectedHarvestBirds * cycle.targetWeight;
  const projectedTotalTonase = totalHarvestKg + projectedHarvestKg;

  const targetTotalFeedNeeded = projectedTotalTonase * cycle.targetFcr;
  const projectedRemainingFeedKg = Math.max(0, targetTotalFeedNeeded - feedConsumed);
  const projectedRemainingFeedCost = projectedRemainingFeedKg * avgFeedPricePerKg;

  const projectedTotalCost = runningCost + projectedRemainingFeedCost;
  const projectedTotalRevenue = harvestRevenue + projectedHarvestKg * cycle.sellPrice;
  const projectedProfit = projectedTotalRevenue - projectedTotalCost;

  const bepPricePerKg = projectedTotalTonase > 0 ? projectedTotalCost / projectedTotalTonase : 0;
  const bepKgNeeded = cycle.sellPrice > 0 ? projectedTotalCost / cycle.sellPrice : 0;

  return {
    cycle,
    totalDead,
    totalCull,
    totalDepleted,
    totalHarvestBirds,
    totalHarvestKg,
    currentLive,
    mortalityRate,
    depletionRate,
    survivalRate,
    calendarAge,
    currentAvgWeightKg,
    currentBiomassKg,
    totalBiomassGain,
    feedReceived,
    feedConsumed,
    feedStock,
    avgFeedPricePerKg,
    feedCostActual,
    runningFcr,
    ip,
    ipCategory,
    docCost,
    expenseCost,
    runningCost,
    harvestRevenue,
    hppPerKg,
    hppPerBird,
    daysRemaining,
    projectedHarvestBirds,
    projectedHarvestKg,
    projectedTotalTonase,
    projectedRemainingFeedKg,
    projectedTotalCost,
    projectedTotalRevenue,
    projectedProfit,
    bepPricePerKg,
    bepKgNeeded,
  };
}

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
