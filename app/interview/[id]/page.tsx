
import '../interview.css';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import InterviewRoom from '@/components/interview/InterviewRoom';
import InterviewReport from '@/components/interview/InterviewReport';
import RetryAssessmentButton from '@/components/interview/RetryAssessmentButton';
import { getInterviewSession } from '@/lib/actions/interview.actions';
import { FOCUS_OPTIONS, LEVELS, getJobPost } from '@/constants/interview';
import {
  buildFirstMessage,
  buildInterviewerPrompt,
  type InterviewContext,
} from '@/lib/interview/prompts';
import { configureInterviewer } from '@/lib/interview/vapi-config';
import { formatClock } from '@/lib/interview/scoring';

// The assessment runs inside a server action triggered from this page, so this is its time budget.
// Vercel Hobby may cap this lower than 60s depending on your plan.
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export const metadata = { title: 'Interview | Charla' };

export default async function InterviewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const session = await getInterviewSession(id);
  if (!session) notFound();

  // 1. Finished with a report
  if (session.status === 'completed' && session.assessment) {
    return <InterviewReport session={{ ...session, assessment: session.assessment }} />;
  }

  // 2. Transcript saved but the assessment failed: offer a retry
  if (session.status === 'assessment_failed') {
    return (
      <main className="iv-page" style={{ maxWidth: 720 }}>
        <h1 className="iv-title">Your assessment is not ready</h1>
        <p className="iv-lede">
          The interview for {session.job_title} was saved
          {session.elapsed_seconds !== null ? ` (${formatClock(session.elapsed_seconds)} recorded)` : ''}, but the
          scoring step failed. Your transcript is safe. Retry to generate the report.
        </p>
        <div className="iv-section">
          <RetryAssessmentButton sessionId={session.id} />
        </div>
        {session.transcript && session.transcript.length > 0 && (
          <details className="iv-card iv-details iv-section">
            <summary>View saved transcript</summary>
            <div className="iv-transcript">
              {session.transcript.map((t, i) => (
                <p key={i}>
                  <span className="who">{t.role === 'assistant' ? 'Alex' : 'You'}:</span> {t.content}
                </p>
              ))}
            </div>
          </details>
        )}
      </main>
    );
  }

  // 3. Started but never finished (tab closed, navigated away): it cannot be resumed
  if (session.started_at) {
    return (
      <main className="iv-page" style={{ maxWidth: 720 }}>
        <h1 className="iv-title">This interview was interrupted</h1>
        <p className="iv-lede">
          The call for {session.job_title} started but was never submitted, so there is no transcript to
          assess. Interviews cannot be resumed. It still counts toward this month&apos;s limit.
        </p>
        <div className="iv-section">
          <Link href="/interview" className="iv-btn iv-btn-primary">
            Start a new interview
          </Link>
        </div>
      </main>
    );
  }

  // 4. Fresh session: show the room
  const ctx: InterviewContext = {
    jobTitle: session.job_title,
    jobDescription: session.job_description,
    skills: getJobPost(session.job_id)?.skills ?? [],
    level: session.experience_level,
    focus: session.focus,
    durationMinutes: session.duration_minutes,
  };

  const assistantConfig = configureInterviewer({
    systemPrompt: buildInterviewerPrompt(ctx),
    firstMessage: buildFirstMessage(session.job_title, session.duration_minutes),
    durationMinutes: session.duration_minutes,
  });

  return (
    <main className="iv-page">
      <InterviewRoom
        sessionId={session.id}
        jobTitle={session.job_title}
        levelLabel={LEVELS.find((l) => l.id === session.experience_level)?.label ?? session.experience_level}
        focusLabel={FOCUS_OPTIONS.find((f) => f.id === session.focus)?.label ?? session.focus}
        durationMinutes={session.duration_minutes}
        assistantConfig={assistantConfig}
      />
    </main>
  );
}