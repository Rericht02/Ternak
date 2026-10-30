import React, { useEffect, useRef } from 'react';
import {
  Users,
  Skull,
  Scale,
  Award,
  Weight,
  Package,
  Calculator,
  TrendingUp,
  Droplet,
  Plus,
  Boxes,
  Truck,
  Sparkles,
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { FarmState, FarmStats } from '../types';
import { toIDR, toNum, getAgeAtDate, n } from '../utils/calculations';
import { TabId } from './NavTabs';

interface DashboardViewProps {
  stats: FarmStats;
  state: FarmState;
  onNavigate: (tabId: TabId) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ stats, state, onNavigate }) => {
  const c = stats.cycle;
  const weightProgress = Math.min(100, Math.max(0, (stats.currentAvgWeightKg / c.targetWeight) * 100));
  const ageProgress = Math.min(100, Math.max(0, (stats.calendarAge / c.targetAge) * 100));
  const isMortalityWarn = stats.mortalityRate > 4.0;

  const weightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const vitalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let weightChartInstance: Chart | null = null;
    let vitalChartInstance: Chart | null = null;

    const dailyRows = [...state.daily]
      .filter((r) => r.cycleId === c.id)
      .sort((a, b) => a.date.localeCompare(b.date));

    // 1. Chart Pertumbuhan Bobot
    if (weightCanvasRef.current) {
      const labels = dailyRows.map((r) => `H-${getAgeAtDate(c.date, r.date)}`);
      const actualData = dailyRows.map((r) => (n(r.weight) > 0 ? n(r.weight) : null));

      // Standar kurva Cobb/Ross estimasi
      const targetData = dailyRows.map((r) => {
        const age = getAgeAtDate(c.date, r.date);
        if (age <= 0) return 42;
        return Math.round(42 + 20 * Math.pow(age, 1.35));
      });

      weightChartInstance = new Chart(weightCanvasRef.current, {
        type: 'line',
        data: {
          labels: labels.length ? labels : ['H-0'],
          datasets: [
            {
              label: 'Sampling Bobot Nyata (g)',
              data: actualData.length ? actualData : [42],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              borderWidth: 2.5,
              fill: true,
              tension: 0.3,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: '#10b981',
            },
            {
              label: 'Standar Referensi Target (g)',
              data: targetData.length ? targetData : [42],
              borderColor: '#94a3b8',
              borderDash: [5, 5],
              borderWidth: 1.5,
              fill: false,
              tension: 0.3,
              pointRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, font: { size: 11, family: 'Inter' } },
            },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  `${ctx.dataset.label}: ${
                    ctx.raw ? Number(ctx.raw).toLocaleString('id-ID') + ' gram' : '—'
                  }`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Bobot (gram)', font: { size: 10, family: 'Inter' } },
            },
            x: {
              grid: { display: false },
            },
          },
        },
      });
    }

    // 2. Chart Vitalitas: Konsumsi Air vs Kematian
    if (vitalCanvasRef.current) {
      const labels = dailyRows.map((r) => `H-${getAgeAtDate(c.date, r.date)}`);
      const waterData = dailyRows.map((r) => n(r.water));
      const deadData = dailyRows.map((r) => n(r.dead));

      vitalChartInstance = new Chart(vitalCanvasRef.current, {
        data: {
          labels: labels.length ? labels : ['H-0'],
          datasets: [
            {
              type: 'bar',
              label: 'Ayam Mati (Ekor)',
              data: deadData.length ? deadData : [0],
              backgroundColor: '#f43f5e',
              borderRadius: 4,
              yAxisID: 'y1',
            },
            {
              type: 'line',
              label: 'Konsumsi Air (Liter)',
              data: waterData.length ? waterData : [0],
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.12)',
              borderWidth: 2,
              tension: 0.3,
              fill: true,
              yAxisID: 'y',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, font: { size: 11, family: 'Inter' } },
            },
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: { display: true, text: 'Air (Liter)', font: { size: 10, family: 'Inter' } },
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: { drawOnChartArea: false },
              title: {
                display: true,
                text: 'Kematian (Ekor)',
                font: { size: 10, family: 'Inter' },
              },
              suggestedMax: 20,
            },
            x: {
              grid: { display: false },
            },
          },
        },
      });
    }

    return () => {
      if (weightChartInstance) weightChartInstance.destroy();
      if (vitalChartInstance) vitalChartInstance.destroy();
    };
  }, [c.id, c.date, state.daily]);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 border border-emerald-700/50">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="bg-emerald-500/30 text-emerald-100 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-400/30">
              {c.farm}
            </span>
            <span className="text-xs text-emerald-200">Chick-in: {c.date}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{c.house}</h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
            Populasi Awal: <strong>{toNum(c.doc, 0)} DOC</strong> • Target Panen:{' '}
            <strong>
              Hari ke-{c.targetAge} ({toNum(c.targetWeight, 2)} kg/ekor)
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-950/50 backdrop-blur border border-emerald-500/30 px-4 py-2.5 rounded-2xl text-center shadow-inner">
            <div className="text-[11px] text-emerald-200 uppercase tracking-wide font-medium">
              Umur Pemeliharaan
            </div>
            <div className="text-2xl font-black text-white">Hari {stats.calendarAge}</div>
          </div>
          <div className="bg-emerald-950/50 backdrop-blur border border-emerald-500/30 px-4 py-2.5 rounded-2xl text-center shadow-inner">
            <div className="text-[11px] text-emerald-200 uppercase tracking-wide font-medium">
              Daya Hidup (SR)
            </div>
            <div className="text-2xl font-black text-white">{toNum(stats.survivalRate, 1)}%</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Populasi Hidup */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Populasi di Kandang</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800">
            {toNum(stats.currentLive, 0)}{' '}
            <span className="text-xs font-normal text-slate-500">ekor</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Dari total {toNum(c.doc, 0)} DOC masuk
          </div>
        </div>

        {/* Mortalitas & Afkir */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Mortalitas & Afkir</span>
            <div
              className={`p-1.5 rounded-lg ${
                isMortalityWarn ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
              }`}
            >
              <Skull className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl sm:text-2xl font-black ${
              isMortalityWarn ? 'text-rose-600' : 'text-slate-800'
            }`}
          >
            {toNum(stats.depletionRate, 2)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Mati: {stats.totalDead} | Afkir: {stats.totalCull} ekor
          </div>
        </div>

        {/* FCR Berjalan */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">FCR Berjalan</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800">
            {stats.runningFcr ? toNum(stats.runningFcr, 3) : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Target FCR Panen: {toNum(c.targetFcr, 2)}
          </div>
        </div>

        {/* Indeks Performa (IP) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Indeks Performa (IP)</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800">
            {stats.ip ? toNum(stats.ip, 1) : '—'}
          </div>
          <div className="mt-1">
            <span
              className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${stats.ipCategory.color}`}
            >
              {stats.ipCategory.text}
            </span>
          </div>
        </div>

        {/* Bobot Terakhir & Biomassa */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Bobot Rata-rata</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Weight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-800">
            {stats.currentAvgWeightKg > 0 ? `${toNum(stats.currentAvgWeightKg, 3)} kg` : 'Belum Ada'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Biomassa: ±{toNum(stats.currentBiomassKg, 0)} kg
          </div>
        </div>

        {/* Stok Sisa Pakan */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Stok Sisa Pakan</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl sm:text-2xl font-black ${
              stats.feedStock < 500 ? 'text-amber-600' : 'text-slate-800'
            }`}
          >
            {toNum(stats.feedStock, 1)}{' '}
            <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Terpakai: {toNum(stats.feedConsumed, 0)} kg
          </div>
        </div>

        {/* HPP Sementara */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">HPP Sementara / kg</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-800">
            {toIDR(stats.hppPerKg)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Biaya Masuk: {toIDR(stats.runningCost)}
          </div>
        </div>

        {/* Proyeksi Laba Bersih */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Proyeksi Laba Siklus</span>
            <div
              className={`p-1.5 rounded-lg ${
                stats.projectedProfit >= 0
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-lg sm:text-xl font-black ${
              stats.projectedProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {toIDR(stats.projectedProfit)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Est. Omzet: {toIDR(stats.projectedTotalRevenue)}
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>
              Pencapaian Bobot Panen ({toNum(stats.currentAvgWeightKg, 2)} /{' '}
              {toNum(c.targetWeight, 2)} kg)
            </span>
            <span className="text-emerald-700 font-bold">{toNum(weightProgress, 1)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${weightProgress}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>
              Progress Umur Siklus (Hari ke-{stats.calendarAge} / Target {c.targetAge} hari)
            </span>
            <span className="text-emerald-700 font-bold">{toNum(ageProgress, 1)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-emerald-700 h-3 rounded-full transition-all duration-500"
              style={{ width: `${ageProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kurva Pertumbuhan Bobot */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Kurva Bobot Sampling vs Standar Cobb (gram)
            </h3>
            <span className="text-xs text-slate-400">Pertumbuhan Ayam</span>
          </div>
          <div className="relative h-64 w-full">
            <canvas ref={weightCanvasRef} />
          </div>
        </div>

        {/* Konsumsi Air & Kematian */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-cyan-600" />
              Tren Konsumsi Air (Liter) & Kematian (Ekor)
            </h3>
            <span className="text-xs text-slate-400">Monitoring Kondisi</span>
          </div>
          <div className="relative h-64 w-full">
            <canvas ref={vitalCanvasRef} />
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-emerald-950 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Ingin mencatat perkembangan hari ini atau transaksi baru?</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate('daily')}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Catat Harian
          </button>
          <button
            onClick={() => onNavigate('feed')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-emerald-900 border border-emerald-300 text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Boxes className="w-3.5 h-3.5" /> Catat Pakan
          </button>
          <button
            onClick={() => onNavigate('harvest')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-emerald-900 border border-emerald-300 text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" /> Catat Panen
          </button>
        </div>
      </div>
    </div>
  );
};
