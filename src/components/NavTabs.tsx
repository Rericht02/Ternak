import React from 'react';
import {
  LayoutDashboard,
  Warehouse,
  ClipboardPen,
  Boxes,
  Truck,
  WalletCards,
  Calculator,
  DatabaseZap,
  LucideIcon,
} from 'lucide-react';

export type TabId =
  | 'dashboard'
  | 'cycles'
  | 'daily'
  | 'feed'
  | 'harvest'
  | 'expenses'
  | 'forecast'
  | 'backup';

interface NavItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
  { id: 'cycles', label: 'Kandang & Siklus', icon: Warehouse },
  { id: 'daily', label: 'Pencatatan Harian', icon: ClipboardPen },
  { id: 'feed', label: 'Pakan & Stok', icon: Boxes },
  { id: 'harvest', label: 'Panen', icon: Truck },
  { id: 'expenses', label: 'Biaya OVK & Ops', icon: WalletCards },
  { id: 'forecast', label: 'Kalkulator IP & Proyeksi', icon: Calculator },
  { id: 'backup', label: 'Ekspor & Backup', icon: DatabaseZap },
];

interface NavTabsProps {
  currentTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

export const NavTabs: React.FC<NavTabsProps> = ({ currentTab, onTabChange }) => {
  return (
    <div className="bg-white border-b border-slate-200 shadow-xs sticky top-[61px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none"
          aria-label="Tabs"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
