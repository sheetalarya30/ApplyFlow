import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Clock,
  Plus
} from 'lucide-react';
import type { JobApplication, ApplicationStatus, FilterOptions } from '../../types';
import { formatDate, getStatusBadgeStyle } from '../../utils';

interface ApplicationTableProps {
  applications: JobApplication[];
  onEdit: (application: JobApplication) => void;
  onDelete: (application: JobApplication) => void;
  onView: (application: JobApplication) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onOpenNewModal: () => void;
  initialStatusFilter?: string;
}

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  applications,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  onOpenNewModal,
  initialStatusFilter = 'All',
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: initialStatusFilter,
    jobType: 'All',
    sortBy: 'date_desc',
  });

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Search filter (company, role, notes)
        if (filters.search) {
          const query = filters.search.toLowerCase();
          const matchCompany = app.company_name.toLowerCase().includes(query);
          const matchRole = app.job_role.toLowerCase().includes(query);
          const matchNotes = (app.notes || '').toLowerCase().includes(query);
          if (!matchCompany && !matchRole && !matchNotes) return false;
        }

        // Status filter
        if (filters.status !== 'All' && app.status !== filters.status) {
          return false;
        }

        // Job type filter
        if (filters.jobType !== 'All' && app.job_type !== filters.jobType) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'date_desc') {
          return new Date(b.application_date).getTime() - new Date(a.application_date).getTime();
        }
        if (filters.sortBy === 'date_asc') {
          return new Date(a.application_date).getTime() - new Date(b.application_date).getTime();
        }
        if (filters.sortBy === 'company_asc') {
          return a.company_name.localeCompare(b.company_name);
        }
        if (filters.sortBy === 'deadline') {
          const getDeadline = (app: JobApplication) =>
            app.assessment_date || app.interview_date || '9999-12-31';
          return getDeadline(a).localeCompare(getDeadline(b));
        }
        return 0;
      });
  }, [applications, filters]);

  const statuses: string[] = ['All', 'Applied', 'In Review', 'Assessment', 'Interview', 'Offered', 'Rejected', 'Withdrawn'];
  const jobTypes: string[] = ['All', 'Full-time', 'Internship', 'Co-op', 'Part-time', 'Contract', 'Other'];

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              id="input-search-applications"
              placeholder="Search by company, role, or notes..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
            {/* Status Select */}
            <select
              id="select-filter-status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>

            {/* Job Type Select */}
            <select
              id="select-filter-jobtype"
              value={filters.jobType}
              onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {jobTypes.map((t) => (
                <option key={t} value={t}>
                  Type: {t}
                </option>
              ))}
            </select>

            {/* Sort Select */}
            <select
              id="select-sort-by"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterOptions['sortBy'] })}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <option value="date_desc">Applied (Newest)</option>
              <option value="date_asc">Applied (Oldest)</option>
              <option value="company_asc">Company (A-Z)</option>
              <option value="deadline">Upcoming Deadline</option>
            </select>
          </div>
        </div>

        {/* Quick status tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {statuses.map((st) => {
            const count =
              st === 'All'
                ? applications.length
                : applications.filter((a) => a.status === st).length;
            const isActive = filters.status === st;

            return (
              <button
                key={st}
                onClick={() => setFilters({ ...filters, status: st })}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st} <span className="opacity-75 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No applications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {filters.search || filters.status !== 'All' || filters.jobType !== 'All'
                ? 'Try adjusting your search criteria or clear your filters to view applications.'
                : 'Start tracking your placements by adding your first job application.'}
            </p>
            {filters.search || filters.status !== 'All' || filters.jobType !== 'All' ? (
              <button
                onClick={() => setFilters({ search: '', status: 'All', jobType: 'All', sortBy: 'date_desc' })}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Reset Filters
              </button>
            ) : (
              <button
                onClick={onOpenNewModal}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add First Application
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50/80 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                <tr>
                  <th scope="col" className="px-4 py-3">Company & Role</th>
                  <th scope="col" className="px-4 py-3">Type</th>
                  <th scope="col" className="px-4 py-3">Applied</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Next Deadline</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredApplications.map((app) => {
                  const badge = getStatusBadgeStyle(app.status);

                  // Find nearest upcoming deadline if any
                  const nextDeadline = app.assessment_date
                    ? { type: 'OA', date: app.assessment_date, color: 'text-purple-600 bg-purple-50' }
                    : app.interview_date
                    ? { type: 'Interview', date: app.interview_date, color: 'text-indigo-600 bg-indigo-50' }
                    : null;

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => onView(app)}
                    >
                      {/* Company & Role */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300/60 flex items-center justify-center font-bold text-slate-700 uppercase">
                            {app.company_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors flex items-center">
                              <span>{app.company_name}</span>
                              {app.job_url && (
                                <a
                                  href={app.job_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="ml-1.5 text-slate-400 hover:text-brand-600"
                                  title="Open job link"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <div className="text-slate-500 text-[11px] font-medium">
                              {app.job_role}
                              {app.location && <span className="ml-1.5 text-slate-400">• {app.location}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Job Type */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {app.job_type}
                        </span>
                      </td>

                      {/* Applied Date */}
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {formatDate(app.application_date)}
                      </td>

                      {/* Interactive Status Dropdown */}
                      <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={app.status}
                          onChange={(e) => onStatusChange(app.id, e.target.value as ApplicationStatus)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border} cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-300`}
                        >
                          <option value="Applied">Applied</option>
                          <option value="In Review">In Review</option>
                          <option value="Assessment">Assessment</option>
                          <option value="Interview">Interview</option>
                          <option value="Offered">🎉 Offered</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Withdrawn">Withdrawn</option>
                        </select>
                      </td>

                      {/* Next Deadline */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {nextDeadline ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${nextDeadline.color}`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {nextDeadline.type}: {formatDate(nextDeadline.date)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onView(app)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEdit(app)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Application"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(app)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
