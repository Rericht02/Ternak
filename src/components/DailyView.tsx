import React, { useState } from 'react';
import { CalendarPlus, History, Save, RotateCcw, Trash2 } from 'lucide-react';
import { DailyRecord, FarmStats } from '../types';
import { uid, toNum, getAgeAtDate, getLivePopulationAt, n } from '../utils/calculations';

interface DailyViewProps {
  stats: FarmStats;
  state: any;
  onAddDaily: (record: DailyRecord) => void;
  onRequestDeleteDaily: (record: DailyRecord) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  stats,
  state,
  onAddDaily,
  onRequestDeleteDaily,
  showToast,
}) => {
  const cycle = stats.cycle;
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [dead, setDead] = useState<number | string>(0);
  const [cull, setCull] = useState<number | string>(0);
  const [weight, setWeight] = useState<string>('');
  const [samples, setSamples] = useState<string>('');
  const [temp, setTemp] = useState<string>('');
  const [humidity, setHumidity] = useState<string>('');
  const [water, setWater] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const estimatedAge = getAgeAtDate(cycle.date, date);
  const cycleDailyRows = state.daily
    .filter((r: DailyRecord) => r.cycleId === cycle.id)
    .sort((a: DailyRecord, b: DailyRecord) => b.date.localeCompare(a.date));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (date < cycle.date) {
      showToast('Tanggal catatan tidak boleh sebelum tanggal DOC chick-in!', 'error');
      return;
    }

    const existing = cycleDailyRows.find((r: DailyRecord) => r.date === date);
    if (existing) {
      showToast(
        `Catatan harian untuk tanggal ${date} sudah ada. Hapus data sebelumnya jika ingin mengganti.`,
        'error'
      );
      return;
    }

    const deadVal = n(dead);
    const cullVal = n(cull);
    const liveAvailable = getLivePopulationAt(state, cycle, date);

    if (deadVal + cullVal > liveAvailable) {
      showToast(
        `Mortalitas & afkir (${deadVal + cullVal} ekor) melebihi populasi ayam hidup (${liveAvailable} ekor)!`,
        'error'
      );
      return;
    }

    const item: DailyRecord = {
      id: uid(),
      cycleId: cycle.id,
      date,
      dead: deadVal,
      cull: cullVal,
      weight: weight ? n(weight) : null,
      samples: samples ? n(samples) : null,
      temp: temp ? n(temp) : null,
      humidity: humidity ? n(humidity) : null,
      water: water ? n(water) : null,
      note: note.trim(),
    };

    onAddDaily(item);
    showToast('Pencatatan harian berhasil disimpan.');

    // Reset fields except date
    setDead(0);
    setCull(0);
    setWeight('');
    setSamples('');
    setTemp('');
    setHumidity('');
    setWater('');
    setNote('');
  };

  const handleReset = () => {
    setDead(0);
    setCull(0);
    setWeight('');
    setSamples('');
    setTemp('');
    setHumidity('');
    setWater('');
    setNote('');
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-emerald-600" />
              Input Data Harian Peternakan
            </h3>
            <p className="text-xs text-slate-500">
              Mencatat mortalitas, sampling bobot tubuh, suhu, dan kondisi kandang.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500">Sisa Populasi Terbuka:</span>
            <span className="block text-sm sm:text-base font-extrabold text-emerald-700">
              {toNum(stats.currentLive, 0)} Ekor
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tanggal Catatan
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-block">
                Umur: Hari ke-{estimatedAge}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Ayam Mati (Ekor)
              </label>
              <input
                type="number"
                min="0"
                required
                value={dead}
                onChange={(e) => setDead(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Ayam Afkir / Culling (Ekor)
              </label>
              <input
                type="number"
                min="0"
                required
                value={cull}
                onChange={(e) => setCull(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Rata-rata Bobot Sampling (Gram)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Kosongkan jika tidak timbang"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Jumlah Sampel Timbang (Ekor)
              </label>
              <input
                type="number"
                min="0"
                value={samples}
                onChange={(e) => setSamples(e.target.value)}
                placeholder="Contoh: 100 ekor"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Suhu Kandang (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder="Contoh: 28.5"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Kelembapan Udara (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                placeholder="Contoh: 70"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Konsumsi Air Minum (Liter)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={water}
                onChange={(e) => setWater(e.target.value)}
                placeholder="Total air hari ini"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Catatan Tambahan / Perlakuan Khusus
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Vaksin gumboro via air minum, sekam ditambah di sekat 2"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Simpan Catatan Harian
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            Riwayat Pencatatan Harian ({cycleDailyRows.length} catatan)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Umur</th>
                <th className="p-3">Mati / Afkir</th>
                <th className="p-3">Bobot Sampling</th>
                <th className="p-3">Suhu / RH</th>
                <th className="p-3">Air Minum</th>
                <th className="p-3">Catatan</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cycleDailyRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-slate-400">
                    Belum ada catatan harian di siklus ini.
                  </td>
                </tr>
              ) : (
                cycleDailyRows.map((r: DailyRecord) => {
                  const age = getAgeAtDate(cycle.date, r.date);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-900">{r.date}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                          H-{age}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={n(r.dead) > 0 ? 'text-rose-600 font-bold' : ''}>
                          {n(r.dead)} mati
                        </span>{' '}
                        /{' '}
                        <span className={n(r.cull) > 0 ? 'text-amber-600 font-bold' : ''}>
                          {n(r.cull)} afkir
                        </span>
                      </td>
                      <td className="p-3 font-semibold">
                        {n(r.weight) > 0 ? (
                          <>
                            {toNum(r.weight, 0)} g{' '}
                            <span className="text-[10px] text-slate-400">
                              ({r.samples || 0} spl)
                            </span>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3">
                        {r.temp ? `${r.temp}°C` : '—'} / {r.humidity ? `${r.humidity}%` : '—'}
                      </td>
                      <td className="p-3">{r.water ? `${toNum(r.water, 0)} L` : '—'}</td>
                      <td className="p-3 max-w-xs truncate text-slate-500" title={r.note}>
                        {r.note || '—'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => onRequestDeleteDaily(r)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus Catatan"
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
