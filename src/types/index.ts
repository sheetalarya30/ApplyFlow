export type JobType = 'Full-time' | 'Internship' | 'Co-op' | 'Part-time' | 'Contract' | 'Other';

export type ApplicationStatus =
  | 'Applied'
  | 'In Review'
  | 'Assessment'
  | 'Interview'
  | 'Offered'
  | 'Rejected'
  | 'Withdrawn';

export interface JobApplication {
  id: string;
  user_id?: string;
  company_name: string;
  job_role: string;
  job_type: JobType;
  application_date: string; // YYYY-MM-DD
  status: ApplicationStatus;
  assessment_date?: string | null; // YYYY-MM-DD
  interview_date?: string | null; // YYYY-MM-DD
  job_url?: string | null;
  location?: string | null;
  salary?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationFormData {
  company_name: string;
  job_role: string;
  job_type: JobType;
  application_date: string;
  status: ApplicationStatus;
  assessment_date: string;
  interview_date: string;
  job_url: string;
  location: string;
  salary: string;
  notes: string;
}

export interface DashboardStats {
  total: number;
  inReview: number;
  assessments: number;
  interviews: number;
  offers: number;
  rejections: number;
  withdrawn: number;
  interviewRate: number; // percentage (0-100)
  offerRate: number; // percentage (0-100)
}

export interface FilterOptions {
  search: string;
  status: string;
  jobType: string;
  sortBy: 'date_desc' | 'date_asc' | 'company_asc' | 'deadline';
}

export type DeadlineUrgency = 'overdue' | 'due-soon' | 'upcoming';

export interface DeadlineItem {
  id: string;
  applicationId: string;
  company_name: string;
  job_role: string;
  type: 'Assessment' | 'Interview';
  date: string;
  daysRemaining: number;
  urgency: DeadlineUrgency;
  status: ApplicationStatus;
  job_url?: string | null;
}
