import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Terminal,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SupabaseSetupView: React.FC = () => {
  const { isConfigured } = useAuth();
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const sqlSchema = `-- ====================================================================
-- ApplyFlow — Placement Tracker Database Schema
-- Run in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    job_role TEXT NOT NULL,
    job_type TEXT NOT NULL DEFAULT 'Full-time' CHECK (job_type IN ('Full-time', 'Internship', 'Co-op', 'Part-time', 'Contract', 'Other')),
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied', 'In Review', 'Assessment', 'Interview', 'Offered', 'Rejected', 'Withdrawn')),
    assessment_date DATE,
    interview_date DATE,
    job_url TEXT,
    location TEXT,
    salary TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_assessment_date ON public.applications(assessment_date);
CREATE INDEX IF NOT EXISTS idx_applications_interview_date ON public.applications(interview_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Secure RLS Policies: Authenticated users can ONLY access their own data
CREATE POLICY "Users can view their own applications"
    ON public.applications FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
    ON public.applications FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
    ON public.applications FOR UPDATE TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications"
    ON public.applications FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_applications_updated
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Supabase PostgreSQL & Auth Setup</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete database schema, Row Level Security (RLS) policies, and connection configuration.
          </p>
        </div>

        {isConfigured ? (
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
            <span>Supabase Cloud Connected (RLS Active)</span>
          </div>
        ) : (
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold animate-pulse-subtle">
            <AlertCircle className="w-4 h-4 mr-1.5 text-amber-600" />
            <span>Demo Mode (Supabase Keys Pending in .env)</span>
          </div>
        )}
      </div>

      {/* 3 Step Tutorial */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-2">
          <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 font-bold text-xs flex items-center justify-center">
            1
          </div>
          <h3 className="text-sm font-bold text-slate-900">Create Supabase Project</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">supabase.com</a>, create a free account, and click <strong>New Project</strong>. Choose any database password and region.
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-2">
          <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">
            2
          </div>
          <h3 className="text-sm font-bold text-slate-900">Execute SQL Schema</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            In your Supabase project dashboard, open the <strong>SQL Editor</strong> tab on the left. Click <strong>New Query</strong>, paste the schema below, and hit <strong>Run</strong>.
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-2">
          <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center">
            3
          </div>
          <h3 className="text-sm font-bold text-slate-900">Configure .env File</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            In Supabase, go to <strong>Project Settings &rarr; API</strong>. Copy the <em>Project URL</em> and <em>anon public key</em> into your local <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">.env</code> file, then restart Vite!
          </p>
        </div>
      </div>

      {/* Row Level Security Explanation Card */}
      <div className="p-5 rounded-xl bg-slate-900 text-white shadow-card space-y-3">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold">College Assessment Highlight: Row Level Security (RLS)</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Row Level Security ensures enterprise-grade data isolation. Even though all students share the same <code className="text-emerald-400">applications</code> table, PostgreSQL executes policy checks directly in the database kernel using <code className="text-emerald-400">auth.uid() = user_id</code>. A student can NEVER see, edit, or delete another student's placement records, even if frontend requests are tampered with.
        </p>
      </div>

      {/* SQL Editor Code Block */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">supabase/schema.sql</h3>
          </div>
          <button
            onClick={handleCopySql}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 transition-colors"
          >
            {copiedSql ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span>SQL Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                <span>Copy SQL Query</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono max-h-96 overflow-y-auto leading-relaxed border border-slate-800">
          {sqlSchema}
        </pre>
      </div>
    </div>
  );
};
