import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Code2
} from 'lucide-react';
import type { JobApplication } from '../../types';
import { exportToCSV } from '../../utils';
import { useAuth } from '../../context/AuthContext';

interface ExportViewProps {
  applications: JobApplication[];
}

const APPS_SCRIPT_URL_KEY = 'applyflow_apps_script_url';

export const ExportView: React.FC<ExportViewProps> = ({ applications }) => {
  const { user } = useAuth();
  const [scriptUrl, setScriptUrl] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [showCode, setShowCode] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem(APPS_SCRIPT_URL_KEY) || import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '';
    setScriptUrl(saved);
  }, []);

  const handleSaveUrl = (url: string) => {
    setScriptUrl(url);
    localStorage.setItem(APPS_SCRIPT_URL_KEY, url);
  };

  const sampleAppsScriptCode = `function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "ApplyFlow Webhook active!"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var applications = payload.applications || [];
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName("Applications") || spreadsheet.insertSheet("Applications");
    
    sheet.clear();
    var headers = ["Company Name", "Job Role", "Job Type", "Status", "Application Date", "Assessment Date", "Interview Date", "Location", "Salary", "Job URL", "Notes"];
    sheet.appendRow(headers);
    
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#4F46E5");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
    
    if (applications.length > 0) {
      var rows = applications.map(function(app) {
        return [
          app.company_name, app.job_role, app.job_type, app.status,
          app.application_date, app.assessment_date || "—", app.interview_date || "—",
          app.location || "—", app.salary || "—", app.job_url || "", app.notes || ""
        ];
      });
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
    
    for (var col = 1; col <= headers.length; col++) {
      sheet.autoResizeColumn(col);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      count: applications.length
    })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(sampleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleSyncToGoogleSheets = async () => {
    if (!scriptUrl.trim()) {
      setSyncStatus({
        type: 'error',
        message: 'Please paste your Google Apps Script Web App URL first.',
      });
      return;
    }

    if (!scriptUrl.includes('script.google.com')) {
      setSyncStatus({
        type: 'error',
        message: 'Invalid URL. It must be a Google Apps Script Web App URL (starts with https://script.google.com/macros/s/...)',
      });
      return;
    }

    setIsSyncing(true);
    setSyncStatus({ type: null, message: '' });

    try {
      const payload = {
        applications,
        userEmail: user?.email || 'student@placement.edu',
        syncedAt: new Date().toISOString(),
      };

      // Google Apps Script requires mode: 'no-cors' when calling directly from browser clients
      // due to 302 redirection mechanism of script.googleusercontent.com
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload),
      });

      setSyncStatus({
        type: 'success',
        message: `Successfully transmitted ${applications.length} applications to your Google Sheet! Check your Google Sheet to view the updated table.`,
      });
    } catch (err: unknown) {
      console.error('Error syncing to Google Apps Script:', err);
      const msg = err instanceof Error ? err.message : 'Failed to reach Google Apps Script webhook';
      setSyncStatus({
        type: 'error',
        message: `${msg}. Ensure your Apps Script Web App is deployed with 'Who has access' set to 'Anyone'.`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Google Sheets Integration & Data Export</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Export your placement data directly to Google Sheets via Google Apps Script webhook, or download a CSV.
          </p>
        </div>

        <button
          onClick={() => exportToCSV(applications)}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Download CSV File ({applications.length} jobs)
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Live Google Sheets Sync Control */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              Live Google Sheets Sync
            </h3>
            <span className="text-xs font-medium text-slate-400">Google Apps Script</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Enter your deployed Google Apps Script Web App URL below. When you click <strong>Sync to Google Sheets</strong>, ApplyFlow will automatically populate your spreadsheet with all application details, deadlines, and statuses!
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Google Apps Script Web App URL
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              value={scriptUrl}
              onChange={(e) => handleSaveUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              URL automatically saved in your browser storage.
            </p>
          </div>

          {/* Status Message */}
          {syncStatus.type && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start space-x-2 ${
                syncStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {syncStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">{syncStatus.message}</div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleSyncToGoogleSheets}
              disabled={isSyncing}
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Transmitting to Google Sheets...' : 'Sync to Google Sheets Now'}</span>
            </button>

            <button
              onClick={() => exportToCSV(applications)}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Export CSV Backup
            </button>
          </div>
        </div>

        {/* Right: Setup Instructions & Script Code */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Code2 className="w-4 h-4 mr-1.5 text-brand-600" />
              Google Apps Script Code
            </h3>
            <button
              onClick={handleCopyScript}
              className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 transition-colors"
            >
              {copiedScript ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>Copy Code.gs</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Quick 4-step setup:</p>
            <ol className="list-decimal list-inside space-y-1.5 pl-1">
              <li>Open any <strong className="text-slate-800">Google Sheet</strong> and click <strong>Extensions &rarr; Apps Script</strong>.</li>
              <li>Paste the <strong className="text-slate-800">Code.gs</strong> script below and click Save.</li>
              <li>Click <strong>Deploy &rarr; New deployment &rarr; Web app</strong>.</li>
              <li>Set <em>Execute as: Me</em> and <em>Who has access: Anyone</em>, then paste the URL on the left!</li>
            </ol>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowCode(!showCode)}
              className="text-xs font-semibold text-brand-600 hover:underline flex items-center"
            >
              <span>{showCode ? 'Hide Code.gs Script' : 'View Code.gs Script'}</span>
            </button>

            {showCode && (
              <div className="mt-2 relative">
                <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 text-[11px] font-mono max-h-60 overflow-y-auto leading-relaxed">
                  {sampleAppsScriptCode}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
