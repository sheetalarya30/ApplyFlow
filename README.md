# ApplyFlow — Placement Tracker

> A full-stack web application built for college placement and job application management with real-time statistics, deadline tracking, Supabase cloud authentication, PostgreSQL database with Row Level Security (RLS), and Google Sheets export via Google Apps Script.

---

## 🚀 Live Demo & Technologies

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (v3) + Lucide Icons + Micro-interactions
- **Backend & Database:** Supabase (Auth + PostgreSQL)
- **Security:** Row Level Security (RLS) policies per user
- **Integrations:** Google Sheets via Google Apps Script Webhook + CSV
- **Deployment:** GitHub & Vercel Ready (`vercel.json`)

---

## 🌟 Key Features

1. **Executive Placement Dashboard:**
   - Responsive sidebar with quick navigation (Dashboard, Applications, Deadlines, Analytics, Google Sheets Export, Supabase Setup).
   - Summary metric cards: Total Applications, Interviews, Offers, Rejections, Interview Conversion Rate, and Offer Success Rate.
   - Dynamic charts: Visual application status distribution and placement pipeline funnel.

2. **Supabase Authentication & Protected Routes:**
   - Secure email and password signup, sign in, and logout powered by Supabase Auth.
   - Protected routes preventing unauthorized access to student job applications.
   - Built-in **Demo Student Login** for instant college assessment grading without waiting for email confirmations.

3. **Application Management (CRUD):**
   - Create, read, update, and delete job applications.
   - Complete tracking fields: Company name, job role, job type (*Full-time, Internship, Co-op, Part-time, Contract*), application date, status (*Applied, In Review, Assessment, Interview, Offered, Rejected, Withdrawn*), assessment date, interview date, location, salary/stipend, job URL, and notes.
   - Quick status dropdown directly from the applications table.
   - Celebratory confetti animation upon landing an offer!

4. **Dynamic Database Statistics (No Hardcoded Numbers):**
   - Every metric is computed dynamically from real database records:
     - **Total Applications:** `N` records
     - **Interview Conversion Rate:** `((Interviews + Offers) / Total) * 100`
     - **Offer Success Rate:** `(Offers / Total) * 100`

5. **Milestones & Deadlines Tracker:**
   - Dedicated Deadlines page for Online Assessments (OA) and Interview Rounds.
   - **Overdue Deadlines:** Highlighted with red alert badges and day count.
   - **Urgent Deadlines:** Deadlines due within 3 days highlighted with amber warning badges.
   - **Upcoming Deadlines:** Categorized calendar schedule.

6. **Search & Multi-Dimensional Filtering:**
   - Real-time search across company name, role, and preparation notes.
   - Filter by application status and job type.
   - Sort by newest/oldest applied date, company name (A-Z), and upcoming deadline.

7. **Google Sheets Sync (Google Apps Script):**
   - Real export to Google Sheets via dedicated Google Apps Script webhook (`google-apps-script/Code.gs`).
   - One-click instant sync and CSV download.

8. **Enterprise-Grade Database Security (RLS):**
   - Row Level Security (RLS) enabled on PostgreSQL.
   - Each authenticated student can only access, insert, modify, and delete their own applications (`auth.uid() = user_id`).
   - Zero exposure of service-role keys in frontend code.

---

## 📁 Project Structure

```
ApplyFlow/
├── .env.example                     # Environment template
├── .env                             # Local environment variables
├── .gitignore                       # Git ignore file (protects .env)
├── index.html                       # Application HTML shell
├── package.json                     # Dependencies and scripts
├── tailwind.config.js               # Tailwind CSS theme configuration
├── tsconfig.json                    # TypeScript compiler config
├── vercel.json                      # Vercel deployment rewrite rules
├── google-apps-script/
│   ├── Code.gs                      # Google Apps Script webhook for Google Sheets
│   └── README.md                    # Step-by-step Apps Script guide
├── supabase/
│   └── schema.sql                   # PostgreSQL schema and RLS policies
└── src/
    ├── types/                       # TypeScript interfaces
    ├── lib/                         # Supabase client and API layer
    ├── context/                     # Supabase AuthContext
    ├── utils/                       # Calculations, deadline parser, CSV export
    ├── components/
    │   ├── layout/                  # Navbar and Sidebar
    │   ├── dashboard/               # StatCards and Charts
    │   ├── applications/            # Table, Add/Edit Modal, Details, Delete
    │   ├── deadlines/               # Deadlines tracker view
    │   ├── export/                  # Google Sheets & CSV export view
    │   ├── setup/                   # Supabase schema viewer & guide
    │   └── auth/                    # Sign In & Sign Up forms
    ├── App.tsx                      # Main application view switcher
    └── main.tsx                     # React root with AuthProvider
```

---

## ⚡ Local Setup (Windows Terminal Commands)

Follow these exact steps to run ApplyFlow on your machine:

### 1. Open Windows PowerShell or Command Prompt
Open your terminal in the `ApplyFlow` project folder:
```powershell
cd C:\ApplyFlow
```

### 2. Verify Node.js & Dependencies
Dependencies are already installed. If running on a new machine, install via:
```powershell
npm install
```

### 3. Configure Supabase (Optional for Demo, Recommended for Production)
Open `.env` in any text editor and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
*(If you leave `.env` empty, ApplyFlow runs in **Local Demo Mode** so you can immediately preview and grade all features without setting up Supabase first!)*

### 4. Start the Development Server
```powershell
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173
```

### 5. Validate the Production Build
To test that there are zero TypeScript or bundling errors:
```powershell
npm run build
```

---

## 🗄️ Supabase PostgreSQL Setup Guide

1. Go to [supabase.com](https://supabase.com) and sign in to your free account.
2. Click **New Project** and configure your database password.
3. Once created, click **SQL Editor** on the left menu.
4. Click **New Query**, open `supabase/schema.sql` from this repository, paste the entire SQL content, and click **Run**.
5. Go to **Project Settings &rarr; API**:
   - Copy **Project URL** into `VITE_SUPABASE_URL` in `.env`.
   - Copy **Project API Key (anon public)** into `VITE_SUPABASE_ANON_KEY` in `.env`.
6. Restart your Vite dev server (`npm run dev`).

---

## 📊 Google Sheets Integration Guide

1. Create a new spreadsheet on [Google Sheets](https://sheets.new).
2. Go to **Extensions &rarr; Apps Script**.
3. Replace the contents of `Code.gs` with the code inside `google-apps-script/Code.gs` in this repository.
4. Click **Deploy &rarr; New deployment**:
   - Type: **Web app**
   - Description: `ApplyFlow Webhook`
   - Execute as: `Me (your email)`
   - Who has access: `Anyone`
5. Copy the generated **Web app URL**.
6. In ApplyFlow, open the **Google Sheets Export** tab, paste the URL, and click **Sync to Google Sheets Now**!

---

## 🚢 GitHub & Vercel Deployment Guide

### Deploying to GitHub
```powershell
git init
git add .
git commit -m "Initial commit: ApplyFlow Placement Tracker complete MVP"
git branch -M main
git remote add origin https://github.com/<your-username>/applyflow.git
git push -u origin main
```

### Deploying to Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New &rarr; Project** and select your GitHub `applyflow` repository.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_APPS_SCRIPT_URL` (optional)
4. Click **Deploy**. Vercel will automatically run `npm run build` and deploy your app globally with client-side SPA routing (`vercel.json`).

---

## 🎓 College Assessment & Viva Presentation Highlights

- **Security & Data Isolation:** How Row Level Security (RLS) ensures that student records are protected at the database kernel level rather than just the client-side.
- **Dynamic Data Integrity:** Demonstrating that all conversion rates and counts change dynamically as applications are added, edited, or marked as offered.
- **Urgency Algorithm:** The deadline calculation logic (`daysRemaining <= 3` for urgent, `< 0` for overdue).
- **Extensibility:** The serverless webhook pipeline with Google Apps Script enabling cross-platform reporting into Google Sheets without needing a dedicated backend server.
