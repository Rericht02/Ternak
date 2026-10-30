import React from 'react';
import { Activity, Home, Database } from 'lucide-react';
import { FarmState } from '../types';

interface HeaderProps {
  state: FarmState;
  onSelectCycle: (cycleId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ state, onSelectCycle }) => {
  return (
    <header className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-md sticky top-0 z-40 border-b border-emerald-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-600/30 border border-emerald-500/40 rounded-xl backdrop-blur shadow-inner">
            <Activity className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Broiler Farm Pro
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">
                  v2.5 Pro
                </span>
              </h1>
            </div>
            <p className="text-xs text-emerald-200/80">
              Sistem Pencatatan, FCR, IP & Proyeksi Laba Mandiri
            </p>
          </div>
        </div>

        {/* Quick Selector Kandang & Mode Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-emerald-950/70 border border-emerald-700/60 rounded-xl px-3 py-1.5 text-xs text-emerald-100 shadow-xs">
            <Home className="w-3.5 h-3.5 mr-1.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-300 mr-1.5 font-medium">Kandang:</span>
            <select
              value={state.active}
              onChange={(e) => onSelectCycle(e.target.value)}
              className="bg-transparent font-semibold text-white focus:outline-none cursor-pointer border-none text-xs pr-1"
            >
              {state.cycles.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.house} ({c.farm})
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-800/40 text-emerald-200 px-3 py-1.5 rounded-xl text-xs font-medium border border-emerald-600/40">
            <Database className="w-3.5 h-3.5 text-emerald-300" />
            <span>Offline & Tersimpan Lokal</span>
          </div>
        </div>
      </div>
    </header>
  );
};
