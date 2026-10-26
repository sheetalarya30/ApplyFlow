import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, type ActiveTab } from './components/layout/Sidebar';
import { StatCards } from './components/dashboard/StatCards';
import { Charts } from './components/dashboard/Charts';
import { ApplicationTable } from './components/applications/ApplicationTable';
import { ApplicationModal } from './components/applications/ApplicationModal';
import { DeleteModal } from './components/applications/DeleteModal';
import { ApplicationDetailsModal } from './components/applications/ApplicationDetailsModal';
import { DeadlinesView } from './components/deadlines/DeadlinesView';
import { ExportView } from './components/export/ExportView';
import { SupabaseSetupView } from './components/setup/SupabaseSetupView';
import { SupabaseSetupModal } from './components/setup/SupabaseSetupModal';
import { api } from './lib/supabase';
import type { JobApplication, ApplicationFormData, ApplicationStatus } from './types';
import { calculateStats, extractDeadlines, triggerOfferConfetti } from './utils';
import {
  Briefcase,
  Plus,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export function App() {
  const { user, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Notification alerts
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Fetch applications
  const loadApplications = async () => {
    if (!user) return;
    setLoadingApps(true);
    try {
      const { data, error } = await api.getApplications(user.id);
      if (error) {
        showNotification('error', `Could not load applications: ${error.message}`);
      } else {
        setApplications(data || []);
      }
    } catch (err: unknown) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  // Handle Save (Create or Update)
  const handleSaveApplication = async (formData: ApplicationFormData, id?: string) => {
    if (!user) return;

    if (id) {
      // Update
      const { data, error } = await api.updateApplication(id, {
        company_name: formData.company_name,
        job_role: formData.job_role,
        job_type: formData.job_type,
        application_date: formData.application_date,
        status: formData.status,
        assessment_date: formData.assessment_date || null,
        interview_date: formData.interview_date || null,
        job_url: formData.job_url || null,
        location: formData.location || null,
        salary: formData.salary || null,
        notes: formData.notes || null,
      });

      if (error) {
        showNotification('error', `Failed to update: ${error.message}`);
      } else if (data) {
        setApplications((prev) => prev.map((item) => (item.id === id ? data : item)));
        showNotification('success', `Updated application for ${data.company_name}`);
      }
    } else {
      // Create
      const { data, error } = await api.createApplication(
        {
          company_name: formData.company_name,
          job_role: formData.job_role,
          job_type: formData.job_type,
          application_date: formData.application_date,
          status: formData.status,
          assessment_date: formData.assessment_date || null,
          interview_date: formData.interview_date || null,
          job_url: formData.job_url || null,
          location: formData.location || null,
          salary: formData.salary || null,
          notes: formData.notes || null,
        },
        user.id
      );

      if (error) {
        showNotification('error', `Failed to create application: ${error.message}`);
      } else if (data) {
        setApplications((prev) => [data, ...prev]);
        showNotification('success', `Added new application for ${data.company_name}!`);
      }
    }
  };

  // Handle Quick Status Change
  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    if (newStatus === 'Offered') {
      triggerOfferConfetti();
    }

    // Optimistic UI update
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );

    const { error } = await api.updateApplication(id, { status: newStatus });
    if (error) {
      showNotification('error', `Failed to update status: ${error.message}`);
      loadApplications(); // Revert on failure
    } else {
      showNotification('success', `Status updated to "${newStatus}"`);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteApplication = async () => {
    if (!selectedApp) return;
    setIsDeleting(true);
    try {
      const { success, error } = await api.deleteApplication(selectedApp.id);
      if (error || !success) {
        showNotification('error', `Failed to delete: ${error?.message || 'Unknown error'}`);
      } else {
        setApplications((prev) => prev.filter((a) => a.id !== selectedApp.id));
        showNotification('success', `Deleted application for ${selectedApp.company_name}`);
        setIsDeleteModalOpen(false);
        setSelectedApp(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Add realistic placement starter data if completely empty
  const handleSeedSampleData = async () => {
    if (!user) return;
    const today = new Date();
    const formatDateStr = (d: Date) => d.toISOString().split('T')[0];

    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 14);

    const overdueOADate = new Date(today);
    overdueOADate.setDate(today.getDate() - 2);

    const soonInterviewDate = new Date(today);
    soonInterviewDate.setDate(today.getDate() + 2);

    const futureOADate = new Date(today);
    futureOADate.setDate(today.getDate() + 7);

    const samples = [
      {
        company_name: 'Microsoft',
        job_role: 'Software Engineer (SDE-1)',
        job_type: 'Full-time' as const,
        application_date: formatDateStr(pastDate),
        status: 'Interview' as const,
        interview_date: formatDateStr(soonInterviewDate),
        location: 'Hyderabad / Bangalore',
        salary: '18 - 22 LPA',
        job_url: 'https://careers.microsoft.com',
        notes: 'Technical Round 1 scheduled. Topics: Binary Trees, Graph BFS/DFS, System Design Basics.',
      },
      {
        company_name: 'Google',
        job_role: 'Software Engineering Intern',
        job_type: 'Internship' as const,
        application_date: formatDateStr(pastDate),
        status: 'Assessment' as const,
        assessment_date: formatDateStr(futureOADate),
        location: 'Bangalore (Hybrid)',
        salary: '₹1.15 Lakh / month',
        job_url: 'https://careers.google.com',
        notes: 'Online assessment link received. Review LeetCode Hard DP & Graphs.',
      },
      {
        company_name: 'Amazon',
        job_role: 'Graduate SDE',
        job_type: 'Full-time' as const,
        application_date: formatDateStr(pastDate),
        status: 'Assessment' as const,
        assessment_date: formatDateStr(overdueOADate),
        location: 'Hyderabad',
        salary: '20 LPA',
        job_url: 'https://amazon.jobs',
        notes: 'OA Deadline was 2 days ago. Waiting for score confirmation.',
      },
      {
        company_name: 'Atlassian',
        job_role: 'Associate Software Engineer',
        job_type: 'Full-time' as const,
        application_date: formatDateStr(pastDate),
        status: 'Offered' as const,
        location: 'Bengaluru (Remote-first)',
        salary: '24 LPA (Base + Stock)',
        job_url: 'https://atlassian.com/careers',
        notes: '🎉 Received Offer Letter! Verification in progress.',
      },
      {
        company_name: 'Cisco',
        job_role: 'Network Software Engineer',
        job_type: 'Full-time' as const,
        application_date: formatDateStr(pastDate),
        status: 'In Review' as const,
        location: 'Chennai',
        salary: '15 LPA',
        job_url: 'https://cisco.com/careers',
        notes: 'Application submitted via university placement portal.',
      },
    ];

    for (const item of samples) {
      await api.createApplication(item, user.id);
    }
    await loadApplications();
    showNotification('success', 'Loaded 5 sample placement applications!');
  };

  // If auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center animate-bounce mb-3">
          <Briefcase className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-300">Initializing ApplyFlow...</p>
      </div>
    );
  }

  // If unauthenticated, show AuthPage (Protected Route)
  if (!user) {
    return <AuthPage />;
  }

  // Calculate stats dynamically from actual records
  const stats = calculateStats(applications);
  const deadlines = extractDeadlines(applications);
  const overdueCount = deadlines.filter((d) => d.urgency === 'overdue').length;
  const dueSoonCount = deadlines.filter((d) => d.urgency === 'due-soon').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onOpenNewModal={() => {
          setSelectedApp(null);
          setIsNewModalOpen(true);
        }}
        onOpenSetupModal={() => setIsSetupModalOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Floating Notification Alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`p-4 rounded-xl shadow-elevated border flex items-center space-x-3 text-xs font-semibold ${
              notification.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : 'bg-rose-900 text-rose-100 border-rose-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Layout with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'applications') {
              setStatusFilter('All');
            }
          }}
          stats={stats}
          deadlinesCount={{ overdue: overdueCount, dueSoon: dueSoonCount }}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* View Switcher Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Welcome Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Placement Overview
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time performance metrics, interview milestones, and application funnel.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {applications.length === 0 && (
                    <button
                      onClick={handleSeedSampleData}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                      title="Load starter applications for quick evaluation"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                      <span>Load Sample Data</span>
                    </button>
                  )}

                  <button
                    onClick={loadApplications}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                    title="Refresh data"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingApps ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <StatCards
                stats={stats}
                onFilterStatus={(st) => {
                  setStatusFilter(st);
                  setActiveTab('applications');
                }}
              />

              {/* Visual Charts */}
              <Charts applications={applications} stats={stats} />

              {/* Recent Applications Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
                  <button
                    onClick={() => {
                      setStatusFilter('All');
                      setActiveTab('applications');
                    }}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    View All ({applications.length}) &rarr;
                  </button>
                </div>

                <ApplicationTable
                  applications={applications}
                  initialStatusFilter={statusFilter}
                  onOpenNewModal={() => {
                    setSelectedApp(null);
                    setIsNewModalOpen(true);
                  }}
                  onEdit={(app) => {
                    setSelectedApp(app);
                    setIsNewModalOpen(true);
                  }}
                  onDelete={(app) => {
                    setSelectedApp(app);
                    setIsDeleteModalOpen(true);
                  }}
                  onView={(app) => {
                    setSelectedApp(app);
                    setIsDetailsModalOpen(true);
                  }}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Job Applications Directory
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Filter by status, search by role, and track recruiter notes.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {applications.length === 0 && (
                    <button
                      onClick={handleSeedSampleData}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                      <span>Load Sample Data</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedApp(null);
                      setIsNewModalOpen(true);
                    }}
                    className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-brand-600 hover:bg-brand-700 shadow-xs"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    <span>New Application</span>
                  </button>
                </div>
              </div>

              <ApplicationTable
                applications={applications}
                initialStatusFilter={statusFilter}
                onOpenNewModal={() => {
                  setSelectedApp(null);
                  setIsNewModalOpen(true);
                }}
                onEdit={(app) => {
                  setSelectedApp(app);
                  setIsNewModalOpen(true);
                }}
                onDelete={(app) => {
                  setSelectedApp(app);
                  setIsDeleteModalOpen(true);
                }}
                onView={(app) => {
                  setSelectedApp(app);
                  setIsDetailsModalOpen(true);
                }}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}

          {/* Deadlines Tab */}
          {activeTab === 'deadlines' && (
            <div className="animate-fade-in">
              <DeadlinesView
                applications={applications}
                onViewApplication={(app) => {
                  setSelectedApp(app);
                  setIsDetailsModalOpen(true);
                }}
                onStatusChange={handleStatusChange}
                onOpenNewModal={() => {
                  setSelectedApp(null);
                  setIsNewModalOpen(true);
                }}
              />
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Placement Analytics & Pipeline
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed analysis of interview conversion rates, status distribution, and progress.
                </p>
              </div>

              <StatCards
                stats={stats}
                onFilterStatus={(st) => {
                  setStatusFilter(st);
                  setActiveTab('applications');
                }}
              />

              <Charts applications={applications} stats={stats} />
            </div>
          )}

          {/* Google Sheets Export Tab */}
          {activeTab === 'export' && (
            <div className="animate-fade-in">
              <ExportView applications={applications} />
            </div>
          )}

          {/* Supabase Setup Tab */}
          {activeTab === 'setup' && (
            <div className="animate-fade-in">
              <SupabaseSetupView />
            </div>
          )}
        </main>
      </div>

      {/* Application Create / Edit Modal */}
      <ApplicationModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false);
          setSelectedApp(null);
        }}
        onSave={handleSaveApplication}
        initialData={selectedApp}
      />

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        isOpen={isDetailsModalOpen}
        application={selectedApp}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedApp(null);
        }}
        onEdit={(app) => {
          setSelectedApp(app);
          setIsNewModalOpen(true);
        }}
        onStatusChange={handleStatusChange}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        application={selectedApp}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedApp(null);
        }}
        onConfirm={handleDeleteApplication}
        isDeleting={isDeleting}
      />

      {/* Supabase Quick Setup Guide Modal */}
      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSwitchToSetupTab={() => {
          setIsSetupModalOpen(false);
          setActiveTab('setup');
        }}
      />
    </div>
  );
}

export default App;
