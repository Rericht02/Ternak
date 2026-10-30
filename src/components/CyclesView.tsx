import React, { useState } from 'react';
import { PlusCircle, List, Check, Trash2, Home } from 'lucide-react';
import { Cycle, FarmState } from '../types';
import { uid, toNum } from '../utils/calculations';

interface CyclesViewProps {
  state: FarmState;
  onAddCycle: (cycle: Cycle) => void;
  onSelectCycle: (cycleId: string) => void;
  onRequestDeleteCycle: (cycle: Cycle) => void;
}

export const CyclesView: React.FC<CyclesViewProps> = ({
  state,
  onAddCycle,
  onSelectCycle,
  onRequestDeleteCycle,
}) => {
  const [formData, setFormData] = useState({
    farm: '',
    house: '',
    date: new Date().toISOString().slice(0, 10),
    doc: 5000,
    docPrice: 7500,
    targetAge: 35,
    targetWeight: 2.1,
    targetFcr: 1.55,
    sellPrice: 21500,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farm.trim() || !formData.house.trim()) {
      return;
    }

    const newCycle: Cycle = {
      id: uid(),
      farm: formData.farm.trim(),
      house: formData.house.trim(),
      date: formData.date,
      doc: Number(formData.doc) || 1,
      docPrice: Number(formData.docPrice) || 0,
      targetAge: Number(formData.targetAge) || 35,
      targetWeight: Number(formData.targetWeight) || 2.0,
      targetFcr: Number(formData.targetFcr) || 1.5,
      sellPrice: Number(formData.sellPrice) || 20000,
    };

    onAddCycle(newCycle);
    setFormData({
      farm: formData.farm,
      house: '',
      date: new Date().toISOString().slice(0, 10),
      doc: 5000,
      docPrice: 7500,
      targetAge: 35,
      targetWeight: 2.1,
      targetFcr: 1.55,
      sellPrice: 21500,
    });
  };

  return (
    <div className="space-y-6">
      {/* Form New Cycle */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          Buka Siklus / Kandang Baru
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Daftarkan periode pemeliharaan baru untuk memulai pencatatan mandiri.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nama Peternakan / Farm
              </label>
              <input
                type="text"
                required
                value={formData.farm}
                onChange={(e) => setFormData({ ...formData, farm: e.target.value })}
                placeholder="Contoh: Berkah Mandiri Farm"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nama / Nomor Kandang
              </label>
              <input
                type="text"
                required
                value={formData.house}
                onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                placeholder="Contoh: Kandang Closed 2"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tanggal DOC Masuk (Chick-in)
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Jumlah DOC Masuk (Ekor)
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.doc}
                onChange={(e) => setFormData({ ...formData, doc: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Harga DOC per Ekor (Rp)
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.docPrice}
                onChange={(e) => setFormData({ ...formData, docPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Target Umur Panen (Hari)
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.targetAge}
                onChange={(e) => setFormData({ ...formData, targetAge: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Target Bobot Panen (Kg/Ekor)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={formData.targetWeight}
                onChange={(e) => setFormData({ ...formData, targetWeight: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Target FCR Standar
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                required
                value={formData.targetFcr}
                onChange={(e) => setFormData({ ...formData, targetFcr: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Target Harga Jual (Rp/Kg)
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.sellPrice}
                onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Simpan Siklus Baru
            </button>
          </div>
        </form>
      </div>

      {/* List of Cycles */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <List className="w-5 h-5 text-emerald-600" />
          Daftar Siklus Terdaftar ({state.cycles.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Status</th>
                <th className="p-3">Peternakan & Kandang</th>
                <th className="p-3">Chick-in</th>
                <th className="p-3">Populasi DOC</th>
                <th className="p-3">Target Panen</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.cycles.map((c) => {
                const isActive = c.id === state.active;
                return (
                  <tr
                    key={c.id}
                    className={`${isActive ? 'bg-emerald-50/50' : 'hover:bg-slate-50'} transition`}
                  >
                    <td className="p-3">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>{' '}
                          Aktif Digunakan
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectCycle(c.id)}
                          className="px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200 rounded-lg border border-slate-300 cursor-pointer"
                        >
                          Pilih Kandang
                        </button>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-emerald-600" />
                        {c.house}
                      </div>
                      <div className="text-[11px] text-slate-400">{c.farm}</div>
                    </td>
                    <td className="p-3">{c.date}</td>
                    <td className="p-3 font-semibold">{toNum(c.doc, 0)} ekor</td>
                    <td className="p-3">
                      Hari ke-{c.targetAge} ({toNum(c.targetWeight, 2)} kg / FCR{' '}
                      {toNum(c.targetFcr, 2)})
                    </td>
                    <td className="p-3 text-right">
                      {state.cycles.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => onRequestDeleteCycle(c)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus Siklus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Minimal 1 Siklus</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
