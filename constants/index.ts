// ── Subjects ───────────────────────────────────────────
export const subjects = [
  "maths",
  "language",
  "science",
  "history",
  "coding",
  "economics",
];

// Muted subject accent colors (for both light and dark)
export const subjectsColors: Record<string, string> = {
  science:   "#7c3aed",   // muted violet
  maths:     "#d97706",   // muted amber
  language:  "#0284c7",   // muted sky
  coding:    "#db2777",   // muted pink
  history:   "#ea580c",   // muted orange
  economics: "#059669",   // muted emerald
};

// ── VAPI Voices ────────────────────────────────────────
export const voices = {
  male:   { casual: "2BJW5coyhAzSr8STdHbE", formal: "c6SfcYrb2t09NHXiT80T" },
  female: { casual: "ZIlrSGI4jZqobxRKprJz", formal: "sarah" },
};

// ── Tools ──────────────────────────────────────────────
export const tools = [
  {
    id: "ats-scanner",
    label: "ATS Scanner",
    description: "Score your resume against any job description",
    href: "/tools/ats-scanner",
    icon: "📄",
    category: "career",
  },
  {
    id: "resume-builder",
    label: "Resume Builder",
    description: "Build a polished resume through conversation",
    href: "/tools/resume-builder",
    icon: "📝",
    category: "career",
  },
  {
    id: "cover-letter",
    label: "Cover Letter",
    description: "Generate tailored cover letters instantly",
    href: "/tools/cover-letter",
    icon: "✉️",
    category: "career",
  },
  {
    id: "jd-decoder",
    label: "JD Decoder",
    description: "Decode what a job description is really asking for",
    href: "/tools/jd-decoder",
    icon: "🔍",
    category: "career",
  },
  {
    id: "linkedin-bio",
    label: "LinkedIn Bio",
    description: "Rewrite your LinkedIn headline & summary",
    href: "/tools/linkedin-bio",
    icon: "💼",
    category: "career",
  },
  {
    id: "salary-coach",
    label: "Salary Coach",
    description: "Practice salary negotiation with AI roleplay",
    href: "/tools/salary-coach",
    icon: "💰",
    category: "career",
  },
  {
    id: "cold-outreach",
    label: "Cold Outreach",
    description: "Write personalized recruiter & networking emails",
    href: "/tools/cold-outreach",
    icon: "📬",
    category: "career",
  },
  {
    id: "skill-gap",
    label: "Skill Gap Analyzer",
    description: "Compare your skills vs a target role and get a roadmap",
    href: "/tools/skill-gap",
    icon: "🎯",
    category: "career",
  },
  {
    id: "paper-explainer",
    label: "Paper Explainer",
    description: "Upload any research paper and get a simple breakdown",
    href: "/tools/paper-explainer",
    icon: "🎓",
    category: "academic",
  },
  {
    id: "assignment-planner",
    label: "Assignment Planner",
    description: "Turn any brief into a structured plan with timeline",
    href: "/tools/assignment-planner",
    icon: "📅",
    category: "academic",
  },
  {
    id: "plagiarism-rewriter",
    label: "Plagiarism Rewriter",
    description: "Rephrase flagged content while keeping the original meaning",
    href: "/tools/plagiarism-rewriter",
    icon: "✏️",
    category: "academic",
  },
  {
    id: "email-draft",
    label: "Email Drafting",
    description: "Write professional emails in seconds",
    href: "/tools/email-draft",
    icon: "📧",
    category: "productivity",
  },
  {
    id: "code-reviewer",
    label: "Code Reviewer",
    description: "Get instant code review, bug explanations & fixes",
    href: "/tools/code-reviewer",
    icon: "🔧",
    category: "productivity",
  },
  {
    id: "meeting-summarizer",
    label: "Meeting Summarizer",
    description: "Paste any meeting transcript and get action items + summary",
    href: "/tools/meeting-summarizer",
    icon: "🗒️",
    category: "productivity",
  },
  {
    id: "doc-writer",
    label: "Documentation Writer",
    description: "Paste code or a process and get proper documentation",
    href: "/tools/doc-writer",
    icon: "📖",
    category: "productivity",
  },
] as const;

export type ToolId = typeof tools[number]["id"];
export type ToolCategory = "career" | "academic" | "productivity";

// ── Mock recent sessions (fallback) ───────────────────
export const recentSessions = [
  {
    id: "1",
    subject: "science",
    name: "Neura the Brainy Explorer",
    topic: "Neural Network of the Brain",
    duration: 45,
    color: "#c084fc",
  },
  {
    id: "2",
    subject: "maths",
    name: "Countsy the Number Wizard",
    topic: "Derivatives & Integrals",
    duration: 30,
    color: "#fbbf24",
  },
  {
    id: "3",
    subject: "language",
    name: "Verba the Vocabulary Builder",
    topic: "English Literature",
    duration: 30,
    color: "#38bdf8",
  },
  {
    id: "4",
    subject: "coding",
    name: "Codey the Logic Hacker",
    topic: "Intro to If-Else Statements",
    duration: 45,
    color: "#f472b6",
  },
  {
    id: "5",
    subject: "history",
    name: "Memo the Memory Keeper",
    topic: "World Wars: Causes & Consequences",
    duration: 15,
    color: "#fb923c",
  },
  {
    id: "6",
    subject: "economics",
    name: "The Market Maestro",
    topic: "The Basics of Supply & Demand",
    duration: 10,
    color: "#34d399",
  },
];