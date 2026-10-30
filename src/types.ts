export interface Cycle {
  id: string;
  farm: string;
  house: string;
  date: string; // YYYY-MM-DD chick-in
  doc: number; // Jumlah bibit DOC
  docPrice: number; // Harga per ekor DOC
  targetAge: number; // Hari target panen
  targetWeight: number; // Target bobot rata-rata (kg)
  targetFcr: number; // Target FCR
  sellPrice: number; // Estimasi harga jual livebird (Rp/kg)
}

export interface DailyRecord {
  id: string;
  cycleId: string;
  date: string;
  dead: number;
  cull: number;
  weight: number | null; // gram
  samples: number | null;
  temp: number | null; // Celsius
  humidity: number | null; // %
  water: number | null; // Liter
  note: string;
}

export type FeedKind = 'masuk' | 'pakai';

export interface FeedRecord {
  id: string;
  cycleId: string;
  date: string;
  kind: FeedKind;
  kg: number;
  price: number; // Harga per kg
  note: string;
}

export interface HarvestRecord {
  id: string;
  cycleId: string;
  date: string;
  birds: number;
  kg: number;
  price: number; // Harga jual per kg
  buyer: string;
}

export interface ExpenseRecord {
  id: string;
  cycleId: string;
  date: string;
  category: string;
  amount: number;
  note: string;
}

export interface FarmState {
  cycles: Cycle[];
  active: string;
  daily: DailyRecord[];
  feed: FeedRecord[];
  harvest: HarvestRecord[];
  expenses: ExpenseRecord[];
}

export interface IpCategory {
  text: string;
  color: string;
}

export interface FarmStats {
  cycle: Cycle;
  totalDead: number;
  totalCull: number;
  totalDepleted: number;
  totalHarvestBirds: number;
  totalHarvestKg: number;
  currentLive: number;
  mortalityRate: number;
  depletionRate: number;
  survivalRate: number;
  calendarAge: number;
  currentAvgWeightKg: number;
  currentBiomassKg: number;
  totalBiomassGain: number;
  feedReceived: number;
  feedConsumed: number;
  feedStock: number;
  avgFeedPricePerKg: number;
  feedCostActual: number;
  runningFcr: number | null;
  ip: number | null;
  ipCategory: IpCategory;
  docCost: number;
  expenseCost: number;
  runningCost: number;
  harvestRevenue: number;
  hppPerKg: number;
  hppPerBird: number;
  daysRemaining: number;
  projectedHarvestBirds: number;
  projectedHarvestKg: number;
  projectedTotalTonase: number;
  projectedRemainingFeedKg: number;
  projectedTotalCost: number;
  projectedTotalRevenue: number;
  projectedProfit: number;
  bepPricePerKg: number;
  bepKgNeeded: number;
}
