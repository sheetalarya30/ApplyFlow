import React from 'react';
import {
  Briefcase,
  Plus,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenNewModal: () => void;
  onOpenSetupModal: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewModal,
  onOpenSetupModal,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { user, signOut, connectionHealth } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Apply<span className="text-brand-600">Flow</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  Placement Tracker
                </span>
              </div>
            </div>
          </div>

          {/* Right: Status badge, Action buttons, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Real Verified Supabase Status Pill */}
            {connectionHealth.status === 'connected' && (
              <button
                type="button"
                onClick={onOpenSetupModal}
                className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                title="Verified real connection to Supabase database"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span>Connected</span>
              </button>
            )}

            {connectionHealth.status === 'checking' && (
              <button
                type="button"
                onClick={onOpenSetupModal}
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                title="Verifying connection to Supabase..."
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1 text-blue-600 animate-spin" />
                <span className="hidden sm:inline">Checking...</span>
                <span className="sm:hidden">...</span>
              </button>
            )}

            {connectionHealth.status === 'error' && (
              <button
                type="button"
                onClick={onOpenSetupModal}
                className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors animate-pulse-subtle"
                title={connectionHealth.message}
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                <span className="hidden sm:inline">Connection Failed</span>
                <span className="sm:hidden">Failed</span>
              </button>
            )}

            {connectionHealth.status === 'not_connected' && (
              <button
                type="button"
                onClick={onOpenSetupModal}
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                title="Supabase credentials not configured in .env"
              >
                <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                <span className="hidden sm:inline">Not Connected</span>
                <span className="sm:hidden">Not Connected</span>
              </button>
            )}

            {/* Quick Add Button */}
            <button
              type="button"
              onClick={onOpenNewModal}
              id="btn-add-application"
              className="inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.98] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Job</span>
            </button>

            {/* User profile & Logout */}
            {user && (
              <div className="flex items-center pl-2 border-l border-slate-200 space-x-2">
                <div
                  className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700"
                  title={user.email || 'User'}
                >
                  {(user.email?.[0] || 'U').toUpperCase()}
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
