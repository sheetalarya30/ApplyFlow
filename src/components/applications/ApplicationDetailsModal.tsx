import React from 'react';
import {
  X,
  Building2,
  Calendar,
  Globe,
  MapPin,
  DollarSign,
  Clock,
  Edit2,
  ExternalLink,
} from 'lucide-react';
import type { JobApplication, ApplicationStatus } from '../../types';
import { formatDate, getStatusBadgeStyle } from '../../utils';

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  application: JobApplication | null;
  onClose: () => void;
  onEdit: (app: JobApplication) => void;
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
}

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  isOpen,
  application,
  onClose,
  onEdit,
  onStatusChange,
}) => {
  if (!isOpen || !application) return null;

  const badge = getStatusBadgeStyle(application.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-elevated border border-slate-200 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-slate-50/60">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} mr-1.5`} />
                {application.status}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                {application.job_type}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-2">
              {application.job_role}
            </h2>
            <div className="flex items-center text-sm font-medium text-slate-600 mt-0.5">
              <Building2 className="w-4 h-4 mr-1.5 text-slate-400" />
              <span>{application.company_name}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Quick status switcher */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-semibold text-slate-700">Update Status:</span>
            <select
              value={application.status}
              onChange={(e) => onStatusChange(application.id, e.target.value as ApplicationStatus)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <option value="Applied">Applied</option>
              <option value="In Review">In Review</option>
              <option value="Assessment">Assessment</option>
              <option value="Interview">Interview</option>
              <option value="Offered">🎉 Offered</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Applied Date</span>
              <span className="font-semibold text-slate-800 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {formatDate(application.application_date)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Assessment Date</span>
              <span className="font-semibold text-slate-800 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-purple-500" />
                {formatDate(application.assessment_date)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Interview Date</span>
              <span className="font-semibold text-slate-800 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                {formatDate(application.interview_date)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Salary / Stipend</span>
              <span className="font-semibold text-slate-800 flex items-center">
                <DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                {application.salary || 'Not specified'}
              </span>
            </div>
          </div>

          {/* Location & Link */}
          {(application.location || application.job_url) && (
            <div className="space-y-2 text-xs">
              {application.location && (
                <div className="flex items-center text-slate-600">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  <span>Location: <strong className="text-slate-800">{application.location}</strong></span>
                </div>
              )}
              {application.job_url && (
                <div className="flex items-center text-brand-600">
                  <Globe className="w-3.5 h-3.5 mr-1.5" />
                  <a
                    href={application.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center"
                  >
                    <span>View original job posting</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-1">
              Interview Notes & Details
            </span>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 whitespace-pre-wrap min-h-[4rem]">
              {application.notes ? application.notes : <span className="text-slate-400 italic">No notes added.</span>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
          <span className="text-[11px] text-slate-400">
            Updated: {formatDate(application.updated_at?.split('T')[0])}
          </span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(application);
              }}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1" />
              Edit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
