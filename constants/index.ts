
// ── Subjects ───────────────────────────────────────────
export const subjects = [
  "dsa",
  "dbms",
  "os",
  "networks",
  "oop",
  "system-design",
];

export const subjectLabels: Record<string, string> = {
  "dsa": "Data Structures & Algorithms",
  "dbms": "Database Management Systems",
  "os": "Operating Systems",
  "networks": "Computer Networks",
  "oop": "Object-Oriented Programming",
  "system-design": "System Design",
};

// Muted subject accent colors 
export const subjectsColors: Record<string, string> = {
  "dsa":           "#d97706",   // muted amber
  "dbms":          "#7c3aed",   // muted violet
  "os":            "#db2777",   // muted pink
  "networks":      "#0284c7",   // muted sky
  "oop":           "#059669",   // muted emerald
  "system-design": "#ea580c",   // muted orange
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
    subject: "dsa",
    name: "Codey the Algorithm Ace",
    topic: "Binary Trees & Traversals",
    duration: 45,
    color: "#d97706",
  },
  {
    id: "2",
    subject: "dbms",
    name: "Query the Data Wizard",
    topic: "Normalization & Joins",
    duration: 30,
    color: "#7c3aed",
  },
  {
    id: "3",
    subject: "os",
    name: "Kernel the Process Manager",
    topic: "Deadlocks & Scheduling",
    duration: 30,
    color: "#db2777",
  },
  {
    id: "4",
    subject: "networks",
    name: "Packet the Protocol Guide",
    topic: "TCP/IP & the OSI Model",
    duration: 45,
    color: "#0284c7",
  },
  {
    id: "5",
    subject: "oop",
    name: "Classy the Object Builder",
    topic: "Inheritance & Polymorphism",
    duration: 15,
    color: "#059669",
  },
  {
    id: "6",
    subject: "system-design",
    name: "Archie the System Architect",
    topic: "Load Balancing & Caching",
    duration: 10,
    color: "#ea580c",
  },
];