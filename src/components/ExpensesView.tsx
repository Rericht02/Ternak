import React, { useState } from 'react';
import { PlusCircle, History, Check, Trash2 } from 'lucide-react';
import { ExpenseRecord, FarmStats } from '../types';
import { uid, toIDR, toNum, n } from '../utils/calculations';

interface ExpensesViewProps {
  stats: FarmStats;
  state: any;
  onAddExpense: (record: ExpenseRecord) => void;
  onRequestDeleteExpense: (record: ExpenseRecord) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const CATEGORIES = [
  'OVK (Obat/Vaksin/Kimia)',
  'Sekam',
  'Gas/Pemanas',
  'Listrik',
  'Tenaga Kerja',
  'Air',
  'Transportasi',
  'Desinfektan Kandang',
  'Peralatan/Perawatan',
  'Lain-lain',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  stats,
  state,
  onAddExpense,
  onRequestDeleteExpense,
  showToast,
}) => {
  const cycle = stats.cycle;
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState<number | string>('');
  const [note, setNote] = useState('');

  const cycleExpenseRows = state.expenses
    .filter((r: ExpenseRecord) => r.cycleId === cycle.id)
    .sort((a: ExpenseRecord, b: ExpenseRecord) => b.date.localeCompare(a.date));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = n(amount);
    if (amountNum <= 0) {
      showToast('Nominal biaya harus lebih dari 0.', 'error');
      return;
    }

    const item: ExpenseRecord = {
      id: uid(),
      cycleId: cycle.id,
      date,
      category,
      amount: amountNum,
      note: note.trim(),
    };

    onAddExpense(item);
    showToast('Biaya operasional berhasil dicatat.');
    setAmount('');
    setNote('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">
            Total Biaya Operasional (Non-Pakan & DOC)
          </span>
          <div className="text-2xl font-black text-slate-800">{toIDR(stats.expenseCost)}</div>
          <div className="text-xs text-slate-400 mt-1">
            {cycleExpenseRows.length} pos transaksi tercatat
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">
            Biaya Pembelian DOC Awal
          </span>
          <div className="text-2xl font-black text-slate-800">{toIDR(stats.docCost)}</div>
          <div className="text-xs text-slate-400 mt-1">
            {toNum(cycle.doc, 0)} ekor @ {toIDR(cycle.docPrice)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">
            Total Biaya Berjalan Keseluruhan
          </span>
          <div className="text-2xl font-black text-rose-700">{toIDR(stats.runningCost)}</div>
          <div className="text-xs text-slate-400 mt-1">DOC + Pakan Terpakai + Biaya Ops</div>
        </div>
      </div>

      {/* Expenses Form */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          Catat Pengeluaran Operasional / OVK
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Catat seluruh pos biaya penunjang produksi agar perhitungan HPP dan proyeksi laba akurat.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                Kategori Biaya
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nominal Biaya (Rp)
              </label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 350000"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Keterangan / Rincian
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Vaksin ND Hitchner B1 5 vial"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Simpan Catatan Biaya
            </button>
          </div>
        </form>
      </div>

      {/* Expenses History */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" />
          Riwayat Pengeluaran Operasional ({cycleExpenseRows.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Nominal (Rp)</th>
                <th className="p-3">Keterangan</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cycleExpenseRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400">
                    Belum ada catatan biaya di siklus ini.
                  </td>
                </tr>
              ) : (
                cycleExpenseRows.map((r: ExpenseRecord) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold text-slate-900">{r.date}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium text-[11px] border border-slate-200">
                        {r.category}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{toIDR(r.amount)}</td>
                    <td className="p-3 text-slate-500">{r.note || '—'}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => onRequestDeleteExpense(r)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus Pengeluaran"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
