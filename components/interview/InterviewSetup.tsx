
'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createInterviewSession } from '@/lib/actions/interview.actions';
import {
  CUSTOM_JD_MAX_CHARS,
  CUSTOM_JD_MIN_CHARS,
  CUSTOM_JOB_ID,
  CUSTOM_TITLE_MAX_CHARS,
  DURATIONS,
  FOCUS_OPTIONS,
  INTERVIEW_MONTHLY_LIMIT,
  JOB_POSTS,
  LEVELS,
} from '@/constants/interview';
import type { ExperienceLevel, InterviewFocus } from '@/types/interview';

export default function InterviewSetup({ usedThisMonth }: { usedThisMonth: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [jobId, setJobId] = useState<string>(JOB_POSTS[0].id);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [level, setLevel] = useState<ExperienceLevel>('fresher');
  const [focus, setFocus] = useState<InterviewFocus>('mixed');
  const [duration, setDuration] = useState<number>(15);
  const [error, setError] = useState<string | null>(null);

  const isCustom = jobId === CUSTOM_JOB_ID;
  const remaining = Math.max(0, INTERVIEW_MONTHLY_LIMIT - usedThisMonth);
  const selectedJob = useMemo(() => JOB_POSTS.find((j) => j.id === jobId), [jobId]);
  const summaryTitle = isCustom ? customTitle.trim() || 'Custom role' : selectedJob?.title;

  const customReady =
    !isCustom ||
    (customTitle.trim().length >= 2 && customDescription.trim().length >= CUSTOM_JD_MIN_CHARS);
  const canStart = customReady && remaining > 0 && !pending;

  function start() {
    setError(null);
    startTransition(async () => {
      const res = await createInterviewSession({
        jobId,
        customTitle,
        customDescription,
        level,
        focus,
        durationMinutes: duration,
      });
      if (res.ok) router.push(`/interview/${res.id}`);
      else setError(res.error);
    });
  }

  return (
    <div className="iv-setup-layout">
      <div style={{ display: 'grid', gap: '1.75rem' }}>
        {/* 1. Job post */}
        <section aria-labelledby="iv-job-label">
          <h2 id="iv-job-label" className="iv-h2">
            Which job are you interviewing for?
          </h2>
          <div className="iv-grid-jobs" role="radiogroup" aria-labelledby="iv-job-label">
            {JOB_POSTS.map((job) => (
              <button
                key={job.id}
                type="button"
                role="radio"
                aria-checked={jobId === job.id}
                className="iv-choice"
                onClick={() => setJobId(job.id)}
              >
                <div className="iv-choice-title">{job.title}</div>
                <div className="iv-choice-sub">{job.summary}</div>
              </button>
            ))}
            <button
              type="button"
              role="radio"
              aria-checked={isCustom}
              className="iv-choice"
              onClick={() => setJobId(CUSTOM_JOB_ID)}
            >
              <div className="iv-choice-title">Paste your own job post</div>
              <div className="iv-choice-sub">
                Use a real listing you plan to apply to. The interviewer works from it.
              </div>
            </button>
          </div>

          {isCustom && (
            <div className="iv-card" style={{ marginTop: '0.9rem', display: 'grid', gap: '0.9rem' }}>
              <div>
                <label className="iv-label" htmlFor="iv-custom-title">
                  Job title
                </label>
                <input
                  id="iv-custom-title"
                  className="iv-input"
                  value={customTitle}
                  maxLength={CUSTOM_TITLE_MAX_CHARS}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Software Engineer, Payments"
                />
              </div>
              <div>
                <label className="iv-label" htmlFor="iv-custom-jd">
                  Job description
                </label>
                <textarea
                  id="iv-custom-jd"
                  className="iv-textarea"
                  value={customDescription}
                  maxLength={CUSTOM_JD_MAX_CHARS}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Paste responsibilities and requirements from the listing."
                />
                <div className="iv-small iv-muted" style={{ marginTop: '0.3rem' }}>
                  {customDescription.trim().length}/{CUSTOM_JD_MAX_CHARS} characters. At least{' '}
                  {CUSTOM_JD_MIN_CHARS} needed.
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 2. Level */}
        <section aria-labelledby="iv-level-label">
          <h2 id="iv-level-label" className="iv-h2">
            How senior is the role?
          </h2>
          <div className="iv-row" role="radiogroup" aria-labelledby="iv-level-label">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={level === l.id}
                className="iv-choice iv-pill"
                onClick={() => setLevel(l.id)}
              >
                {l.label}
                <span className="iv-small iv-muted"> · {l.hint}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Focus */}
        <section aria-labelledby="iv-focus-label">
          <h2 id="iv-focus-label" className="iv-h2">
            What should it focus on?
          </h2>
          <div className="iv-grid-jobs" role="radiogroup" aria-labelledby="iv-focus-label">
            {FOCUS_OPTIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={focus === f.id}
                className="iv-choice"
                onClick={() => setFocus(f.id)}
              >
                <div className="iv-choice-title">{f.label}</div>
                <div className="iv-choice-sub">{f.hint}</div>
              </button>
            ))}
          </div>
        </section>

        {/* 4. Duration */}
        <section aria-labelledby="iv-duration-label">
          <h2 id="iv-duration-label" className="iv-h2">
            How long should it run?
          </h2>
          <div className="iv-row" role="radiogroup" aria-labelledby="iv-duration-label">
            {DURATIONS.map((d) => (
              <button
                key={d.minutes}
                type="button"
                role="radio"
                aria-checked={duration === d.minutes}
                className="iv-choice iv-pill"
                onClick={() => setDuration(d.minutes)}
              >
                {d.minutes} min
                <span className="iv-small iv-muted"> · {d.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Summary + start */}
      <aside className="iv-card iv-sticky iv-stack" aria-label="Interview summary">
        <h2 className="iv-h2" style={{ marginBottom: 0 }}>
          Your interview
        </h2>
        <p style={{ fontWeight: 600 }}>{summaryTitle}</p>
        <p className="iv-small iv-muted">
          {LEVELS.find((l) => l.id === level)?.label} · {FOCUS_OPTIONS.find((f) => f.id === focus)?.label} ·{' '}
          {duration} minutes
        </p>
        <div className="iv-notice">
          You will be asked for microphone access. The interviewer will not coach you or give hints. You get a
          scored assessment when it ends.
        </div>
        <p className="iv-small iv-muted">
          {remaining} of {INTERVIEW_MONTHLY_LIMIT} interviews left this month.
        </p>
        {error && (
          <div className="iv-error" role="alert">
            {error}
          </div>
        )}
        <button type="button" className="iv-btn iv-btn-primary" disabled={!canStart} onClick={start}>
          {pending ? 'Creating interview…' : 'Continue to interview room'}
        </button>
        {isCustom && !customReady && (
          <p className="iv-small iv-muted">Add a job title and a longer job description to continue.</p>
        )}
      </aside>
    </div>
  );
}