# Charla — AI Companion Platform for Career & Learning

> Your AI companion from campus to career.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-green?style=flat-square&logo=supabase)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?style=flat-square)
![Gemini](https://img.shields.io/badge/Gemini-AI-orange?style=flat-square&logo=google)

---

## What is Charla?

Charla is a full-stack SaaS platform where users can:

- Create personalized **AI companions** for voice-powered learning sessions across 6 core computer-science subjects
- Take **voice mock interviews** for a chosen job role and get a scored assessment (out of 100) with blunt, transcript-based feedback
- Use **15 AI-powered tools** for career development, academics, and productivity
- Automatically get **AI-generated session insights** — summaries, weak areas, quizzes, and next-topic recommendations after every learning session
- Browse a unified **History** page with tool run logs, conversation transcripts, and interview reports
- Track their learning journey, session history, and tool usage over time
- Use the platform in **dark or light mode**, fully mobile responsive

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Custom CSS Variables (dark/light theme system) |
| Theming | next-themes |
| Database | Supabase (PostgreSQL) |
| ORM | Supabase JS Client |
| Auth | Clerk |
| AI | Google Gemini 2.5 Flash |
| Voice AI | VAPI |
| UI Components | shadcn/ui |
| Notifications | Sonner |
| Fonts | Bricolage Grotesque, Geist Sans, JetBrains Mono |
| Package Manager | npm |

---

## Features

### 🤖 AI Companions
Create personalized AI tutors for voice-powered learning sessions.

- 6 subjects: DSA, DBMS, OS, Networks, OOP, System Design
- Custom voice (male/female) and teaching style (formal/casual)
- Real-time voice conversations powered by VAPI + Gemini 2.5 Flash
- Full conversation transcript captured and saved automatically
- Session history tracking
- Bookmark favourite companions
- Companion library with search and subject filtering

### 🎤 Mock Interview (NEW)
Practice a real interview out loud and get an honest score.

**Set up your interview**
- Pick one of 9 preset job posts (Backend, Frontend, Full-Stack, ML Engineer, Data Analyst, DevOps, Android, QA/SDET, APM) or paste a real job description
- Choose the level (Fresher / Junior / Mid-level), the focus (Technical / Behavioural / Mixed) and the duration (5, 10, 15, 20 or 30 minutes)

**The interview**
- A strict voice interviewer ("Alex") runs the session through VAPI + Gemini: one question at a time, follow-up probing, no hints and no praise
- Live countdown, optional captions, mute, and an "end early" button
- The interviewer is told when about 90 seconds remain and wraps up; the call closes at the chosen duration
- Interviews cannot be paused or resumed. Closing the tab mid-call forfeits it

**The assessment**
- **Score out of 100** with a verdict: Strong hire (85+), Hire (70+), Borderline (55+), No hire (35+), Not ready (below 35)
- Five weighted dimensions: technical knowledge (30%), problem solving (20%), depth and examples (20%), communication (15%), professionalism (15%), each with evidence from your own answers
- A blunt summary, where you stand against the bar for the role, strengths, weaknesses and red flags
- Question-by-question critique with what a strong answer would have covered
- A prioritised action plan, plus measured speaking data (answer length, hedging, "not sure" statements, talk ratio)
- Full transcript, saved with the report

**How scoring works**
- The overall number is a weighted average **calculated in code**, not by the model, so it is reproducible
- Caps apply when there is too little evidence: under 50 spoken words caps the score at 10, and ending before the halfway mark caps it at 55
- Empty interviews skip the model entirely and get a fixed report, so no feedback is invented
- The score measures distance from a hireable answer for the role. It is not a percentile, because there is no peer data behind it
- Every started interview uses real voice credits, so each user gets 5 interviews per calendar month
- If the assessment fails, the transcript is already saved and the report page offers a retry

### 🧠 AI Session Insights
After every companion session ends, Charla automatically analyzes the full transcript using Gemini and generates:

- **Session Summary** — a concise overview of what was covered
- **Areas to Review** — concepts the student seemed to struggle with
- **Recommended Next Topic** — a specific, personalized next step with reasoning
- **5-Question Quiz** — interactive multiple-choice quiz based on the session content, with instant scoring, correct/incorrect highlighting, and explanations

Insights are generated in the background (non-blocking) and saved to the session record, viewable anytime from the History page.

### 🛠️ 15 AI Tools

**Career & Jobs**
- **ATS Scanner** — Score your resume against any job description
- **Resume Builder** — Build a polished resume through a form
- **Cover Letter Generator** — Generate tailored cover letters
- **JD Decoder** — Decode what a job description really wants
- **LinkedIn Bio Writer** — Rewrite your LinkedIn headline and summary
- **Salary Coach** — Get negotiation scripts and counter-offer ranges
- **Cold Outreach Writer** — Write personalized recruiter emails
- **Skill Gap Analyzer** — Compare your skills vs a target role and get a learning roadmap

**Academics**
- **Paper Explainer** — Upload any research paper and get a plain-English breakdown
- **Assignment Planner** — Turn a brief into a structured day-by-day plan
- **Plagiarism Rewriter** — Rephrase flagged content while preserving original meaning

**Productivity**
- **Email Drafting** — Write professional emails from bullet points
- **Code Reviewer** — Get instant code review, bug fixes, and refactoring
- **Meeting Summarizer** — Paste any transcript and get action items + summary
- **Documentation Writer** — Paste code or a process and get proper documentation

### 📜 History
A dedicated page combining all activity in one place, in three tabs:

**Tool History tab**
- Every tool run, filterable by tool name
- Expand any entry to view the full input and complete formatted output
- Copy output to clipboard
- Delete past tool runs
- "Use again" quick-link back to the tool

**Conversations tab**
- Every companion session with message count and date
- Expand any session to view:
  - AI-generated insights (summary, review areas, next topic, quiz)
  - Full conversation transcript in chat-bubble format
- "Resume" link back to the companion

**Interviews tab**
- Every scored mock interview with score, verdict, summary and top recommendations
- "Full report" link to the complete assessment
- View the full transcript on demand (loaded only when expanded)
- Retry a failed assessment, or delete an interview

### 📊 My Journey
- Lessons completed, companions created, tools used stats
- Tool usage history with quick re-access links
- Bookmarked companions
- Recent session history

### 🎨 Theming
- Full dark and light mode via `next-themes`, system-preference aware
- Persistent theme selection across sessions
- Consistent design system: spacing scale, type scale, color tokens, and component standards applied across every page

### 🔐 Auth & Subscriptions
- Clerk authentication with Google/GitHub OAuth
- Free tier: 3 companions, 10 tool uses per month, 5 mock interviews per month
- Pro tier: unlimited companions and tool uses (static pricing page — billing not yet enabled for India)

---

## Project Structure

```
charla/
├── app/
│   ├── companions/           # Companion library + individual sessions
│   │   ├── [id]/             # Voice session page
│   │   └── new/              # Create companion form
│   ├── interview/            # Mock interview: setup, live room, report
│   │   ├── [id]/             # Live room (new interview) or report (finished)
│   │   └── interview.css     # Interview-specific styles
│   ├── tools/                # AI tools dashboard + all 15 tool pages
│   │   ├── ats-scanner/
│   │   ├── resume-builder/
│   │   ├── cover-letter/
│   │   ├── jd-decoder/
│   │   ├── linkedin-bio/
│   │   ├── salary-coach/
│   │   ├── cold-outreach/
│   │   ├── skill-gap/
│   │   ├── paper-explainer/
│   │   ├── assignment-planner/
│   │   ├── plagiarism-rewriter/
│   │   ├── email-draft/
│   │   ├── code-reviewer/
│   │   ├── meeting-summarizer/
│   │   └── doc-writer/
│   ├── history/               # Tool history + conversations + interviews
│   ├── my-journey/             # User profile and history
│   ├── subscription/           # Pricing and plan management
│   └── sign-in/                # Clerk authentication
├── components/
│   ├── CompanionCard.tsx
│   ├── CompanionComponent.tsx  # Voice session UI, transcript capture, insight trigger
│   ├── CompanionForm.tsx
│   ├── CompanionsList.tsx
│   ├── SessionInsights.tsx     # Renders summary, review areas, next topic, interactive quiz
│   ├── Navbar.tsx
│   ├── NavItems.tsx
│   ├── ThemeToggle.tsx          # Dark/light mode toggle
│   ├── SearchInput.tsx
│   ├── SubjectFilter.tsx
│   ├── ToolOutput.tsx           # Shared AI output renderer
│   ├── ToolPageWrapper.tsx      # Shared tool page layout
│   ├── interview/
│   │   ├── InterviewSetup.tsx          # Job, level, focus and duration picker
│   │   ├── InterviewRoom.tsx           # Live VAPI call, timer, transcript capture
│   │   ├── InterviewReport.tsx         # Score, breakdown, critique, action plan
│   │   ├── InterviewHistoryList.tsx    # Interviews tab on the History page
│   │   └── RetryAssessmentButton.tsx   # Re-run a failed assessment
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── actions/
│   │   ├── companion.actions.ts # Companions, sessions, transcripts, insights generation
│   │   ├── tools.actions.ts     # All 15 tool backends + Gemini integration + history actions
│   │   └── interview.actions.ts # Create/start/finalize interviews, history, retry, delete
│   ├── interview/
│   │   ├── scoring.ts           # Transcript cleanup, metrics, weighted score, caps, verdict
│   │   ├── prompts.ts           # Interviewer and assessment prompts
│   │   ├── gemini.ts            # Server-side Gemini JSON call for the assessment
│   │   └── vapi-config.ts       # VAPI assistant config for the interviewer
│   ├── supabase.ts
│   ├── vapi.sdk.ts
│   └── utils.ts
├── constants/
│   ├── index.ts                 # Subjects, colors, tool definitions
│   └── interview.ts             # Job posts, durations, levels, monthly limit
├── supabase/
│   └── interview_sessions.sql   # Interview table + RLS policies
└── types/
    ├── index.d.ts                # All TypeScript types including SessionInsights, QuizQuestion
    ├── interview.ts              # Interview, assessment and history types
    └── css.d.ts                  # Lets TypeScript accept plain CSS imports
```

---

## Database Schema

```sql
-- AI Companions
companions (id, name, subject, topic, voice, style, duration, author, created_at)

-- Session tracking with transcript and AI-generated insights
session_history (
  id, companion_id, user_id,
  transcript jsonb default '[]',
  insights jsonb default null,
  created_at
)

-- Bookmarks
bookmarks (id, companion_id, user_id, created_at)

-- Tool usage (all 15 tools)
tool_usage (id, user_id, tool_name, title, input jsonb, output text, created_at)

-- Mock interviews: config, transcript and full assessment
interview_sessions (
  id, user_id, job_id, job_title, job_description,
  experience_level, focus, duration_minutes,
  status,            -- in_progress | completed | assessment_failed
  started_at, elapsed_seconds,
  transcript jsonb,  -- [{ role, content, t }]
  assessment jsonb,  -- scores, critique, action plan, metrics
  score, created_at
)
```

All tables use Row Level Security (RLS) with Clerk JWT authentication via the `requesting_user_id()` helper function.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- A Clerk account
- A Google AI Studio API key (Gemini)
- A VAPI account

### Installation

```bash
# Clone the repository
git clone https://github.com/Yash-Khandelwal2004/charla.git
cd charla

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Gemini AI (also used to write mock interview assessments)
GEMINI_API_KEY=your_gemini_api_key
# Optional: override the model used for interview assessments (default: gemini-2.5-flash)
# GEMINI_MODEL=gemini-2.5-flash

# VAPI (companions and mock interviews)
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token
```

### Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Helper function for Clerk JWT auth
create or replace function requesting_user_id()
returns text language sql stable as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claims', true)::json->>'sub',
      (current_setting('request.jwt.claims', true)::json->>'user_id')
    ), ''
  )::text;
$$;

-- Companions table
create table companions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  topic text not null,
  voice text not null,
  style text not null,
  duration int not null,
  author text not null,
  created_at timestamptz default now()
);
alter table companions enable row level security;
create policy "read all" on companions for select using (true);
create policy "insert own" on companions for insert with check (requesting_user_id() = author);

-- Session history with transcript + insights
create table session_history (
  id uuid primary key default gen_random_uuid(),
  companion_id uuid not null references companions(id) on delete cascade,
  user_id text not null,
  transcript jsonb default '[]',
  insights jsonb default null,
  created_at timestamptz default now()
);
alter table session_history enable row level security;
create policy "insert own" on session_history for insert with check (requesting_user_id() = user_id);
create policy "read own" on session_history for select using (requesting_user_id() = user_id);
create policy "update own" on session_history for update using (requesting_user_id() = user_id);

-- Bookmarks table
create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  companion_id uuid not null references companions(id) on delete cascade,
  created_at timestamptz default now()
);
alter table bookmarks enable row level security;
create policy "insert own" on bookmarks for insert with check (requesting_user_id() = user_id);
create policy "read own" on bookmarks for select using (requesting_user_id() = user_id);
create policy "delete own" on bookmarks for delete using (requesting_user_id() = user_id);

-- Tool usage table
create table tool_usage (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  tool_name text not null,
  title text,
  input jsonb not null default '{}',
  output text not null,
  created_at timestamptz default now()
);
alter table tool_usage enable row level security;
create policy "insert own" on tool_usage for insert with check (requesting_user_id() = user_id);
create policy "read own" on tool_usage for select using (requesting_user_id() = user_id);
create policy "delete own" on tool_usage for delete using (requesting_user_id() = user_id);

-- Mock interview sessions (transcript + assessment)
create table interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default requesting_user_id(),
  job_id text not null,
  job_title text not null,
  job_description text not null,
  experience_level text not null check (experience_level in ('fresher', 'junior', 'mid')),
  focus text not null check (focus in ('technical', 'behavioral', 'mixed')),
  duration_minutes int not null check (duration_minutes between 3 and 60),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'assessment_failed')),
  started_at timestamptz,
  elapsed_seconds int,
  transcript jsonb,
  assessment jsonb,
  score int check (score between 0 and 100),
  created_at timestamptz not null default now()
);
create index interview_sessions_user_created_idx on interview_sessions (user_id, created_at desc);
alter table interview_sessions enable row level security;
create policy "interview_select_own" on interview_sessions for select using (user_id = requesting_user_id());
create policy "interview_insert_own" on interview_sessions for insert with check (user_id = requesting_user_id());
create policy "interview_update_own" on interview_sessions for update
  using (user_id = requesting_user_id()) with check (user_id = requesting_user_id());
create policy "interview_delete_own" on interview_sessions for delete using (user_id = requesting_user_id());
```

The same interview table is also kept in `supabase/interview_sessions.sql`.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> **Note:** Supabase free-tier projects pause after 7 days of inactivity. If you get a `fetch failed` error, restore your project from the Supabase dashboard.

> **Note:** Mock interviews need microphone access in the browser. The interview session page sets `maxDuration = 60` for the assessment step; on Vercel plans with a lower function limit, the assessment can time out and the report page will offer a retry.

---

## Key Design Decisions

- **Server Actions over API routes** — cleaner data mutations without a separate REST layer
- **Gemini 2.5 Flash** — fast, cost-effective, generous free tier for demos and session insight generation
- **Single `tools.actions.ts`** — all 15 tool backends in one file with a shared `callAI()` helper
- **Single `tool_usage` table** — flexible `jsonb` input column handles all 15 tool input shapes
- **`session_history.transcript` + `insights` as jsonb** — stores the full conversation and AI analysis without extra tables
- **`messagesRef` pattern in `CompanionComponent`** — avoids stale-closure bugs when saving transcripts on call end, with a guard flag to prevent duplicate saves
- **Clerk JWT + Supabase RLS** — secure per-user data access without a custom auth layer
- **`ToolPageWrapper` component** — shared layout, loading state, and back navigation across all tool pages
- **`SessionInsightsView` component** — reusable interactive quiz + insights renderer used in History
- **next-themes** — system-aware dark/light mode with persistent preference
- **Interview score computed in code** — the model rates five dimensions; weights, evidence caps and the verdict are applied in `lib/interview/scoring.ts`, so the number is reproducible and cannot be inflated by generous wording
- **Save first, assess second** — an interview is claimed with its transcript in a retryable state before the assessment runs, so a double submit is harmless and a model failure never loses the transcript
- **Start-once interviews** — a session can be started a single time, which stops refresh loops from burning voice credits; a call that never connects is handed back automatically
- **Explicit VAPI call limit** — VAPI's default call limit is 10 minutes, so `maxDurationSeconds` is set from the chosen duration to keep 15-30 minute interviews from being cut off
- **Lazy transcripts in History** — the interview list loads only the score and recommendations; each transcript is fetched when expanded

---

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

---

## License

MIT License — see LICENSE file for details.

---

*Built with Next.js 15, TypeScript, Supabase, Clerk, VAPI, and Google Gemini 2.5 Flash.*