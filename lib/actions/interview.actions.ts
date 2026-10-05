// ============================================================
// PASTE THIS FILE AT: lib/actions/interview.actions.ts (REPLACE existing file)
// ============================================================
'use server';

import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';
import {
  CUSTOM_JD_MAX_CHARS,
  CUSTOM_JD_MIN_CHARS,
  CUSTOM_JOB_ID,
  CUSTOM_TITLE_MAX_CHARS,
  DURATIONS,
  FOCUS_OPTIONS,
  INTERVIEW_MONTHLY_LIMIT,
  LEVELS,
  getJobPost,
} from '@/constants/interview';
import { generateJsonText } from '@/lib/interview/gemini';
import { buildAssessmentPrompt, type InterviewContext } from '@/lib/interview/prompts';
import {
  DIMENSION_KEYS,
  clampScore,
  computeMetrics,
  computeOverall,
  isInsufficient,
  normalizeTranscript,
  verdictFor,
} from '@/lib/interview/scoring';
import type {
  ActionItem,
  ActionResult,
  AnswerRating,
  DimensionKey,
  DimensionScore,
  ExperienceLevel,
  InterviewAssessment,
  InterviewFocus,
  InterviewHistoryItem,
  InterviewListItem,
  InterviewMessage,
  InterviewMetrics,
  InterviewSessionRow,
  QuestionFeedback,
} from '@/types/interview';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (v: string) => UUID_RE.test(v);
const fail = (error: string, saved = false) => ({ ok: false as const, error, saved });

type Supabase = ReturnType<typeof createSupabaseClient>;

async function startedThisMonth(supabase: Supabase, userId: string): Promise<number> {
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('interview_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('started_at', 'is', null)
    .gte('created_at', monthStart.toISOString());

  if (error) throw new Error(error.message);
  return count ?? 0;
}

const str = (v: unknown, max = 1200): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

const strArr = (v: unknown, maxItems: number, maxLen = 500): string[] =>
  Array.isArray(v)
    ? v
        .map((x) => str(x, maxLen))
        .filter(Boolean)
        .slice(0, maxItems)
    : [];

function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function toContext(row: InterviewSessionRow): InterviewContext {
  return {
    jobTitle: row.job_title,
    jobDescription: row.job_description,
    skills: getJobPost(row.job_id)?.skills ?? [],
    level: row.experience_level,
    focus: row.focus,
    durationMinutes: row.duration_minutes,
  };
}

function parseAssessment(text: string, metrics: InterviewMetrics): InterviewAssessment {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(stripFences(text)) as Record<string, unknown>;
  } catch {
    throw new Error('Assessment was not valid JSON.');
  }

  const rawDims = (parsed.dimensions ?? {}) as Record<string, unknown>;
  const dimensions = {} as Record<DimensionKey, DimensionScore>;
  const dimensionScores = {} as Record<DimensionKey, number>;

  for (const key of DIMENSION_KEYS) {
    const d = rawDims[key] as { score?: unknown; evidence?: unknown } | undefined;
    if (!d || typeof d !== 'object' || !Number.isFinite(Number(d.score))) {
      throw new Error(`Assessment is missing the "${key}" score.`);
    }
    const score = clampScore(d.score);
    dimensions[key] = { score, evidence: str(d.evidence, 600) };
    dimensionScores[key] = score;
  }

  const ratings: AnswerRating[] = ['weak', 'okay', 'strong'];
  const questionFeedback: QuestionFeedback[] = (
    Array.isArray(parsed.questionFeedback) ? parsed.questionFeedback : []
  )
    .slice(0, 12)
    .map((q): QuestionFeedback => {
      const o = (q ?? {}) as Record<string, unknown>;
      const rating = ratings.includes(o.rating as AnswerRating) ? (o.rating as AnswerRating) : 'okay';
      return {
        question: str(o.question, 400),
        answerSummary: str(o.answerSummary, 600),
        rating,
        critique: str(o.critique, 800),
        betterAnswer: str(o.betterAnswer, 800),
      };
    })
    .filter((q) => q.question);

  const priorityOrder: Record<ActionItem['priority'], number> = { high: 0, medium: 1, low: 2 };
  const actionPlan: ActionItem[] = (Array.isArray(parsed.actionPlan) ? parsed.actionPlan : [])
    .slice(0, 6)
    .map((a): ActionItem => {
      const o = (a ?? {}) as Record<string, unknown>;
      const priority = (['high', 'medium', 'low'] as const).includes(o.priority as ActionItem['priority'])
        ? (o.priority as ActionItem['priority'])
        : 'medium';
      return { priority, action: str(o.action, 500), why: str(o.why, 400) };
    })
    .filter((a) => a.action)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const { overall, raw, capReason } = computeOverall(dimensionScores, metrics);

  return {
    overallScore: overall,
    rawScore: raw,
    capReason,
    verdict: verdictFor(overall),
    dimensions,
    brutalSummary: str(parsed.brutalSummary, 1600),
    standing: str(parsed.standing, 900),
    strengths: strArr(parsed.strengths, 4),
    weaknesses: strArr(parsed.weaknesses, 5),
    redFlags: strArr(parsed.redFlags, 4),
    questionFeedback,
    actionPlan,
    metrics,
    generatedAt: new Date().toISOString(),
  };
}

/** No LLM call when there is nothing to assess: cheaper, and it cannot hallucinate feedback. */
function buildInsufficientAssessment(metrics: InterviewMetrics): InterviewAssessment {
  const dimensions = {} as Record<DimensionKey, DimensionScore>;
  const zeros = {} as Record<DimensionKey, number>;
  for (const key of DIMENSION_KEYS) {
    dimensions[key] = { score: 0, evidence: 'Not enough spoken answers to judge this.' };
    zeros[key] = 0;
  }
  const { overall, raw, capReason } = computeOverall(zeros, metrics);

  return {
    overallScore: overall,
    rawScore: raw,
    capReason,
    verdict: verdictFor(overall),
    dimensions,
    brutalSummary:
      'There is nothing to assess. You gave almost no answers, so no interviewer could form an opinion of you. In a real interview this ends as an immediate rejection. If your microphone was not picking you up, that is a setup problem rather than a skills problem: check the browser microphone permission and run a short practice interview first.',
    standing:
      'You cannot be placed against the bar for this role yet because there was no usable evidence. Any candidate who answers the questions, even imperfectly, is ahead of this result.',
    strengths: [],
    weaknesses: ['Too little was said to evaluate anything.'],
    redFlags: [],
    questionFeedback: [],
    actionPlan: [
      {
        priority: 'high',
        action: 'Test your microphone and run a 5-minute practice interview.',
        why: 'You need to confirm the transcript actually captures your voice.',
      },
      {
        priority: 'high',
        action:
          'Write and rehearse a 60-second self-introduction plus your answers to the five most common questions for this role.',
        why: 'Having answers ready removes the freeze that leads to one-word replies.',
      },
    ],
    metrics,
    generatedAt: new Date().toISOString(),
  };
}

async function runAssessment(
  row: InterviewSessionRow,
  messages: InterviewMessage[],
  elapsedSeconds: number,
): Promise<InterviewAssessment> {
  const metrics = computeMetrics(messages, elapsedSeconds, row.duration_minutes * 60);
  if (isInsufficient(metrics)) return buildInsufficientAssessment(metrics);

  const text = await generateJsonText(buildAssessmentPrompt(toContext(row), messages, metrics));
  return parseAssessment(text, metrics);
}

async function saveAssessment(
  supabase: Supabase,
  id: string,
  userId: string,
  assessment: InterviewAssessment,
): Promise<void> {
  const { error } = await supabase
    .from('interview_sessions')
    .update({ assessment, score: assessment.overallScore, status: 'completed' })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export interface CreateInterviewInput {
  jobId: string;
  customTitle?: string;
  customDescription?: string;
  level: ExperienceLevel;
  focus: InterviewFocus;
  durationMinutes: number;
}

export async function createInterviewSession(
  input: CreateInterviewInput,
): Promise<ActionResult<{ id: string }>> {
  const { userId } = await auth();
  if (!userId) return fail('Please sign in to start an interview.');

  if (!LEVELS.some((l) => l.id === input.level)) return fail('Pick an experience level.');
  if (!FOCUS_OPTIONS.some((f) => f.id === input.focus)) return fail('Pick an interview focus.');
  if (!DURATIONS.some((d) => d.minutes === input.durationMinutes)) return fail('Pick a duration.');

  let jobTitle: string;
  let jobDescription: string;

  if (input.jobId === CUSTOM_JOB_ID) {
    jobTitle = str(input.customTitle, CUSTOM_TITLE_MAX_CHARS);
    jobDescription = str(input.customDescription, CUSTOM_JD_MAX_CHARS);
    if (jobTitle.length < 2) return fail('Enter the job title.');
    if (jobDescription.length < CUSTOM_JD_MIN_CHARS) {
      return fail(`Paste at least ${CUSTOM_JD_MIN_CHARS} characters of the job description.`);
    }
  } else {
    const job = getJobPost(input.jobId);
    if (!job) return fail('That job post does not exist.');
    jobTitle = job.title;
    jobDescription = job.summary;
  }

  try {
    const supabase = createSupabaseClient();

    // Early feedback only. The authoritative check runs again in markInterviewStarted().
    if ((await startedThisMonth(supabase, userId)) >= INTERVIEW_MONTHLY_LIMIT) {
      return fail(`You have used all ${INTERVIEW_MONTHLY_LIMIT} interviews for this month.`);
    }

    const { data, error } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: userId,
        job_id: input.jobId,
        job_title: jobTitle,
        job_description: jobDescription,
        experience_level: input.level,
        focus: input.focus,
        duration_minutes: input.durationMinutes,
      })
      .select('id')
      .single();

    if (error || !data) return fail(error?.message ?? 'Could not create the interview.');
    return { ok: true, id: data.id as string };
  } catch (e) {
    console.error('[interview] create failed', e);
    return fail('Could not create the interview. Try again.');
  }
}

/** Marks the call as started exactly once. Prevents refresh loops from burning VAPI credits. */
export async function markInterviewStarted(id: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return fail('Please sign in again.');
  if (!isUuid(id)) return fail('Invalid interview.');

  try {
    const supabase = createSupabaseClient();

    if ((await startedThisMonth(supabase, userId)) >= INTERVIEW_MONTHLY_LIMIT) {
      return fail(`You have used all ${INTERVIEW_MONTHLY_LIMIT} interviews for this month.`);
    }

    const { data, error } = await supabase
      .from('interview_sessions')
      .update({ started_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .is('started_at', null)
      .select('id');

    if (error) return fail(error.message);
    if (!data || data.length === 0) return fail('This interview has already been started.');
    return { ok: true };
  } catch (e) {
    console.error('[interview] start failed', e);
    return fail('Could not start the interview. Try again.');
  }
}


export async function releaseInterviewStart(id: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return fail('Please sign in again.');
  if (!isUuid(id)) return fail('Invalid interview.');

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('interview_sessions')
    .update({ started_at: null })
    .eq('id', id)
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .is('transcript', null);

  if (error) return fail(error.message);
  return { ok: true };
}


export async function finalizeInterview(
  id: string,
  rawMessages: unknown,
  elapsedSeconds: number,
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return fail('Please sign in again.');
  if (!isUuid(id)) return fail('Invalid interview.');

  try {
    const supabase = createSupabaseClient();

    const { data: row, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !row) return fail('Interview not found.');
    const session = row as InterviewSessionRow;

    if (session.status !== 'in_progress') return { ok: true }; // already handled
    if (!session.started_at) return fail('This interview was never started.');

    const messages = normalizeTranscript(rawMessages);
    const planned = session.duration_minutes * 60;
    const elapsed = Math.max(0, Math.min(Math.round(Number(elapsedSeconds) || 0), planned + 180));

    const { data: claimed, error: claimError } = await supabase
      .from('interview_sessions')
      .update({ transcript: messages, elapsed_seconds: elapsed, status: 'assessment_failed' })
      .eq('id', id)
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .select('id');

    if (claimError) return fail(claimError.message);
    if (!claimed || claimed.length === 0) return { ok: true }; // another request got there first

    try {
      const assessment = await runAssessment(session, messages, elapsed);
      await saveAssessment(supabase, id, userId, assessment);
      return { ok: true };
    } catch (e) {
      console.error('[interview] assessment failed', e);
      return fail(
        'Your transcript is saved, but the assessment failed. Retry it from the results page.',
        true,
      );
    }
  } catch (e) {
    console.error('[interview] finalize failed', e);
    return fail('Something went wrong while saving your interview.');
  }
}

export async function retryInterviewAssessment(id: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return fail('Please sign in again.');
  if (!isUuid(id)) return fail('Invalid interview.');

  try {
    const supabase = createSupabaseClient();
    const { data: row, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !row) return fail('Interview not found.');
    const session = row as InterviewSessionRow;

    if (session.status === 'completed') return { ok: true };
    if (session.status !== 'assessment_failed' || !session.transcript) {
      return fail('This interview has no saved transcript to assess.');
    }

    const assessment = await runAssessment(
      session,
      normalizeTranscript(session.transcript),
      session.elapsed_seconds ?? 0,
    );
    await saveAssessment(supabase, id, userId, assessment);
    return { ok: true };
  } catch (e) {
    console.error('[interview] retry failed', e);
    return fail('The assessment failed again. Wait a minute and retry.');
  }
}

export async function getInterviewSession(id: string): Promise<InterviewSessionRow | null> {
  const { userId } = await auth();
  if (!userId || !isUuid(id)) return null;

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[interview] load failed', error.message);
    return null;
  }
  return (data as InterviewSessionRow | null) ?? null;
}

export async function getUserInterviews(limit = 10): Promise<InterviewListItem[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('id, job_title, duration_minutes, status, started_at, score, created_at')
    .eq('user_id', userId)
    .not('started_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[interview] list failed', error.message);
    return [];
  }
  return (data ?? []) as InterviewListItem[];
}


export async function getInterviewHistory(limit = 50): Promise<InterviewHistoryItem[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('interview_sessions')
    .select(
      'id, job_title, experience_level, focus, duration_minutes, status, score, elapsed_seconds, created_at, ' +
        'verdict:assessment->>verdict, summary:assessment->>brutalSummary, ' +
        'plan:assessment->actionPlan, weaknesses:assessment->weaknesses',
    )
    .eq('user_id', userId)
    .in('status', ['completed', 'assessment_failed'])
    .not('started_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(limit, 100)));

  if (error) {
    console.error('[interview] history failed', error.message);
    return [];
  }

  const priorities = ['high', 'medium', 'low'];
  return ((data ?? []) as unknown as Record<string, unknown>[]).map((r): InterviewHistoryItem => ({
    id: String(r.id),
    job_title: String(r.job_title ?? ''),
    experience_level: r.experience_level as ExperienceLevel,
    focus: r.focus as InterviewFocus,
    duration_minutes: Number(r.duration_minutes) || 0,
    status: r.status as InterviewHistoryItem['status'],
    score: typeof r.score === 'number' ? r.score : null,
    elapsed_seconds: typeof r.elapsed_seconds === 'number' ? r.elapsed_seconds : null,
    created_at: String(r.created_at),
    verdict: typeof r.verdict === 'string' ? (r.verdict as InterviewHistoryItem['verdict']) : null,
    summary: typeof r.summary === 'string' ? r.summary : null,
    plan: (Array.isArray(r.plan) ? r.plan : [])
      .map((a): ActionItem => {
        const o = (a ?? {}) as Record<string, unknown>;
        return {
          priority: priorities.includes(o.priority as string) ? (o.priority as ActionItem['priority']) : 'medium',
          action: str(o.action, 500),
          why: str(o.why, 400),
        };
      })
      .filter((a) => a.action),
    weaknesses: strArr(r.weaknesses, 5),
  }));
}

export async function getInterviewTranscript(id: string): Promise<InterviewMessage[] | null> {
  const { userId } = await auth();
  if (!userId || !isUuid(id)) return null;

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('transcript')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return normalizeTranscript((data as { transcript: unknown }).transcript);
}

export async function deleteInterview(id: string): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) return fail('Please sign in again.');
  if (!isUuid(id)) return fail('Invalid interview.');

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('interview_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return fail(error.message);
  return { ok: true };
}