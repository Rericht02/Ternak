import React from 'react';
import { Database, Download, Upload, RotateCcw, FileSpreadsheet } from 'lucide-react';
import { FarmState, FarmStats } from '../types';
import { downloadFile, getAgeAtDate, toNum, n } from '../utils/calculations';

interface BackupViewProps {
  state: FarmState;
  stats: FarmStats;
  onImportState: (newState: FarmState) => void;
  onRequestResetAll: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onRequestConfirm: (title: string, msg: string, onConfirm: () => void) => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  state,
  stats,
  onImportState,
  onRequestResetAll,
  showToast,
  onRequestConfirm,
}) => {
  const cycle = stats.cycle;

  // 1. JSON Export
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const filename = `BroilerPro_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    downloadFile(filename, dataStr, 'application/json');
    showToast('Cadangan JSON berhasil diunduh.');
  };

  // 2. JSON Import
  const handleJSONFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Berkas terlalu besar (Maksimal 5MB).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.cycles || !Array.isArray(parsed.cycles) || parsed.cycles.length === 0) {
          throw new Error('Format JSON tidak sesuai dengan skema Broiler Farm Pro.');
        }

        onRequestConfirm(
          'Impor Data JSON',
          `Ditemukan ${parsed.cycles.length} siklus dalam file cadangan. Timpa seluruh data yang ada sekarang dengan file ini?`,
          () => {
            onImportState(parsed);
            showToast('Data berhasil dipulihkan dari cadangan JSON.');
          }
        );
      } catch (err: any) {
        showToast('Gagal membaca berkas JSON: ' + (err?.message || 'Format tidak valid'), 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 3. CSV Export
  const handleExportCSV = (type: 'daily' | 'feed' | 'harvest' | 'expenses') => {
    const cleanHouse = cycle.house.replace(/\s+/g, '_');
    const filename = `Broiler_${type}_${cleanHouse}.csv`;
    const lines: (string | number)[][] = [];

    if (type === 'daily') {
      lines.push([
        'Tanggal',
        'Umur_Hari',
        'Ayam_Mati',
        'Ayam_Afkir',
        'Bobot_Gram',
        'Jumlah_Sampel',
        'Suhu_C',
        'Kelembapan_RH',
        'Konsumsi_Air_L',
        'Catatan',
      ]);
      const rows = [...state.daily]
        .filter((r) => r.cycleId === cycle.id)
        .sort((a, b) => a.date.localeCompare(b.date));

      rows.forEach((r) => {
        lines.push([
          r.date,
          getAgeAtDate(cycle.date, r.date),
          r.dead,
          r.cull,
          r.weight ?? '',
          r.samples ?? '',
          r.temp ?? '',
          r.humidity ?? '',
          r.water ?? '',
          r.note ?? '',
        ]);
      });
    } else if (type === 'feed') {
      lines.push([
        'Tanggal',
        'Tipe_Transaksi',
        'Jumlah_Kg',
        'Harga_Per_Kg',
        'Total_Rupiah',
        'Keterangan',
      ]);
      const rows = [...state.feed]
        .filter((r) => r.cycleId === cycle.id)
        .sort((a, b) => a.date.localeCompare(b.date));

      rows.forEach((r) => {
        lines.push([
          r.date,
          r.kind === 'masuk' ? 'Restock/Masuk' : 'Konsumsi/Pakai',
          r.kg,
          r.price,
          n(r.kg) * n(r.price),
          r.note ?? '',
        ]);
      });
    } else if (type === 'harvest') {
      lines.push([
        'Tanggal',
        'Umur_Hari',
        'Jumlah_Ekor',
        'Total_Kg',
        'Rata2_Kg_Per_Ekor',
        'Harga_Per_Kg',
        'Total_Omzet',
        'Pembeli',
      ]);
      const rows = [...state.harvest]
        .filter((r) => r.cycleId === cycle.id)
        .sort((a, b) => a.date.localeCompare(b.date));

      rows.forEach((r) => {
        const avg = n(r.birds) > 0 ? (n(r.kg) / n(r.birds)).toFixed(3) : '0';
        lines.push([
          r.date,
          getAgeAtDate(cycle.date, r.date),
          r.birds,
          r.kg,
          avg,
          r.price,
          n(r.kg) * n(r.price),
          r.buyer ?? '',
        ]);
      });
    } else if (type === 'expenses') {
      lines.push(['Tanggal', 'Kategori', 'Nominal_Rupiah', 'Keterangan']);
      const rows = [...state.expenses]
        .filter((r) => r.cycleId === cycle.id)
        .sort((a, b) => a.date.localeCompare(b.date));

      rows.forEach((r) => {
        lines.push([r.date, r.category, r.amount, r.note ?? '']);
      });
    }

    const csvContent =
      '\uFEFF' +
      lines
        .map((row) =>
          row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';')
        )
        .join('\r\n');

    downloadFile(filename, csvContent, 'text/csv;charset=utf-8');
    showToast(`Berkas CSV ${type} berhasil diunduh.`);
  };

  return (
    <div className="space-y-6">
      {/* JSON Backup Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          Cadangan & Pemulihan Data (JSON)
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Seluruh data tersimpan aman di peramban lokal perangkat Anda. Selalu lakukan backup rutin
          agar data tidak terhapus saat membersihkan cache atau riwayat browser.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Unduh Cadangan JSON
          </button>

          <label className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-600" /> Impor Berkas JSON
            <input
              type="file"
              accept=".json"
              onChange={handleJSONFileChange}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={onRequestResetAll}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Reset ke Data Demo
          </button>
        </div>
      </div>

      {/* CSV Export Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          Ekspor Laporan ke Spreadsheet (CSV)
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Unduh data dalam format CSV standar (pemisah titik koma / semicolon) untuk dibuka di
          Microsoft Excel atau Google Sheets.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 hover:bg-white transition flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">Data Harian Kandang</h4>
              <p className="text-[11px] text-slate-500 mb-3">
                Mortalitas, sampling timbang, suhu, kelembaban, & air.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleExportCSV('daily')}
              className="w-full py-2 bg-white border border-slate-300 hover:border-emerald-600 text-slate-700 hover:text-emerald-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Unduh CSV Harian
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 hover:bg-white transition flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">Data Logistik Pakan</h4>
              <p className="text-[11px] text-slate-500 mb-3">
                Transaksi pakan masuk, konsumsi harian, dan harga per kg.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleExportCSV('feed')}
              className="w-full py-2 bg-white border border-slate-300 hover:border-emerald-600 text-slate-700 hover:text-emerald-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Unduh CSV Pakan
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 hover:bg-white transition flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">Rekap Panen & Omzet</h4>
              <p className="text-[11px] text-slate-500 mb-3">
                Data penimbangan tonase panen, pembeli/bakul, & nilai jual.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleExportCSV('harvest')}
              className="w-full py-2 bg-white border border-slate-300 hover:border-emerald-600 text-slate-700 hover:text-emerald-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Unduh CSV Panen
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 hover:bg-white transition flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-1">Biaya Operasional</h4>
              <p className="text-[11px] text-slate-500 mb-3">
                Rincian pos OVK, sekam, gas pemanas, listrik, dan tenaga kerja.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleExportCSV('expenses')}
              className="w-full py-2 bg-white border border-slate-300 hover:border-emerald-600 text-slate-700 hover:text-emerald-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Unduh CSV Biaya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
