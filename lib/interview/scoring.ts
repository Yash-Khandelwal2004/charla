
import type {
  DimensionKey,
  InterviewMessage,
  InterviewMetrics,
  InterviewVerdict,
} from '@/types/interview';

export const DIMENSION_WEIGHTS: Record<DimensionKey, number> = {
  technicalKnowledge: 0.3,
  problemSolving: 0.2,
  communication: 0.15,
  depthAndExamples: 0.2,
  professionalism: 0.15,
};

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  technicalKnowledge: 'Technical knowledge',
  problemSolving: 'Problem solving',
  communication: 'Communication',
  depthAndExamples: 'Depth and examples',
  professionalism: 'Professionalism',
};

export const DIMENSION_KEYS = Object.keys(DIMENSION_WEIGHTS) as DimensionKey[];

const MAX_MESSAGES = 300;
const MAX_TOTAL_CHARS = 60_000;


export function normalizeTranscript(raw: unknown): InterviewMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: InterviewMessage[] = [];
  let totalChars = 0;

  for (const item of raw.slice(0, MAX_MESSAGES)) {
    if (!item || typeof item !== 'object') continue;
    const { role, content, t } = item as Record<string, unknown>;
    if ((role !== 'assistant' && role !== 'user') || typeof content !== 'string') continue;

    const text = content.replace(/\s+/g, ' ').trim();
    if (!text) continue;

    totalChars += text.length;
    if (totalChars > MAX_TOTAL_CHARS) break;

    const time = typeof t === 'number' && Number.isFinite(t) && t >= 0 ? Math.round(t) : 0;
    const last = out[out.length - 1];
    if (last && last.role === role) {
      last.content = `${last.content} ${text}`;
    } else {
      out.push({ role, content: text, t: time });
    }
  }
  return out;
}

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const countMatches = (s: string, re: RegExp) => (s.match(re) ?? []).length;

const FILLER_RE = /\b(um+|uh+|uhm|erm|you know|basically|kind of|sort of|i mean|literally)\b/gi;
const HEDGE_RE = /\b(i guess|i think|maybe|probably|perhaps|might be)\b/gi;
const DONT_KNOW_RE =
  /\b(i don'?t know|i do not know|no idea|i forgot|i'?m not sure|i am not sure|not sure|can'?t remember|don'?t remember)\b/gi;

export function computeMetrics(
  messages: InterviewMessage[],
  elapsedSeconds: number,
  plannedSeconds: number,
): InterviewMetrics {
  const candidate = messages.filter((m) => m.role === 'user');
  const interviewer = messages.filter((m) => m.role === 'assistant');

  const candidateWordCounts = candidate.map((m) => wordCount(m.content));
  const candidateWords = candidateWordCounts.reduce((a, b) => a + b, 0);
  const interviewerWords = interviewer.reduce((a, m) => a + wordCount(m.content), 0);
  const candidateText = candidate.map((m) => m.content).join(' ');

  return {
    candidateTurns: candidate.length,
    candidateWords,
    avgWordsPerAnswer: candidate.length ? Math.round(candidateWords / candidate.length) : 0,
    longestAnswerWords: candidateWordCounts.length ? Math.max(...candidateWordCounts) : 0,
    shortAnswers: candidateWordCounts.filter((n) => n < 15).length,
    talkRatio:
      candidateWords + interviewerWords > 0
        ? Number((candidateWords / (candidateWords + interviewerWords)).toFixed(2))
        : 0,
    fillerCount: countMatches(candidateText, FILLER_RE),
    hedgeCount: countMatches(candidateText, HEDGE_RE),
    dontKnowCount: countMatches(candidateText, DONT_KNOW_RE),
    elapsedSeconds: Math.round(elapsedSeconds),
    plannedSeconds: Math.round(plannedSeconds),
    completionRatio:
      plannedSeconds > 0 ? Number(Math.min(1, elapsedSeconds / plannedSeconds).toFixed(2)) : 0,
  };
}

export const clampScore = (n: unknown): number => {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
};

export function isInsufficient(metrics: InterviewMetrics): boolean {
  return metrics.candidateWords < 50 || metrics.candidateTurns < 2;
}


export function computeOverall(
  dimensionScores: Record<DimensionKey, number>,
  metrics: InterviewMetrics,
): { overall: number; raw: number; capReason: string | null } {
  const raw = Math.round(
    DIMENSION_KEYS.reduce((sum, key) => sum + DIMENSION_WEIGHTS[key] * dimensionScores[key], 0),
  );

  let cap = 100;
  let capReason: string | null = null;

  if (isInsufficient(metrics)) {
    cap = 10;
    capReason =
      'You gave too little to assess (under 50 words or fewer than 2 answers), so the score is capped at 10.';
  } else if (metrics.completionRatio < 0.5) {
    cap = 55;
    capReason =
      'You ended the interview before the halfway mark, so there is not enough evidence to score above 55.';
  }

  return { overall: Math.min(raw, cap), raw, capReason };
}

export function verdictFor(score: number): InterviewVerdict {
  if (score >= 85) return 'Strong hire';
  if (score >= 70) return 'Hire';
  if (score >= 55) return 'Borderline';
  if (score >= 35) return 'No hire';
  return 'Not ready';
}

export function scoreColor(score: number): string {
  if (score >= 85) return '#22c55e';
  if (score >= 70) return '#84cc16';
  if (score >= 55) return '#f59e0b';
  if (score >= 35) return '#f97316';
  return '#ef4444';
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}