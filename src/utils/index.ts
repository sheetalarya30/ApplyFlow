import confetti from 'canvas-confetti';
import type { JobApplication, DashboardStats, DeadlineItem, ApplicationStatus } from '../types';

export const calculateStats = (applications: JobApplication[]): DashboardStats => {
  const total = applications.length;

  const inReview = applications.filter((a) => a.status === 'In Review').length;
  const assessments = applications.filter((a) => a.status === 'Assessment').length;
  const interviews = applications.filter((a) => a.status === 'Interview').length;
  const offers = applications.filter((a) => a.status === 'Offered').length;
  const rejections = applications.filter((a) => a.status === 'Rejected').length;
  const withdrawn = applications.filter((a) => a.status === 'Withdrawn').length;

  // Candidates who progressed to interview stage (status Interview or Offered or has interview_date)
  const reachedInterviewCount = applications.filter(
    (a) => a.status === 'Interview' || a.status === 'Offered' || Boolean(a.interview_date)
  ).length;

  const interviewRate = total > 0 ? Math.round((reachedInterviewCount / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;

  return {
    total,
    inReview,
    assessments,
    interviews,
    offers,
    rejections,
    withdrawn,
    interviewRate,
    offerRate,
  };
};

export const extractDeadlines = (applications: JobApplication[]): DeadlineItem[] => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const items: DeadlineItem[] = [];

  applications.forEach((app) => {
    // Only track deadlines for active applications (not already rejected or withdrawn)
    if (app.status === 'Withdrawn' || app.status === 'Rejected') {
      return;
    }

    if (app.assessment_date) {
      const aDate = new Date(app.assessment_date + 'T00:00:00');
      const diffTime = aDate.getTime() - now.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let urgency: DeadlineItem['urgency'] = 'upcoming';
      if (diffDays < 0) {
        urgency = 'overdue';
      } else if (diffDays <= 3) {
        urgency = 'due-soon';
      }

      items.push({
        id: `${app.id}-assessment`,
        applicationId: app.id,
        company_name: app.company_name,
        job_role: app.job_role,
        type: 'Assessment',
        date: app.assessment_date,
        daysRemaining: diffDays,
        urgency,
        status: app.status,
        job_url: app.job_url,
      });
    }

    if (app.interview_date) {
      const iDate = new Date(app.interview_date + 'T00:00:00');
      const diffTime = iDate.getTime() - now.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let urgency: DeadlineItem['urgency'] = 'upcoming';
      if (diffDays < 0) {
        urgency = 'overdue';
      } else if (diffDays <= 3) {
        urgency = 'due-soon';
      }

      items.push({
        id: `${app.id}-interview`,
        applicationId: app.id,
        company_name: app.company_name,
        job_role: app.job_role,
        type: 'Interview',
        date: app.interview_date,
        daysRemaining: diffDays,
        urgency,
        status: app.status,
        job_url: app.job_url,
      });
    }
  });

  // Sort deadlines: overdue first, then soonest upcoming
  return items.sort((a, b) => a.daysRemaining - b.daysRemaining);
};

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '—';
  try {
    const [year, month, day] = dateString.split('-');
    if (!year || !month || !day) return dateString;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const getStatusBadgeStyle = (status: ApplicationStatus): { bg: string; text: string; border: string; dot: string } => {
  switch (status) {
    case 'Applied':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
    case 'In Review':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
    case 'Assessment':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' };
    case 'Interview':
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' };
    case 'Offered':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
    case 'Rejected':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' };
    case 'Withdrawn':
      return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
  }
};

export const triggerOfferConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10b981', '#6366f1', '#f59e0b', '#3b82f6'],
  });
};

export const exportToCSV = (applications: JobApplication[]): void => {
  const headers = [
    'ID',
    'Company Name',
    'Job Role',
    'Job Type',
    'Application Date',
    'Status',
    'Assessment Date',
    'Interview Date',
    'Location',
    'Salary / Stipend',
    'Job URL',
    'Notes',
  ];

  const escapeCSV = (str?: string | null) => {
    if (str === null || str === undefined) return '""';
    const escaped = String(str).replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = applications.map((app) => [
    escapeCSV(app.id),
    escapeCSV(app.company_name),
    escapeCSV(app.job_role),
    escapeCSV(app.job_type),
    escapeCSV(app.application_date),
    escapeCSV(app.status),
    escapeCSV(app.assessment_date),
    escapeCSV(app.interview_date),
    escapeCSV(app.location),
    escapeCSV(app.salary),
    escapeCSV(app.job_url),
    escapeCSV(app.notes),
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ApplyFlow_Placement_Tracker_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
