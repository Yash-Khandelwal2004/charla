
import Link from 'next/link';
import {
  DIMENSION_KEYS,
  DIMENSION_LABELS,
  DIMENSION_WEIGHTS,
  formatClock,
  scoreColor,
} from '@/lib/interview/scoring';
import { FOCUS_OPTIONS, LEVELS } from '@/constants/interview';
import type { InterviewAssessment, InterviewSessionRow } from '@/types/interview';

type CompletedSession = InterviewSessionRow & { assessment: InterviewAssessment };

const RING_RADIUS = 88;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function InterviewReport({ session }: { session: CompletedSession }) {
  const a = session.assessment;
  const color = scoreColor(a.overallScore);
  const m = a.metrics;
  const level = LEVELS.find((l) => l.id === session.experience_level)?.label;
  const focus = FOCUS_OPTIONS.find((f) => f.id === session.focus)?.label;
  const date = new Date(session.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="iv-page">
      <p className="iv-small iv-muted">
        {session.job_title} · {level} · {focus} · {date}
      </p>
      <h1 className="iv-title" style={{ marginTop: '0.25rem' }}>
        Interview assessment
      </h1>

      {/* Hero: the score is the one loud element on the page */}
      <section className="iv-card iv-hero iv-section" aria-label="Overall score">
        <div className="iv-ring">
          <svg width="200" height="200" viewBox="0 0 200 200" role="img" aria-label={`Score ${a.overallScore} out of 100`}>
            <circle cx="100" cy="100" r={RING_RADIUS} fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="12" />
            <circle
              cx="100"
              cy="100"
              r={RING_RADIUS}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(RING_CIRCUMFERENCE * a.overallScore) / 100} ${RING_CIRCUMFERENCE}`}
            />
          </svg>
          <div className="iv-ring-center">
            <div>
              <div className="iv-score" style={{ color }}>
                {a.overallScore}
              </div>
              <div className="iv-score-of">out of 100</div>
            </div>
          </div>
        </div>

        <div className="iv-stack">
          <div className="iv-verdict" style={{ color }}>
            {a.verdict}
          </div>
          <p style={{ lineHeight: 1.6 }}>{a.standing}</p>
          {a.capReason && <div className="iv-notice">{a.capReason} Uncapped, the score would have been {a.rawScore}.</div>}
          <p className="iv-small iv-muted">
            85+ Strong hire · 70+ Hire · 55+ Borderline · 35+ No hire · under 35 Not ready
          </p>
        </div>
      </section>

      {/* Blunt summary */}
      <section className="iv-section">
        <h2 className="iv-h2">The blunt version</h2>
        <p style={{ lineHeight: 1.7, maxWidth: '68ch' }}>{a.brutalSummary}</p>
      </section>

      {a.redFlags.length > 0 && (
        <section className="iv-section">
          <h2 className="iv-h2">Red flags</h2>
          <div className="iv-error">
            <ul className="iv-bullets">
              {a.redFlags.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Dimensions */}
      <section className="iv-section">
        <h2 className="iv-h2">Score breakdown</h2>
        <div className="iv-card">
          {DIMENSION_KEYS.map((key) => {
            const d = a.dimensions[key];
            return (
              <div className="iv-dim" key={key}>
                <div className="iv-dim-head">
                  <span>
                    {DIMENSION_LABELS[key]}{' '}
                    <span className="iv-small iv-muted" style={{ fontWeight: 400 }}>
                      (weight {Math.round(DIMENSION_WEIGHTS[key] * 100)}%)
                    </span>
                  </span>
                  <span style={{ color: scoreColor(d.score) }}>{d.score}</span>
                </div>
                <div className="iv-bar" aria-hidden="true">
                  <span style={{ width: `${d.score}%`, background: scoreColor(d.score) }} />
                </div>
                <p className="iv-small iv-muted" style={{ lineHeight: 1.5 }}>
                  {d.evidence}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Strengths and weaknesses */}
      <section className="iv-section iv-two-col">
        <div className="iv-card">
          <h2 className="iv-h2">What worked</h2>
          {a.strengths.length ? (
            <ul className="iv-bullets">
              {a.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="iv-muted">Nothing stood out enough to list.</p>
          )}
        </div>
        <div className="iv-card">
          <h2 className="iv-h2">What cost you</h2>
          {a.weaknesses.length ? (
            <ul className="iv-bullets">
              {a.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          ) : (
            <p className="iv-muted">No major weaknesses recorded.</p>
          )}
        </div>
      </section>

      {/* Question by question */}
      {a.questionFeedback.length > 0 && (
        <section className="iv-section">
          <h2 className="iv-h2">Question by question</h2>
          <div className="iv-card">
            {a.questionFeedback.map((q, i) => (
              <article className="iv-q" key={i}>
                <div className="iv-q-head">
                  <div className="iv-q-title">{q.question}</div>
                  <span className="iv-rate" data-r={q.rating}>
                    {q.rating}
                  </span>
                </div>
                <dl>
                  <div>
                    <dt>What you said</dt>
                    <dd>{q.answerSummary}</dd>
                  </div>
                  <div>
                    <dt>What was wrong or missing</dt>
                    <dd>{q.critique}</dd>
                  </div>
                  <div>
                    <dt>What a strong answer covers</dt>
                    <dd>{q.betterAnswer}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Action plan */}
      {a.actionPlan.length > 0 && (
        <section className="iv-section">
          <h2 className="iv-h2">Fix these first</h2>
          <div className="iv-card">
            <ul className="iv-bullets">
              {a.actionPlan.map((p, i) => (
                <li key={i}>
                  <span className="iv-priority" style={{ color: p.priority === 'high' ? '#ef4444' : undefined }}>
                    {p.priority === 'high' ? 'High priority.' : p.priority === 'medium' ? 'Medium.' : 'Low.'}
                  </span>
                  {p.action} <span className="iv-muted">{p.why}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Measured speaking data */}
      <section className="iv-section">
        <h2 className="iv-h2">How you spoke</h2>
        <div className="iv-metrics">
          <Metric value={`${formatClock(m.elapsedSeconds)} / ${formatClock(m.plannedSeconds)}`} label="time used" />
          <Metric value={String(m.candidateTurns)} label="answers given" />
          <Metric value={String(m.avgWordsPerAnswer)} label="average words per answer" />
          <Metric value={String(m.shortAnswers)} label="answers under 15 words" />
          <Metric value={`${Math.round(m.talkRatio * 100)}%`} label="of all words were yours" />
          <Metric value={String(m.hedgeCount)} label="hedges (maybe, I guess)" />
          <Metric value={String(m.fillerCount)} label="verbal tics (basically, you know)" />
          <Metric value={String(m.dontKnowCount)} label={'"not sure" statements'} />
        </div>
        <p className="iv-small iv-muted" style={{ marginTop: '0.75rem', maxWidth: '68ch', lineHeight: 1.5 }}>
          Speech-to-text usually drops &quot;um&quot; and &quot;uh&quot;, so tic counts are a floor, not a total.
        </p>
      </section>

      <section className="iv-section">
        <h2 className="iv-h2">How this was scored</h2>
        <p className="iv-small iv-muted" style={{ maxWidth: '68ch', lineHeight: 1.6 }}>
          The five dimensions above are scored from your transcript against the bar for this role and level. The
          overall number is a weighted average calculated by code, then capped if you said too little or ended
          early. It is not a percentile: there is no peer data behind it, so it tells you how far you are from a
          hireable answer, not how you rank against other students. Speech recognition can garble technical terms,
          so treat one-off wording complaints with suspicion and focus on the patterns.
        </p>
      </section>

      {session.transcript && session.transcript.length > 0 && (
        <section className="iv-section">
          <details className="iv-card iv-details">
            <summary>Full transcript</summary>
            <div className="iv-transcript">
              {session.transcript.map((t, i) => (
                <p key={i}>
                  <span className="who">
                    [{formatClock(t.t)}] {t.role === 'assistant' ? 'Alex' : 'You'}:
                  </span>{' '}
                  {t.content}
                </p>
              ))}
            </div>
          </details>
        </section>
      )}

      <div className="iv-section">
        <Link href="/interview" className="iv-btn iv-btn-primary">
          Start another interview
        </Link>
      </div>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="iv-metric">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}