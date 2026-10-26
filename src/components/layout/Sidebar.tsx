import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Clock,
  BarChart3,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import type { DashboardStats } from '../../types';

export type ActiveTab = 'dashboard' | 'applications' | 'deadlines' | 'analytics' | 'export' | 'setup';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  stats: DashboardStats;
  deadlinesCount: { overdue: number; dueSoon: number };
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  deadlinesCount,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'applications' as ActiveTab,
      label: 'Applications',
      icon: Briefcase,
      badge: stats.total > 0 ? stats.total : null,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'deadlines' as ActiveTab,
      label: 'Deadlines',
      icon: Clock,
      badge: (deadlinesCount.overdue + deadlinesCount.dueSoon) > 0 ? (deadlinesCount.overdue + deadlinesCount.dueSoon) : null,
      badgeColor: deadlinesCount.overdue > 0 ? 'bg-rose-100 text-rose-700 font-bold' : 'bg-amber-100 text-amber-700',
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Analytics & Funnel',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'export' as ActiveTab,
      label: 'Google Sheets Export',
      icon: FileSpreadsheet,
      badge: 'Live',
      badgeColor: 'bg-emerald-100 text-emerald-800 text-[10px]',
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 z-50 md:z-20 h-full md:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Placement Workspace
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  id={`nav-link-${item.id}`}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-xs border border-brand-200/60 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-brand-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Placement Quick Progress Card */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50/70 via-brand-50/50 to-purple-50/70 border border-brand-100/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-brand-900 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-600" />
                Placement Tracker
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                {stats.offers} {stats.offers === 1 ? 'Offer' : 'Offers'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total Applied:</span>
                <span className="font-semibold text-slate-800">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Interviews:</span>
                <span className="font-semibold text-slate-800">{stats.interviews}</span>
              </div>
              <div className="flex justify-between">
                <span>Offer Success:</span>
                <span className="font-semibold text-emerald-600">{stats.offerRate}%</span>
              </div>
            </div>

            {/* Micro progress bar */}
            <div className="w-full bg-slate-200/80 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-brand-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.offerRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
