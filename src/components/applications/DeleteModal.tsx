import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { JobApplication } from '../../types';

interface DeleteModalProps {
  isOpen: boolean;
  application: JobApplication | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  application,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-elevated border border-slate-200 overflow-hidden animate-slide-up">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Application</h3>
              <p className="text-xs text-slate-500">This action cannot be undone.</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-4">
            Are you sure you want to delete your application for{' '}
            <strong className="text-slate-900">{application.job_role}</strong> at{' '}
            <strong className="text-slate-900">{application.company_name}</strong>?
          </p>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition-colors"
            >
              {isDeleting ? (
                <span>Deleting...</span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  <span>Delete Permanently</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
