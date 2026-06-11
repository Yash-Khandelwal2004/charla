// ── Existing types (unchanged) ────────────────────────

enum Subject {
  maths = "maths",
  language = "language",
  science = "science",
  history = "history",
  coding = "coding",
  geography = "geography",
  economics = "economics",
  finance = "finance",
  business = "business",
}

type Companion = Models.DocumentList<Models.Document> & {
  $id: string;
  name: string;
  subject: Subject;
  topic: string;
  duration: number;
  bookmarked: boolean;
};

interface CreateCompanion {
  name: string;
  subject: string;
  topic: string;
  voice: string;
  style: string;
  duration: number;
}

interface GetAllCompanions {
  limit?: number;
  page?: number;
  subject?: string | string[];
  topic?: string | string[];
}

interface BuildClient {
  key?: string;
  sessionToken?: string;
}

interface CreateUser {
  email: string;
  name: string;
  image?: string;
  accountId: string;
}

interface SearchParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface Avatar {
  userName: string;
  width: number;
  height: number;
  className?: string;
}

interface SavedMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface CompanionComponentProps {
  companionId: string;
  subject: string;
  topic: string;
  name: string;
  userName: string;
  userImage: string;
  voice: string;
  style: string;
}

// ── Tool types (new) ──────────────────────────────────

// All valid tool identifiers
type ToolName =
  | "ats-scanner"
  | "resume-builder"
  | "cover-letter"
  | "jd-decoder"
  | "linkedin-bio"
  | "salary-coach"
  | "cold-outreach"
  | "paper-explainer"
  | "assignment-planner"
  | "email-draft"
  | "code-reviewer"
  | "plagiarism-rewriter"
  | "meeting-summarizer"
  | "doc-writer"
  | "skill-gap";

// A single tool usage record from DB
interface ToolUsage {
  id: string;
  user_id: string;
  tool_name: ToolName;
  input: Record<string, string>;   // jsonb — flexible per tool
  output: string;                  // AI generated result
  created_at: string;
}

// For saving a tool result
interface SaveToolUsage {
  tool_name: ToolName;
  input: Record<string, string>;
  output: string;
}

// ── Per-tool input types ──────────────────────────────

interface ATSScannerInput {
  resume: string;
  job_description: string;
}

interface ResumeBuilderInput {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
}

interface CoverLetterInput {
  resume: string;
  job_description: string;
  company_name: string;
  tone: "formal" | "friendly" | "enthusiastic";
}

interface JDDecoderInput {
  job_description: string;
}

interface LinkedInBioInput {
  current_role: string;
  experience: string;
  skills: string;
  goal: string;
  tone: "professional" | "conversational" | "bold";
}

interface SalaryCoachInput {
  role: string;
  current_offer: string;
  target_salary: string;
  experience_years: string;
  location: string;
}

interface ColdOutreachInput {
  your_name: string;
  your_role: string;
  target_name: string;
  target_company: string;
  purpose: "job" | "networking" | "collaboration";
  context: string;
}

interface PaperExplainerInput {
  paper_text: string;
  detail_level: "simple" | "intermediate" | "detailed";
}

interface AssignmentPlannerInput {
  assignment_brief: string;
  subject: string;
  deadline: string;
  word_count?: string;
}

interface EmailDraftInput {
  context: string;
  recipient: string;
  tone: "formal" | "casual" | "assertive";
  key_points: string;
}

interface CodeReviewerInput {
  code: string;
  language: string;
  focus: "bugs" | "performance" | "readability" | "all";
}

// ── Tool result shape ─────────────────────────────────

interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}


interface PlagiarismRewriterInput {
  text: string;
  style: "academic" | "professional" | "casual";
  subject?: string;
}
 
interface MeetingSummarizerInput {
  transcript: string;
  meeting_type?: string;
  participants?: string;
}
 
interface DocWriterInput {
  content: string;
  doc_type: "code" | "api" | "process";
  audience?: string;
}
 
interface SkillGapAnalyzerInput {
  current_skills: string;
  target_role: string;
  experience_years?: string;
  timeline?: string;
}

interface SessionHistory {
  id: string;
  companion_id: string;
  user_id: string;
  transcript: SavedMessage[];
  created_at: string;
  companions?: Companion;
}

interface ToolUsageWithInput extends ToolUsage {
  title?: string;
}