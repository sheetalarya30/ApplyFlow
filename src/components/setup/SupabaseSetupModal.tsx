import React, { useState } from 'react';
import { X, Database, ShieldCheck, AlertCircle, AlertTriangle, RefreshCw, Server, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSetupTab?: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { connectionHealth, checkConnection } = useAuth();
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await checkConnection();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-elevated border border-slate-200 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Database Connection Status</h3>
              <p className="text-xs text-slate-500">Live Supabase PostgreSQL Verification</p>
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

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status Display Card */}
          {connectionHealth.status === 'connected' && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Connection Status: Connected</span>
              </div>
              <p className="text-xs leading-relaxed text-emerald-800">
                {connectionHealth.message}
              </p>
              {connectionHealth.checkedAt && (
                <span className="text-[10px] text-emerald-600/80 block pt-1 font-mono">
                  Verified at: {connectionHealth.checkedAt}
                </span>
              )}
            </div>
          )}

          {connectionHealth.status === 'checking' && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm text-blue-800">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                <span>Verifying Supabase Request...</span>
              </div>
              <p className="text-xs leading-relaxed text-blue-800">
                Sending a real verification request to your Supabase host and database schema.
              </p>
            </div>
          )}

          {connectionHealth.status === 'error' && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm text-rose-800">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Connection Status: Connection Failed</span>
              </div>
              <p className="text-xs leading-relaxed text-rose-800">
                {connectionHealth.message}
              </p>
              {connectionHealth.checkedAt && (
                <span className="text-[10px] text-rose-600/80 block pt-1 font-mono">
                  Last checked: {connectionHealth.checkedAt}
                </span>
              )}
            </div>
          )}

          {connectionHealth.status === 'not_connected' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm text-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>Connection Status: Not Connected</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-800">
                {connectionHealth.message}
              </p>
            </div>
          )}

          {/* Masked Credentials Overview - Security Compliant */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2.5">
            <div className="flex items-center justify-between text-slate-700 font-semibold pb-1 border-b border-slate-200/60 text-[11px] uppercase tracking-wider">
              <span className="flex items-center">
                <Server className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Environment Configuration
              </span>
              <span className="flex items-center text-slate-500">
                <Lock className="w-3 h-3 mr-1 text-slate-400" />
                Protected
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Target Host:</span>
              <span className="font-mono text-slate-800 font-semibold text-[11px]">
                {connectionHealth.urlHost || '••••••••.supabase.co'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">API Key:</span>
              <span className="font-mono text-slate-400 tracking-widest font-bold text-xs select-none">
                ••••••••••••••••••••••••
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Source:</span>
              <span className="font-mono text-slate-600 text-[11px]">
                .env (NEXT_PUBLIC_SUPABASE_URL)
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Checking...' : 'Re-test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
