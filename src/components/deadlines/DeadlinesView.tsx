import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  Calendar,
  Building2,
  Briefcase,
  Eye,
  Plus
} from 'lucide-react';
import type { JobApplication, ApplicationStatus } from '../../types';
import { extractDeadlines, formatDate } from '../../utils';

interface DeadlinesViewProps {
  applications: JobApplication[];
  onViewApplication: (app: JobApplication) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onOpenNewModal: () => void;
}

export const DeadlinesView: React.FC<DeadlinesViewProps> = ({
  applications,
  onViewApplication,
  onStatusChange,
  onOpenNewModal,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'overdue' | 'due-soon' | 'upcoming'>('all');

  const deadlines = extractDeadlines(applications);

  const overdueCount = deadlines.filter((d) => d.urgency === 'overdue').length;
  const dueSoonCount = deadlines.filter((d) => d.urgency === 'due-soon').length;
  const upcomingCount = deadlines.filter((d) => d.urgency === 'upcoming').length;

  const filteredDeadlines = deadlines.filter((item) => {
    if (activeFilter === 'overdue') return item.urgency === 'overdue';
    if (activeFilter === 'due-soon') return item.urgency === 'due-soon';
    if (activeFilter === 'upcoming') return item.urgency === 'upcoming';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Placement Assessment & Interview Deadlines</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track upcoming deadlines, prevent missed assessments, and prepare for scheduled interview rounds.
          </p>
        </div>

        {/* Urgency Summary Badges */}
        <div className="flex items-center space-x-2">
          {overdueCount > 0 && (
            <div className="flex items-center px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-pulse-subtle">
              <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-600" />
              <span>{overdueCount} Overdue</span>
            </div>
          )}
          {dueSoonCount > 0 && (
            <div className="flex items-center px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
              <Clock className="w-4 h-4 mr-1.5 text-amber-600" />
              <span>{dueSoonCount} Due &le; 3 Days</span>
            </div>
          )}
          <div className="flex items-center px-3 py-1.5 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium">
            <Calendar className="w-4 h-4 mr-1.5 text-brand-600" />
            <span>{upcomingCount} Upcoming</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeFilter === 'all'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Deadlines ({deadlines.length})
        </button>

        <button
          onClick={() => setActiveFilter('overdue')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center ${
            activeFilter === 'overdue'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5" />
          Overdue ({overdueCount})
        </button>

        <button
          onClick={() => setActiveFilter('due-soon')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center ${
            activeFilter === 'due-soon'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
          Due Within 3 Days ({dueSoonCount})
        </button>

        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center ${
            activeFilter === 'upcoming'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Upcoming ({upcomingCount})
        </button>
      </div>

      {/* Deadlines List */}
      {filteredDeadlines.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No deadlines found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {activeFilter === 'all'
              ? 'None of your active applications currently have an Online Assessment or Interview date set.'
              : `There are currently no deadlines in the "${activeFilter}" category.`}
          </p>
          <button
            onClick={onOpenNewModal}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Application with Deadline
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeadlines.map((item) => {
            const originalApp = applications.find((a) => a.id === item.applicationId);

            // Urgency specific styling
            const isOverdue = item.urgency === 'overdue';
            const isDueSoon = item.urgency === 'due-soon';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-xl border transition-all duration-200 shadow-subtle hover:shadow-card ${
                  isOverdue
                    ? 'border-l-4 border-l-rose-500 border-rose-200 bg-rose-50/20'
                    : isDueSoon
                    ? 'border-l-4 border-l-amber-500 border-amber-200 bg-amber-50/20'
                    : 'border-l-4 border-l-brand-500 border-slate-200 bg-white'
                }`}
              >
                {/* Top Urgency Badge */}
                <div className="flex items-center justify-between mb-3">
                  {isOverdue && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                      OVERDUE by {Math.abs(item.daysRemaining)} {Math.abs(item.daysRemaining) === 1 ? 'day' : 'days'}
                    </span>
                  )}
                  {isDueSoon && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse-subtle">
                      <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                      {item.daysRemaining === 0 ? 'DUE TODAY' : `URGENT: In ${item.daysRemaining} days`}
                    </span>
                  )}
                  {!isOverdue && !isDueSoon && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-brand-600" />
                      In {item.daysRemaining} days
                    </span>
                  )}

                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      item.type === 'Assessment'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>

                {/* Company & Role */}
                <div className="mb-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center">
                    <Building2 className="w-4 h-4 mr-1.5 text-slate-400" />
                    <span>{item.company_name}</span>
                  </h3>
                  <div className="text-xs text-slate-600 font-medium mt-0.5 flex items-center">
                    <Briefcase className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    <span>{item.job_role}</span>
                  </div>
                </div>

                {/* Target Date */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs mb-4 flex items-center justify-between">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {formatDate(item.date)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  {originalApp && (
                    <button
                      onClick={() => onViewApplication(originalApp)}
                      className="text-brand-600 hover:text-brand-700 font-medium flex items-center"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View Details
                    </button>
                  )}

                  {/* Status Dropdown */}
                  <select
                    value={item.status}
                    onChange={(e) => onStatusChange(item.applicationId, e.target.value as ApplicationStatus)}
                    className="px-2 py-1 text-xs font-medium rounded border border-slate-200 bg-white"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Assessment">Assessment</option>
                    <option value="Interview">Interview</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Withdrawn">Withdrawn</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
