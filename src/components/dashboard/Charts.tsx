import React, { useState } from 'react';
import type { JobApplication, DashboardStats } from '../../types';
import { PieChart, GitCommit, Layers, Briefcase } from 'lucide-react';

interface ChartsProps {
  applications: JobApplication[];
  stats: DashboardStats;
}

export const Charts: React.FC<ChartsProps> = ({ applications, stats }) => {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  // Status breakdown data
  const statusItems = [
    { label: 'Applied', count: applications.filter((a) => a.status === 'Applied').length, bgClass: 'bg-blue-500' },
    { label: 'In Review', count: stats.inReview, bgClass: 'bg-amber-500' },
    { label: 'Assessment', count: stats.assessments, bgClass: 'bg-purple-500' },
    { label: 'Interview', count: stats.interviews, bgClass: 'bg-indigo-500' },
    { label: 'Offered', count: stats.offers, bgClass: 'bg-emerald-500' },
    { label: 'Rejected', count: stats.rejections, bgClass: 'bg-rose-500' },
    { label: 'Withdrawn', count: stats.withdrawn, bgClass: 'bg-slate-400' },
  ].filter((item) => stats.total === 0 || item.count > 0);

  // Job type breakdown
  const jobTypes = ['Full-time', 'Internship', 'Co-op', 'Part-time', 'Contract', 'Other'] as const;
  const jobTypeCounts = jobTypes.map((type) => ({
    type,
    count: applications.filter((a) => a.job_type === type).length,
  })).filter((item) => item.count > 0);

  // Funnel steps calculation
  const funnelSteps = [
    { name: 'Applied', count: stats.total, color: 'bg-blue-500' },
    { name: 'Under Review', count: stats.total - applications.filter((a) => a.status === 'Applied').length, color: 'bg-amber-500' },
    { name: 'Assessments', count: stats.assessments + stats.interviews + stats.offers, color: 'bg-purple-500' },
    { name: 'Interviews', count: stats.interviews + stats.offers, color: 'bg-indigo-500' },
    { name: 'Offers', count: stats.offers, color: 'bg-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Status Distribution Donut & Breakdown */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <PieChart className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Application Status Distribution</h3>
          </div>
          <span className="text-xs text-slate-500">{stats.total} total</span>
        </div>

        {stats.total === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-sm">
            <Layers className="w-8 h-8 mb-2 stroke-1" />
            <span>No applications added yet</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visual Segmented Progress Bar */}
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              {statusItems.map((item, idx) => {
                const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredStatus(item.label)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    className={`${item.bgClass} h-full transition-all duration-300 relative group cursor-pointer`}
                    style={{ width: `${percentage}%` }}
                    title={`${item.label}: ${item.count} (${Math.round(percentage)}%)`}
                  />
                );
              })}
            </div>

            {/* Status Legend & Counts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
              {statusItems.map((item, idx) => {
                const percentage = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
                const isHovered = hoveredStatus === item.label;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredStatus(item.label)}
                    onMouseLeave={() => setHoveredStatus(null)}
                    className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                      isHovered ? 'bg-slate-100/90 scale-[1.02]' : 'bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.bgClass} shrink-0`} />
                      <span className="text-xs font-medium text-slate-700 truncate">{item.label}</span>
                    </div>
                    <div className="text-right pl-2">
                      <span className="text-xs font-bold text-slate-900">{item.count}</span>
                      <span className="text-[10px] text-slate-400 ml-1">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Placement Conversion Funnel */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <GitCommit className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Placement Pipeline Funnel</h3>
          </div>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            Stage Progression
          </span>
        </div>

        {stats.total === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-sm">
            <GitCommit className="w-8 h-8 mb-2 stroke-1" />
            <span>Add applications to see your conversion funnel</span>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {funnelSteps.map((step, idx) => {
              const conversionFromTotal = stats.total > 0 ? Math.round((step.count / stats.total) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 flex items-center">
                      <span className="w-4 text-slate-400 font-mono">{idx + 1}.</span>
                      {step.name}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {step.count} candidates <span className="text-slate-400 font-normal">({conversionFromTotal}%)</span>
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${step.color} transition-all duration-500`}
                      style={{ width: `${Math.max(conversionFromTotal, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Job Types Sub-bar */}
            {jobTypeCounts.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 flex items-center text-[11px]">
                  <Briefcase className="w-3 h-3 mr-1" />
                  Types:
                </span>
                {jobTypeCounts.map((jt) => (
                  <span
                    key={jt.type}
                    className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]"
                  >
                    {jt.type}: <strong>{jt.count}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
