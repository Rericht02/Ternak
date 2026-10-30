import React, { useState } from 'react';
import { Award, TrendingUp, Sliders, CheckCircle2 } from 'lucide-react';
import { FarmStats } from '../types';
import { toIDR, toNum } from '../utils/calculations';

interface ForecastViewProps {
  stats: FarmStats;
}

export const ForecastView: React.FC<ForecastViewProps> = ({ stats }) => {
  const c = stats.cycle;

  // Interactive What-If Simulation State
  const [simSellPrice, setSimSellPrice] = useState<number>(c.sellPrice);
  const [simTargetWeight, setSimTargetWeight] = useState<number>(c.targetWeight);
  const [simTargetFcr, setSimTargetFcr] = useState<number>(c.targetFcr);

  // Simulation calculations
  const simProjectedHarvestKg = stats.projectedHarvestBirds * simTargetWeight;
  const simTotalTonase = stats.totalHarvestKg + simProjectedHarvestKg;
  const simTotalFeedNeeded = simTotalTonase * simTargetFcr;
  const simRemainingFeedKg = Math.max(0, simTotalFeedNeeded - stats.feedConsumed);
  const simRemainingFeedCost = simRemainingFeedKg * stats.avgFeedPricePerKg;
  const simTotalCost = stats.runningCost + simRemainingFeedCost;
  const simTotalRevenue = stats.harvestRevenue + simProjectedHarvestKg * simSellPrice;
  const simProfit = simTotalRevenue - simTotalCost;
  const simBepPrice = simTotalTonase > 0 ? simTotalCost / simTotalTonase : 0;
  const simRoi = simTotalCost > 0 ? (simProfit / simTotalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* IP Explainer Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Indeks Performa (IP) Broiler Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Parameter patokan efisiensi manajemen pemeliharaan ayam broiler modern (EPEF - European
              Production Efficiency Factor).
            </p>
          </div>
          <div className="text-left md:text-right">
            <span className="text-xs text-slate-500">Nilai IP Berjalan Saat Ini:</span>
            <div className="text-3xl font-black text-slate-800">
              {stats.ip ? toNum(stats.ip, 1) : '—'}
            </div>
            <span
              className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${stats.ipCategory.color}`}
            >
              {stats.ipCategory.text}
            </span>
          </div>
        </div>

        {/* Formula Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-700 leading-relaxed mb-5">
          <strong>Rumus Standar:</strong>
          <br />
          IP = [ Daya Hidup (%) × Rata-rata Bobot (kg) ] ÷ [ FCR × Rata-rata Umur (hari) ] × 100
          <div className="mt-2 text-slate-600 font-sans text-xs">
            Perhitungan Anda saat ini: [ {toNum(stats.survivalRate, 1)}% ×{' '}
            {toNum(stats.currentAvgWeightKg, 3)} kg ] ÷ [{' '}
            {stats.runningFcr ? toNum(stats.runningFcr, 3) : '1.500'} × {stats.calendarAge} hari ] ×
            100 ={' '}
            <strong className="text-emerald-800 text-sm">
              {stats.ip ? toNum(stats.ip, 1) : '—'}
            </strong>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-slate-400 block text-[11px]">Kurang</span>
            <span className="font-bold text-rose-600 text-sm">&lt; 325</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-slate-400 block text-[11px]">Cukup</span>
            <span className="font-bold text-amber-600 text-sm">325 – 350</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-slate-400 block text-[11px]">Baik</span>
            <span className="font-bold text-emerald-600 text-sm">351 – 400</span>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-slate-400 block text-[11px]">Istimewa</span>
            <span className="font-bold text-farm-700 text-sm">&gt; 400</span>
          </div>
        </div>
      </div>

      {/* Interactive What-If Simulation Playground */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl shadow-xs border border-emerald-200 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="w-5 h-5 text-emerald-700" />
          <h3 className="text-base font-bold text-emerald-950">
            Simulasi Interaktif & Analisis Sensitivitas Laba (What-If)
          </h3>
        </div>
        <p className="text-xs text-slate-600 mb-6">
          Ubah parameter di bawah ini untuk melihat dampaknya terhadap laba bersih, titik impas
          (BEP), dan perkiraan kebutuhan pakan.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex justify-between">
              <span>Skenario Harga Jual / kg</span>
              <span className="text-emerald-700 font-bold">{toIDR(simSellPrice)}</span>
            </label>
            <input
              type="range"
              min="15000"
              max="28000"
              step="250"
              value={simSellPrice}
              onChange={(e) => setSimSellPrice(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Rp 15.000</span>
              <span>Rp 28.000</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex justify-between">
              <span>Target Bobot Panen</span>
              <span className="text-emerald-700 font-bold">{toNum(simTargetWeight, 2)} kg</span>
            </label>
            <input
              type="range"
              min="1.4"
              max="2.8"
              step="0.05"
              value={simTargetWeight}
              onChange={(e) => setSimTargetWeight(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1.40 kg</span>
              <span>2.80 kg</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5 flex justify-between">
              <span>Target FCR Panen</span>
              <span className="text-emerald-700 font-bold">{toNum(simTargetFcr, 2)}</span>
            </label>
            <input
              type="range"
              min="1.3"
              max="1.8"
              step="0.01"
              value={simTargetFcr}
              onChange={(e) => setSimTargetFcr(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1.30 (Efisien)</span>
              <span>1.80 (Boros)</span>
            </div>
          </div>
        </div>

        {/* Simulation Output Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
            <span className="text-[11px] text-slate-500 font-semibold block mb-1">
              Proyeksi Laba Bersih
            </span>
            <div
              className={`text-xl font-black ${
                simProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {toIDR(simProfit)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">ROI: {toNum(simRoi, 1)}%</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
            <span className="text-[11px] text-slate-500 font-semibold block mb-1">
              BEP Harga Impas / kg
            </span>
            <div className="text-xl font-black text-slate-800">{toIDR(simBepPrice)}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Margin:{' '}
              <span className={simSellPrice >= simBepPrice ? 'text-emerald-600' : 'text-rose-600'}>
                {toIDR(simSellPrice - simBepPrice)}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
            <span className="text-[11px] text-slate-500 font-semibold block mb-1">
              Total Tonase Panen
            </span>
            <div className="text-xl font-black text-slate-800">{toNum(simTotalTonase, 1)} kg</div>
            <div className="text-[11px] text-slate-400 mt-1">
              ± {toNum(stats.projectedHarvestBirds, 0)} ekor panen
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
            <span className="text-[11px] text-slate-500 font-semibold block mb-1">
              Pakan Tambahan Diperlukan
            </span>
            <div className="text-xl font-black text-slate-800">
              {toNum(simRemainingFeedKg, 0)} kg
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              ± {toNum(simRemainingFeedKg / 50, 1)} sak karung
            </div>
          </div>
        </div>
      </div>

      {/* Financial Projections Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Rincian Proyeksi Siklus Berdasarkan Target Awal
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Perhitungan proyeksi baku berdasarkan target kontrak awal (Target Umur {c.targetAge} hari,
          Bobot {toNum(c.targetWeight, 2)} kg, Target FCR {toNum(c.targetFcr, 2)}).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600">Populasi Saat Ini</span>
              <span className="font-bold text-slate-900">
                {toNum(stats.currentLive, 0)} ekor
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600">Estimasi Ekor Panen Tersisa</span>
              <span className="font-bold text-slate-900">
                {toNum(stats.projectedHarvestBirds, 0)} ekor
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600">Estimasi Bobot Panen Tersisa</span>
              <span className="font-bold text-slate-900">
                {toNum(stats.projectedHarvestKg, 1)} kg
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600">Target Harga Jual / kg</span>
              <span className="font-bold text-emerald-700">{toIDR(c.sellPrice)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600">Kebutuhan Tambahan Pakan</span>
              <span className="font-bold text-slate-900">
                {toNum(stats.projectedRemainingFeedKg, 1)} kg
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600">Estimasi Biaya Pakan Tambahan</span>
              <span className="font-bold text-slate-900">
                {toIDR(stats.projectedRemainingFeedKg * stats.avgFeedPricePerKg)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600">Biaya Realisasi Berjalan</span>
              <span className="font-bold text-slate-900">{toIDR(stats.runningCost)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600">Estimasi Total Biaya Produksi</span>
              <span className="font-bold text-rose-700">
                {toIDR(stats.projectedTotalCost)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-600">Estimasi Total Pendapatan</span>
              <span className="font-bold text-emerald-700">
                {toIDR(stats.projectedTotalRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5 bg-emerald-50/80 px-3 rounded-xl border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Proyeksi Laba Bersih
              </span>
              <span
                className={`text-base font-black ${
                  stats.projectedProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {toIDR(stats.projectedProfit)}
              </span>
            </div>
          </div>
        </div>

        {/* BEP Analysis */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold block mb-1">
              BEP Harga Impas (Break Even Point / kg)
            </span>
            <div className="text-xl font-bold text-slate-800">
              {toIDR(stats.bepPricePerKg)} / kg
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Jika harga pasar peternak di atas angka ini, maka siklus dipastikan untung bersih.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold block mb-1">
              BEP Tonase Minimal (Kg Total Panen)
            </span>
            <div className="text-xl font-bold text-slate-800">
              {toNum(stats.bepKgNeeded, 1)} kg
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Total berat ayam hidup yang wajib terpanen untuk menutup seluruh biaya produksi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
