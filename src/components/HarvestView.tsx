import React, { useState } from 'react';
import { PlusCircle, History, Check, Trash2 } from 'lucide-react';
import { HarvestRecord, FarmStats } from '../types';
import { uid, toIDR, toNum, getAgeAtDate, getLivePopulationAt, n } from '../utils/calculations';

interface HarvestViewProps {
  stats: FarmStats;
  state: any;
  onAddHarvest: (record: HarvestRecord) => void;
  onRequestDeleteHarvest: (record: HarvestRecord) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const HarvestView: React.FC<HarvestViewProps> = ({
  stats,
  state,
  onAddHarvest,
  onRequestDeleteHarvest,
  showToast,
}) => {
  const cycle = stats.cycle;
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [birds, setBirds] = useState<number | string>('');
  const [kg, setKg] = useState<number | string>('');
  const [price, setPrice] = useState<number | string>(cycle.sellPrice);
  const [buyer, setBuyer] = useState('');

  const cycleHarvestRows = state.harvest
    .filter((r: HarvestRecord) => r.cycleId === cycle.id)
    .sort((a: HarvestRecord, b: HarvestRecord) => b.date.localeCompare(a.date));

  const birdsNum = n(birds);
  const kgNum = n(kg);
  const liveAvg = birdsNum > 0 && kgNum > 0 ? kgNum / birdsNum : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (date < cycle.date) {
      showToast('Tanggal panen tidak boleh sebelum chick-in!', 'error');
      return;
    }

    if (birdsNum <= 0 || kgNum <= 0) {
      showToast('Jumlah ekor dan bobot harus lebih dari 0.', 'error');
      return;
    }

    const currentLiveAtDate = getLivePopulationAt(state, cycle, date);
    if (birdsNum > currentLiveAtDate) {
      showToast(
        `Jumlah ayam panen (${birdsNum} ekor) melebihi populasi saat ini (${currentLiveAtDate} ekor)!`,
        'error'
      );
      return;
    }

    const item: HarvestRecord = {
      id: uid(),
      cycleId: cycle.id,
      date,
      birds: birdsNum,
      kg: kgNum,
      price: n(price),
      buyer: buyer.trim(),
    };

    onAddHarvest(item);
    showToast('Data panen berhasil disimpan.');
    setBirds('');
    setKg('');
    setBuyer('');
  };

  return (
    <div className="space-y-6">
      {/* Harvest Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Ayam Terpanen</span>
          <div className="text-2xl font-black text-slate-800">
            {toNum(stats.totalHarvestBirds, 0)}{' '}
            <span className="text-xs font-normal text-slate-500">ekor</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Sisa di kandang: {toNum(stats.currentLive, 0)} ekor
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Total Bobot Panen</span>
          <div className="text-2xl font-black text-emerald-700">
            {toNum(stats.totalHarvestKg, 2)}{' '}
            <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Rata-rata:{' '}
            {stats.totalHarvestBirds > 0
              ? `${toNum(stats.totalHarvestKg / stats.totalHarvestBirds, 3)} kg/ekor`
              : '—'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">
            Total Omzet Penjualan
          </span>
          <div className="text-2xl font-black text-slate-800">{toIDR(stats.harvestRevenue)}</div>
          <div className="text-xs text-slate-400 mt-1">Realisasi penerimaan hasil panen</div>
        </div>
      </div>

      {/* Harvest Form */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          Catat Panen (Penjarangan / Panen Raya Final)
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Masukkan data timbang nota panen dari bakul atau broker unggas.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tanggal Panen
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Jumlah Ayam (Ekor)
              </label>
              <input
                type="number"
                min="1"
                max={stats.currentLive}
                required
                value={birds}
                onChange={(e) => setBirds(e.target.value)}
                placeholder={`Maks: ${stats.currentLive}`}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Total Tonase Bobot (Kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                placeholder="Contoh: 1250.5"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span
                className={`text-[11px] mt-1 inline-block ${
                  liveAvg ? 'text-emerald-700 font-semibold' : 'text-slate-400'
                }`}
              >
                Rata-rata: {liveAvg ? `${toNum(liveAvg, 3)} kg/ekor` : '— kg/ekor'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Harga Jual per Kg (Rp)
              </label>
              <input
                type="number"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nama Pembeli / Bakul
              </label>
              <input
                type="text"
                value={buyer}
                onChange={(e) => setBuyer(e.target.value)}
                placeholder="Contoh: UD. Berkah Unggas"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Simpan Data Panen
            </button>
          </div>
        </form>
      </div>

      {/* Harvest History */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" />
          Riwayat Pengeluaran Panen ({cycleHarvestRows.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Umur Panen</th>
                <th className="p-3">Jumlah (Ekor)</th>
                <th className="p-3">Total Bobot (Kg)</th>
                <th className="p-3">Rata-rata Bobot</th>
                <th className="p-3">Harga / Kg</th>
                <th className="p-3">Total Omzet</th>
                <th className="p-3">Pembeli</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cycleHarvestRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-slate-400">
                    Belum ada catatan panen di siklus ini.
                  </td>
                </tr>
              ) : (
                cycleHarvestRows.map((r: HarvestRecord) => {
                  const avg = n(r.birds) > 0 ? n(r.kg) / n(r.birds) : 0;
                  const age = getAgeAtDate(cycle.date, r.date);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-900">{r.date}</td>
                      <td className="p-3">Hari ke-{age}</td>
                      <td className="p-3 font-bold">{toNum(r.birds, 0)} ekor</td>
                      <td className="p-3 font-bold text-emerald-700">{toNum(r.kg, 2)} kg</td>
                      <td className="p-3">{toNum(avg, 3)} kg</td>
                      <td className="p-3">{toIDR(r.price)}</td>
                      <td className="p-3 font-bold text-slate-900">
                        {toIDR(n(r.kg) * n(r.price))}
                      </td>
                      <td className="p-3 text-slate-500">{r.buyer || '—'}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => onRequestDeleteHarvest(r)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus Data Panen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
