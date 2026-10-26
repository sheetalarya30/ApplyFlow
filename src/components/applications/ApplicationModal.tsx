import React, { useState, useEffect } from 'react';
import { X, Calendar, Globe, Building2, Briefcase, FileText, MapPin, DollarSign, Sparkles } from 'lucide-react';
import type { JobApplication, ApplicationFormData, JobType, ApplicationStatus } from '../../types';
import { triggerOfferConfetti } from '../../utils';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ApplicationFormData, id?: string) => Promise<void>;
  initialData?: JobApplication | null;
}

const defaultFormData: ApplicationFormData = {
  company_name: '',
  job_role: '',
  job_type: 'Full-time',
  application_date: new Date().toISOString().split('T')[0],
  status: 'Applied',
  assessment_date: '',
  interview_date: '',
  job_url: '',
  location: '',
  salary: '',
  notes: '',
};

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<ApplicationFormData>(defaultFormData);
  const [errors, setErrors] = useState<{ company_name?: string; job_role?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        company_name: initialData.company_name || '',
        job_role: initialData.job_role || '',
        job_type: initialData.job_type || 'Full-time',
        application_date: initialData.application_date || new Date().toISOString().split('T')[0],
        status: initialData.status || 'Applied',
        assessment_date: initialData.assessment_date || '',
        interview_date: initialData.interview_date || '',
        job_url: initialData.job_url || '',
        location: initialData.location || '',
        salary: initialData.salary || '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        ...defaultFormData,
        application_date: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { company_name?: string; job_role?: string } = {};
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }
    if (!formData.job_role.trim()) {
      newErrors.job_role = 'Job role is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (formData.status === 'Offered' && (!initialData || initialData.status !== 'Offered')) {
        triggerOfferConfetti();
      }
      await onSave(formData, initialData?.id);
      onClose();
    } catch (err) {
      console.error('Error saving application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-elevated border border-slate-200 overflow-hidden my-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {initialData ? 'Edit Job Application' : 'New Job Application'}
              </h2>
              <p className="text-xs text-slate-500">
                {initialData ? 'Update your placement progress and dates' : 'Track a new opportunity in your placement pipeline'}
              </p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Company & Job Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Google, Microsoft, TCS"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                    errors.company_name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-brand-200'
                  } focus:border-brand-500 focus:outline-none focus:ring-2`}
                />
              </div>
              {errors.company_name && (
                <p className="text-xs text-rose-500 mt-1">{errors.company_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Job Role / Position <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineer, SDE-1"
                  value={formData.job_role}
                  onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                    errors.job_role ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:ring-brand-200'
                  } focus:border-brand-500 focus:outline-none focus:ring-2`}
                />
              </div>
              {errors.job_role && (
                <p className="text-xs text-rose-500 mt-1">{errors.job_role}</p>
              )}
            </div>
          </div>

          {/* Row 2: Job Type, Status & Application Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Job Type
              </label>
              <select
                value={formData.job_type}
                onChange={(e) => setFormData({ ...formData, job_type: e.target.value as JobType })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Co-op">Co-op</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Application Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white font-medium focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Application Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.application_date}
                  onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Assessment Date & Interview Date (Deadlines) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Deadlines & Milestones (Tracks in Deadlines view)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Online Assessment Date (OA)
                </label>
                <input
                  type="date"
                  value={formData.assessment_date}
                  onChange={(e) => setFormData({ ...formData, assessment_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Interview Round Date
                </label>
                <input
                  type="date"
                  value={formData.interview_date}
                  onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Location, Salary & Job URL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Bangalore / Remote"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Salary / Stipend
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 14 LPA / ₹45k/mo"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Job Posting URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.job_url}
                  onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Notes & Interview Prep */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Notes & Preparation Details
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <textarea
                rows={3}
                placeholder="Mention referral contacts, key DSA topics asked, round details, recruiter email, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-5 py-2 text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.98] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  <span>{initialData ? 'Update Application' : 'Save Application'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
