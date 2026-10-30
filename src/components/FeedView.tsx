import React, { useState } from 'react';
import { PlusCircle, History, ArrowDownLeft, ArrowUpRight, Trash2, Check } from 'lucide-react';
import { FeedKind, FeedRecord, FarmStats } from '../types';
import { uid, toIDR, toNum, n } from '../utils/calculations';

interface FeedViewProps {
  stats: FarmStats;
  state: any;
  onAddFeed: (record: FeedRecord) => void;
  onRequestDeleteFeed: (record: FeedRecord) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  stats,
  state,
  onAddFeed,
  onRequestDeleteFeed,
  showToast,
}) => {
  const cycle = stats.cycle;
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [kind, setKind] = useState<FeedKind>('pakai');
  const [kg, setKg] = useState<number | string>('');
  const [price, setPrice] = useState<number | string>(Math.round(stats.avgFeedPricePerKg));
  const [note, setNote] = useState('');

  const cycleFeedRows = state.feed
    .filter((r: FeedRecord) => r.cycleId === cycle.id)
    .sort((a: FeedRecord, b: FeedRecord) => b.date.localeCompare(a.date));

  const handleKindChange = (newKind: FeedKind) => {
    setKind(newKind);
    if (newKind === 'pakai') {
      setPrice(Math.round(stats.avgFeedPricePerKg));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (date < cycle.date) {
      showToast('Tanggal transaksi tidak boleh sebelum chick-in!', 'error');
      return;
    }

    const kgVal = n(kg);
    const priceVal = n(price);

    if (kgVal <= 0) {
      showToast('Jumlah pakan harus lebih besar dari 0.', 'error');
      return;
    }

    // Check warehouse stock if consuming
    if (kind === 'pakai' && stats.feedStock < kgVal) {
      showToast(
        `Stok pakan gudang tidak mencukupi (${toNum(stats.feedStock, 1)} kg tersedia, ingin pakai ${toNum(
          kgVal,
          1
        )} kg).`,
        'error'
      );
      return;
    }

    const item: FeedRecord = {
      id: uid(),
      cycleId: cycle.id,
      date,
      kind,
      kg: kgVal,
      price: priceVal,
      note: note.trim(),
    };

    onAddFeed(item);
    showToast('Transaksi pakan berhasil disimpan.');
    setKg('');
    setNote('');
  };

  return (
    <div className="space-y-6">
      {/* Feed Stats Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">
            Total Pakan Masuk (Restock)
          </span>
          <div className="text-2xl font-black text-slate-800">
            {toNum(stats.feedReceived, 1)}{' '}
            <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            ± {toNum(stats.feedReceived / 50, 1)} sak (karung 50kg)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">
            Total Pakan Dikonsumsi
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {toNum(stats.feedConsumed, 1)}{' '}
            <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Total nilai konsumsi: {toIDR(stats.feedCostActual)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">
            Sisa Stok di Gudang
          </span>
          <div
            className={`text-2xl font-black ${
              stats.feedStock < 500 ? 'text-rose-600' : 'text-slate-800'
            }`}
          >
            {toNum(stats.feedStock, 1)}{' '}
            <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Rata-rata: {toIDR(stats.avgFeedPricePerKg)} / kg
          </div>
        </div>
      </div>

      {/* Feed Form */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          Catat Transaksi Pakan (Masuk / Pakai)
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Pakan masuk menambah stok gudang. Pakan konsumsi akan langsung dihitung ke FCR & HPP
          berjalan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal</label>
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
                Jenis Transaksi
              </label>
              <select
                value={kind}
                onChange={(e) => handleKindChange(e.target.value as FeedKind)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="pakai">Pakan Dikonsumsi (Pakai Harian)</option>
                <option value="masuk">Pakan Masuk (Pembelian/Restock)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Jumlah Pakan (Kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                placeholder="Contoh: 250"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Harga per Kg (Rp)
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
                Jenis Pakan / Keterangan
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Pre-starter BR-1"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Simpan Transaksi Pakan
            </button>
          </div>
        </form>
      </div>

      {/* Feed History */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" />
          Riwayat Transaksi Pakan ({cycleFeedRows.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Tipe</th>
                <th className="p-3">Jumlah (Kg)</th>
                <th className="p-3">Harga / Kg</th>
                <th className="p-3">Total Nilai</th>
                <th className="p-3">Keterangan</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cycleFeedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-400">
                    Belum ada transaksi pakan di siklus ini.
                  </td>
                </tr>
              ) : (
                cycleFeedRows.map((r: FeedRecord) => {
                  const isMasuk = r.kind === 'masuk';
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold text-slate-900">{r.date}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            isMasuk
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isMasuk ? (
                            <>
                              <ArrowDownLeft className="w-3.5 h-3.5" /> Masuk (Restock)
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5" /> Pakai (Konsumsi)
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">{toNum(r.kg, 2)} kg</td>
                      <td className="p-3">{toIDR(r.price)}</td>
                      <td className="p-3 font-semibold text-slate-900">
                        {toIDR(n(r.kg) * n(r.price))}
                      </td>
                      <td className="p-3 text-slate-500">{r.note || '—'}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => onRequestDeleteFeed(r)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus Transaksi Pakan"
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
