import { createBrowserClient } from '@supabase/ssr';
import type { JobApplication } from '../types';

// Read environment variables (supports NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
const rawUrl =
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL ||
  '';
const rawAnonKey =
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const supabaseUrl = rawUrl.trim().replace(/\/+$/, '');
export const supabaseAnonKey = rawAnonKey.trim().replace(/^['"]|['"]$/g, '');

// Validate whether a real, reachable Supabase URL and Key have been supplied
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('npm install') &&
  supabaseAnonKey.length >= 20
);

// Fallback dummy URL to prevent client crashes if credentials are not yet set
const clientUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const clientKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key-0123456789abcdef';

// Initialize Supabase Client with @supabase/ssr browser client
export const supabase = createBrowserClient(clientUrl, clientKey);

// Storage key for fallback local storage mode (when credentials not yet configured)
const LOCAL_STORAGE_KEY = 'applyflow_local_applications';

export type ConnectionStatus = 'checking' | 'connected' | 'not_connected' | 'error';

export interface SupabaseHealthResult {
  status: ConnectionStatus;
  message: string;
  tableFound: boolean;
  checkedAt?: string;
  urlHost?: string;
}

// Perform a real network request to verify live Supabase connectivity and schema existence
export const checkSupabaseHealth = async (): Promise<SupabaseHealthResult> => {
  if (!isSupabaseConfigured) {
    return {
      status: 'not_connected',
      message: 'Supabase credentials are not configured in your .env file.',
      tableFound: false,
    };
  }

  try {
    let urlHost = 'supabase.co';
    try {
      const parsed = new URL(supabaseUrl);
      urlHost = parsed.host;
    } catch {
      urlHost = 'supabase.co';
    }

    // Test real Supabase query against applications table
    const { error: dbError } = await supabase
      .from('applications')
      .select('id')
      .limit(1);

    if (dbError) {
      if (
        dbError.message.includes('Could not find the table') ||
        dbError.code === 'PGRST205' ||
        dbError.code === '42P01'
      ) {
        return {
          status: 'error',
          message:
            "Connected to project host, but table 'public.applications' was not found in schema cache. Please run supabase/schema.sql in your Supabase SQL Editor.",
          tableFound: false,
          urlHost,
          checkedAt: new Date().toLocaleTimeString(),
        };
      }

      if (dbError.message.includes('JWT') || dbError.message.includes('apikey') || dbError.code === '401') {
        return {
          status: 'error',
          message: 'Invalid API key or project authorization failed. Check your environment variables.',
          tableFound: false,
          urlHost,
          checkedAt: new Date().toLocaleTimeString(),
        };
      }

      return {
        status: 'error',
        message: `Database request error: ${dbError.message}`,
        tableFound: false,
        urlHost,
        checkedAt: new Date().toLocaleTimeString(),
      };
    }

    // Verified real request succeeded!
    return {
      status: 'connected',
      message: 'Verified real connection to Supabase cloud database & schema successfully.',
      tableFound: true,
      urlHost,
      checkedAt: new Date().toLocaleTimeString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown connection error';
    return {
      status: 'error',
      message: `Failed to connect to Supabase: ${errorMsg}`,
      tableFound: false,
      checkedAt: new Date().toLocaleTimeString(),
    };
  }
};

export const getLocalApplications = (): JobApplication[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to read from localStorage:', err);
    return [];
  }
};

export const saveLocalApplications = (applications: JobApplication[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(applications));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

// Database operations helper layer (aligned with supabase/schema.sql)
export const api = {
  async getApplications(userId?: string): Promise<{ data: JobApplication[] | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      return { data: getLocalApplications(), error: null };
    }

    try {
      let query = supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data as JobApplication[], error: null };
    } catch (err: unknown) {
      console.error('Error fetching applications from Supabase:', err);
      // Fall back to local if table doesn't exist yet or connection fails
      const message = err instanceof Error ? err.message : 'Failed to fetch applications';
      return { data: getLocalApplications(), error: new Error(message) };
    }
  },

  async createApplication(
    appData: Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>,
    userId?: string
  ): Promise<{ data: JobApplication | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      const newApp: JobApplication = {
        ...appData,
        id: crypto.randomUUID(),
        user_id: userId || 'local-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const existing = getLocalApplications();
      saveLocalApplications([newApp, ...existing]);
      return { data: newApp, error: null };
    }

    try {
      // Ensure we have authenticated user_id to satisfy RLS WITH CHECK (auth.uid() = user_id)
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        targetUserId = user?.id;
      }

      if (!targetUserId) {
        throw new Error('User must be authenticated to create an application');
      }

      const sanitizedPayload = {
        company_name: appData.company_name,
        job_role: appData.job_role,
        job_type: appData.job_type,
        application_date: appData.application_date,
        status: appData.status,
        assessment_date: appData.assessment_date ? appData.assessment_date : null,
        interview_date: appData.interview_date ? appData.interview_date : null,
        job_url: appData.job_url || null,
        location: appData.location || null,
        salary: appData.salary || null,
        notes: appData.notes || null,
        user_id: targetUserId,
      };

      const { data, error } = await supabase
        .from('applications')
        .insert([sanitizedPayload])
        .select()
        .single();

      if (error) throw error;
      return { data: data as JobApplication, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create application';
      return { data: null, error: new Error(message) };
    }
  },

  async updateApplication(
    id: string,
    updates: Partial<JobApplication>
  ): Promise<{ data: JobApplication | null; error: Error | null }> {
    if (!isSupabaseConfigured) {
      const existing = getLocalApplications();
      const updated = existing.map((item) =>
        item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
      );
      saveLocalApplications(updated);
      const target = updated.find((item) => item.id === id) || null;
      return { data: target, error: null };
    }

    try {
      const sanitizedUpdates: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if ('assessment_date' in updates) {
        sanitizedUpdates.assessment_date = updates.assessment_date ? updates.assessment_date : null;
      }
      if ('interview_date' in updates) {
        sanitizedUpdates.interview_date = updates.interview_date ? updates.interview_date : null;
      }
      if ('job_url' in updates) {
        sanitizedUpdates.job_url = updates.job_url || null;
      }
      if ('location' in updates) {
        sanitizedUpdates.location = updates.location || null;
      }
      if ('salary' in updates) {
        sanitizedUpdates.salary = updates.salary || null;
      }
      if ('notes' in updates) {
        sanitizedUpdates.notes = updates.notes || null;
      }

      const { data, error } = await supabase
        .from('applications')
        .update(sanitizedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as JobApplication, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update application';
      return { data: null, error: new Error(message) };
    }
  },

  async deleteApplication(id: string): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured) {
      const existing = getLocalApplications();
      const filtered = existing.filter((item) => item.id !== id);
      saveLocalApplications(filtered);
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete application';
      return { success: false, error: new Error(message) };
    }
  },
};
