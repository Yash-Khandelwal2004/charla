# Charla — AI Companion Platform for Career & Learning

> Your AI-powered companion for career development, academics, and productivity.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-green?style=flat-square&logo=supabase)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?style=flat-square)
![Gemini](https://img.shields.io/badge/Gemini-AI-orange?style=flat-square&logo=google)

---

## What is Charla?

Charla is a full-stack SaaS platform where users can:

- Create personalized **AI companions** for voice-powered learning sessions across 6 subjects
- Use **15 AI-powered tools** for career development, academics, and productivity
- Track their learning journey, session history, and tool usage over time


---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Custom CSS Variables |
| Database | Supabase (PostgreSQL) |
| ORM | Supabase JS Client |
| Auth | Clerk |
| AI | Google Gemini 2.5 Flash |
| Voice AI | VAPI |
| UI Components | shadcn/ui |
| Notifications | Sonner |
| Package Manager | npm |

---

## Features

### 🤖 AI Companions
Create personalized AI tutors for voice-powered learning sessions.

- 6 subjects: Maths, Science, Language, History, Coding, Economics
- Custom voice (male/female) and teaching style (formal/casual)
- Real-time voice conversations powered by VAPI
- Session history tracking
- Bookmark favourite companions
- Companion library with search and subject filtering

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

### 📊 My Journey
- Lessons completed, companions created, tools used stats
- Tool usage history with quick re-access links
- Bookmarked companions
- Recent session history

### 🔐 Auth & Subscriptions
- Clerk authentication with Google/GitHub OAuth
- Free tier: 10 tool uses per month
- Pro tier: unlimited tool uses
- Subscription management via Clerk Pricing Table

---

## Project Structure

```
charla/
├── app/
│   ├── companions/           # Companion library + individual sessions
│   │   ├── [id]/             # Voice session page
│   │   └── new/              # Create companion form
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
│   ├── my-journey/           # User profile and history
│   ├── subscription/         # Pricing and plan management
│   └── sign-in/              # Clerk authentication
├── components/
│   ├── CompanionCard.tsx
│   ├── CompanionComponent.tsx
│   ├── CompanionForm.tsx
│   ├── CompanionsList.tsx
│   ├── Navbar.tsx
│   ├── NavItems.tsx
│   ├── SearchInput.tsx
│   ├── SubjectFilter.tsx
│   ├── ToolOutput.tsx        # Shared AI output renderer
│   ├── ToolPageWrapper.tsx   # Shared tool page layout
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── actions/
│   │   ├── companion.actions.ts
│   │   └── tools.actions.ts  # All 11 tool backends + Gemini integration
│   ├── supabase.ts
│   └── utils.ts
├── constants/
│   └── index.ts              # Subjects, colors, tool definitions
└── types/
    └── index.d.ts            # All TypeScript types
```

---

## Database Schema

```sql
-- AI Companions
companions (id, name, subject, topic, voice, style, duration, author, created_at)

-- Session tracking
session_history (id, companion_id, user_id, created_at)

-- Bookmarks
bookmarks (id, companion_id, user_id, created_at)

-- Tool usage (all 11 tools)
tool_usage (id, user_id, tool_name, input jsonb, output text, created_at)
```

All tables use Row Level Security (RLS) with Clerk JWT authentication.

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
git clone https://github.com/yourusername/charla.git
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

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# VAPI
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

-- Tool usage table
create table tool_usage (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  tool_name text not null,
  input jsonb not null default '{}',
  output text not null,
  created_at timestamptz default now()
);
alter table tool_usage enable row level security;
create policy "insert own" on tool_usage for insert with check (requesting_user_id() = user_id);
create policy "read own" on tool_usage for select using (requesting_user_id() = user_id);

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
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Key Design Decisions

- **Server Actions over API routes** — cleaner data mutations without a separate REST layer
- **Gemini 2.5 Flash** — fast, cost-effective, generous free tier for demos
- **Single `tools.actions.ts`** — all 15 tool backends in one file with a shared `callAI()` helper
- **Single `tool_usage` table** — flexible `jsonb` input column handles all 15 tool input shapes
- **Clerk JWT + Supabase RLS** — secure per-user data access without a custom auth layer
- **`ToolPageWrapper` component** — shared layout, loading state, and back navigation across all tool pages
- **Inline styles over Tailwind** — avoids class conflicts in complex dark theme components

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

*Built with Next.js 15, TypeScript, Supabase, Clerk, and Google Gemini 2.5 Flash.*