
export type ExperienceLevel = 'fresher' | 'junior' | 'mid';
export type InterviewFocus = 'technical' | 'behavioral' | 'mixed';
export type InterviewStatus = 'in_progress' | 'completed' | 'assessment_failed';

export interface JobPost {
  id: string;
  title: string;
  category: string;
  summary: string;
  skills: string[];
}

export interface InterviewMessage {
  role: 'assistant' | 'user';
  content: string;
  t: number;
}

export interface InterviewMetrics {
  candidateTurns: number;
  candidateWords: number;
  avgWordsPerAnswer: number;
  longestAnswerWords: number;
  shortAnswers: number; // answers under 15 words
  talkRatio: number; 
  fillerCount: number;
  hedgeCount: number;
  dontKnowCount: number;
  elapsedSeconds: number;
  plannedSeconds: number;
  completionRatio: number; // 0..1
}

export type DimensionKey =
  | 'technicalKnowledge'
  | 'problemSolving'
  | 'communication'
  | 'depthAndExamples'
  | 'professionalism';

export interface DimensionScore {
  score: number; // 0..100
  evidence: string;
}

export type AnswerRating = 'weak' | 'okay' | 'strong';

export interface QuestionFeedback {
  question: string;
  answerSummary: string;
  rating: AnswerRating;
  critique: string;
  betterAnswer: string;
}

export interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  action: string;
  why: string;
}

export type InterviewVerdict =
  | 'Strong hire'
  | 'Hire'
  | 'Borderline'
  | 'No hire'
  | 'Not ready';

export interface InterviewAssessment {
  overallScore: number; 
  rawScore: number;
  capReason: string | null;
  verdict: InterviewVerdict;
  dimensions: Record<DimensionKey, DimensionScore>;
  brutalSummary: string;
  standing: string;
  strengths: string[];
  weaknesses: string[];
  redFlags: string[];
  questionFeedback: QuestionFeedback[];
  actionPlan: ActionItem[];
  metrics: InterviewMetrics;
  generatedAt: string;
}

export interface InterviewSessionRow {
  id: string;
  user_id: string;
  job_id: string;
  job_title: string;
  job_description: string;
  experience_level: ExperienceLevel;
  focus: InterviewFocus;
  duration_minutes: number;
  status: InterviewStatus;
  started_at: string | null;
  elapsed_seconds: number | null;
  transcript: InterviewMessage[] | null;
  assessment: InterviewAssessment | null;
  score: number | null;
  created_at: string;
}

export interface InterviewListItem {
  id: string;
  job_title: string;
  duration_minutes: number;
  status: InterviewStatus;
  started_at: string | null;
  score: number | null;
  created_at: string;
}

export interface InterviewHistoryItem {
  id: string;
  job_title: string;
  experience_level: ExperienceLevel;
  focus: InterviewFocus;
  duration_minutes: number;
  status: InterviewStatus;
  score: number | null;
  elapsed_seconds: number | null;
  created_at: string;
  verdict: InterviewVerdict | null;
  summary: string | null;
  plan: ActionItem[];
  weaknesses: string[];
}

export type ActionResult<T extends object = object> =
  | ({ ok: true } & T)
  | { ok: false; error: string; saved?: boolean };