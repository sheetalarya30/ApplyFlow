import React from 'react';
import {
  Briefcase,
  Users,
  Trophy,
  XCircle,
  TrendingUp,
  Target,
} from 'lucide-react';
import type { DashboardStats } from '../../types';

interface StatCardsProps {
  stats: DashboardStats;
  onFilterStatus?: (status: string) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats, onFilterStatus }) => {
  const cards = [
    {
      title: 'Total Applications',
      value: stats.total,
      subtext: `${stats.inReview + stats.assessments} active in pipeline`,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      statusFilter: 'All',
    },
    {
      title: 'Interviews Scheduled',
      value: stats.interviews,
      subtext: `${stats.assessments} assessments pending`,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      statusFilter: 'Interview',
    },
    {
      title: 'Offers Received',
      value: stats.offers,
      subtext: stats.offers > 0 ? '🎉 Milestone reached!' : 'Keep pushing forward',
      icon: Trophy,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      accentGlow: stats.offers > 0,
      statusFilter: 'Offered',
    },
    {
      title: 'Rejections / Closed',
      value: stats.rejections,
      subtext: `${stats.withdrawn} withdrawn applications`,
      icon: XCircle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      statusFilter: 'Rejected',
    },
    {
      title: 'Interview Conversion',
      value: `${stats.interviewRate}%`,
      subtext: `${stats.interviews + stats.offers} reached interview stage`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      isRate: true,
      percentage: stats.interviewRate,
    },
    {
      title: 'Offer Success Rate',
      value: `${stats.offerRate}%`,
      subtext: `${stats.offers} of ${stats.total} converted to offers`,
      icon: Target,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      isRate: true,
      percentage: stats.offerRate,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={() => card.statusFilter && onFilterStatus && onFilterStatus(card.statusFilter)}
            className={`relative p-4 rounded-xl bg-white border ${card.borderColor} shadow-subtle hover:shadow-card transition-all duration-200 ${
              card.statusFilter ? 'cursor-pointer hover:-translate-y-0.5' : ''
            } ${card.accentGlow ? 'ring-2 ring-emerald-400/40 bg-gradient-to-b from-emerald-50/30 to-white' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {card.value}
              </span>
              {card.accentGlow && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>

            {/* Progress bar for rate cards */}
            {card.isRate && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    card.color.includes('purple') ? 'bg-purple-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(card.percentage || 0, 100)}%` }}
                />
              </div>
            )}

            <p className="mt-2 text-xs text-slate-500 truncate">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};
