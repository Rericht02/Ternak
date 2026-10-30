/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Feather } from 'lucide-react';
import {
  FarmState,
  Cycle,
  DailyRecord,
  FeedRecord,
  HarvestRecord,
  ExpenseRecord,
} from './types';
import { getDefaultState } from './data/defaultData';
import { STORAGE_KEY, calculateStats, toIDR } from './utils/calculations';
import { Header } from './components/Header';
import { NavTabs, TabId } from './components/NavTabs';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { DashboardView } from './components/DashboardView';
import { CyclesView } from './components/CyclesView';
import { DailyView } from './components/DailyView';
import { FeedView } from './components/FeedView';
import { HarvestView } from './components/HarvestView';
import { ExpensesView } from './components/ExpensesView';
import { ForecastView } from './components/ForecastView';
import { BackupView } from './components/BackupView';

export default function App() {
  const [state, setState] = useState<FarmState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.cycles && parsed.cycles.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed reading localStorage', e);
    }
    const defaultData = getDefaultState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  });

  const [currentTab, setCurrentTab] = useState<TabId>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Confirmation Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed saving localStorage', e);
    }
  }, [state]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openConfirmModal = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const closeConfirmModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // Cycle management
  const handleSelectCycle = (cycleId: string) => {
    setState((prev) => ({ ...prev, active: cycleId }));
    showToast('Kandang aktif berhasil diganti.');
  };

  const handleAddCycle = (newCycle: Cycle) => {
    setState((prev) => ({
      ...prev,
      cycles: [...prev.cycles, newCycle],
      active: newCycle.id,
    }));
    showToast('Siklus baru berhasil ditambahkan dan diaktifkan.');
  };

  const handleRequestDeleteCycle = (cycle: Cycle) => {
    if (state.cycles.length <= 1) {
      showToast('Tidak dapat menghapus satu-satunya siklus tersisa.', 'error');
      return;
    }

    openConfirmModal(
      'Hapus Seluruh Siklus',
      `Apakah Anda yakin ingin menghapus siklus "${cycle.house}"? Seluruh data harian, pakan, panen, dan biaya siklus ini akan ikut terhapus permanen.`,
      () => {
        setState((prev) => {
          const nextCycles = prev.cycles.filter((c) => c.id !== cycle.id);
          const nextActive = prev.active === cycle.id ? nextCycles[0].id : prev.active;
          return {
            ...prev,
            cycles: nextCycles,
            active: nextActive,
            daily: prev.daily.filter((r) => r.cycleId !== cycle.id),
            feed: prev.feed.filter((r) => r.cycleId !== cycle.id),
            harvest: prev.harvest.filter((r) => r.cycleId !== cycle.id),
            expenses: prev.expenses.filter((r) => r.cycleId !== cycle.id),
          };
        });
        showToast('Siklus kandang berhasil dihapus.');
      }
    );
  };

  // Daily records
  const handleAddDaily = (record: DailyRecord) => {
    setState((prev) => ({ ...prev, daily: [...prev.daily, record] }));
  };

  const handleRequestDeleteDaily = (record: DailyRecord) => {
    openConfirmModal(
      'Hapus Catatan Harian',
      `Hapus pencatatan tanggal ${record.date} (H-${record.date})? Data yang dihapus tidak dapat dipulihkan.`,
      () => {
        setState((prev) => ({
          ...prev,
          daily: prev.daily.filter((r) => r.id !== record.id),
        }));
        showToast('Catatan harian berhasil dihapus.');
      }
    );
  };

  // Feed records
  const handleAddFeed = (record: FeedRecord) => {
    setState((prev) => ({ ...prev, feed: [...prev.feed, record] }));
  };

  const handleRequestDeleteFeed = (record: FeedRecord) => {
    openConfirmModal(
      'Hapus Transaksi Pakan',
      `Hapus catatan pakan sebesar ${record.kg} kg pada ${record.date}?`,
      () => {
        setState((prev) => ({
          ...prev,
          feed: prev.feed.filter((r) => r.id !== record.id),
        }));
        showToast('Transaksi pakan berhasil dihapus.');
      }
    );
  };

  // Harvest records
  const handleAddHarvest = (record: HarvestRecord) => {
    setState((prev) => ({ ...prev, harvest: [...prev.harvest, record] }));
  };

  const handleRequestDeleteHarvest = (record: HarvestRecord) => {
    openConfirmModal(
      'Hapus Data Panen',
      `Hapus catatan panen ${record.birds} ekor (${record.kg} kg) tanggal ${record.date}?`,
      () => {
        setState((prev) => ({
          ...prev,
          harvest: prev.harvest.filter((r) => r.id !== record.id),
        }));
        showToast('Data panen berhasil dihapus.');
      }
    );
  };

  // Expense records
  const handleAddExpense = (record: ExpenseRecord) => {
    setState((prev) => ({ ...prev, expenses: [...prev.expenses, record] }));
  };

  const handleRequestDeleteExpense = (record: ExpenseRecord) => {
    openConfirmModal(
      'Hapus Pengeluaran',
      `Hapus biaya ${record.category} sebesar ${toIDR(record.amount)} tanggal ${record.date}?`,
      () => {
        setState((prev) => ({
          ...prev,
          expenses: prev.expenses.filter((r) => r.id !== record.id),
        }));
        showToast('Biaya operasional berhasil dihapus.');
      }
    );
  };

  // Backup / Reset
  const handleImportState = (newState: FarmState) => {
    if (!newState.cycles.some((c) => c.id === newState.active)) {
      newState.active = newState.cycles[0].id;
    }
    setState(newState);
  };

  const handleRequestResetAll = () => {
    openConfirmModal(
      'Reset ke Data Awal Demo',
      'Tindakan ini akan menghapus semua riwayat kandang saat ini dan mengembalikan data demo standar. Lanjutkan?',
      () => {
        const fresh = getDefaultState();
        setState(fresh);
        showToast('Data berhasil di-reset ke kondisi awal.');
      }
    );
  };

  const stats = calculateStats(state);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <Header state={state} onSelectCycle={handleSelectCycle} />

      {/* Navigation Tabs */}
      <NavTabs currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {!stats ? (
          <div className="p-8 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200">
            Belum ada siklus kandang aktif. Tambahkan siklus baru di menu Kandang & Siklus.
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                stats={stats}
                state={state}
                onNavigate={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'cycles' && (
              <CyclesView
                state={state}
                onAddCycle={handleAddCycle}
                onSelectCycle={handleSelectCycle}
                onRequestDeleteCycle={handleRequestDeleteCycle}
              />
            )}

            {currentTab === 'daily' && (
              <DailyView
                stats={stats}
                state={state}
                onAddDaily={handleAddDaily}
                onRequestDeleteDaily={handleRequestDeleteDaily}
                showToast={showToast}
              />
            )}

            {currentTab === 'feed' && (
              <FeedView
                stats={stats}
                state={state}
                onAddFeed={handleAddFeed}
                onRequestDeleteFeed={handleRequestDeleteFeed}
                showToast={showToast}
              />
            )}

            {currentTab === 'harvest' && (
              <HarvestView
                stats={stats}
                state={state}
                onAddHarvest={handleAddHarvest}
                onRequestDeleteHarvest={handleRequestDeleteHarvest}
                showToast={showToast}
              />
            )}

            {currentTab === 'expenses' && (
              <ExpensesView
                stats={stats}
                state={state}
                onAddExpense={handleAddExpense}
                onRequestDeleteExpense={handleRequestDeleteExpense}
                showToast={showToast}
              />
            )}

            {currentTab === 'forecast' && <ForecastView stats={stats} />}

            {currentTab === 'backup' && (
              <BackupView
                state={state}
                stats={stats}
                onImportState={handleImportState}
                onRequestResetAll={handleRequestResetAll}
                showToast={showToast}
                onRequestConfirm={openConfirmModal}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Broiler Farm Pro</strong> • Sistem Informasi Pengawasan Ternak Unggas
            </span>
          </div>
          <div>Standarisasi Standar FCR, IP & Biomassa Terintegrasi</div>
        </div>
      </footer>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeConfirmModal}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
