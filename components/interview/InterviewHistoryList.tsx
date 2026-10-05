'use client';

// The stylesheet is loaded globally by the interview route; this import is
// retained for bundlers that resolve route styles from client components.
// @ts-expect-error The project does not provide declarations for CSS side-effect imports.
import '@/app/interview/interview.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  deleteInterview,
  getInterviewHistory,
  getInterviewTranscript,
} from '@/lib/actions/interview.actions';
import { FOCUS_OPTIONS, LEVELS } from '@/constants/interview';
import { formatClock, scoreColor } from '@/lib/interview/scoring';
import type { InterviewHistoryItem, InterviewMessage } from '@/types/interview';

const MAX_RECS_SHOWN = 3;

/**
 * Drop-in panel: renders its own loading / empty / error states and fetches its own data,
 * so the History page only needs to render <InterviewHistoryList /> inside the new tab.
 */
export default function InterviewHistoryList() {
  const [items, setItems] = useState<InterviewHistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getInterviewHistory()
      .then((rows) => {
        if (cancelled) return;
        // Same belt-and-suspenders de-dupe by id used elsewhere on the History page.
        setItems(Array.from(new Map(rows.map((r) => [r.id, r])).values()));
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your interviews. Refresh to try again.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="iv-scope">
      {error && (
        <div className="iv-error" role="alert">
          {error}
        </div>
      )}

      {!error && items === null && <p className="iv-muted">Loading your interviews…</p>}

      {items !== null && items.length === 0 && (
        <div className="iv-card">
          <p style={{ fontWeight: 600 }}>No interviews yet</p>
          <p className="iv-muted" style={{ margin: '0.35rem 0 1rem' }}>
            Your scored interviews, transcripts and recommendations will be saved here.
          </p>
          <Link href="/interview" className="iv-btn iv-btn-primary iv-btn-sm">
            Start a mock interview
          </Link>
        </div>
      )}

      {items?.map((item) => (
        <div className="iv-hist-item" key={item.id}>
          <InterviewHistoryCard
            item={item}
            onDeleted={(id) => setItems((prev) => (prev ? prev.filter((i) => i.id !== id) : prev))}
          />
        </div>
      ))}
    </div>
  );
}

export function InterviewHistoryCard({
  item,
  onDeleted,
}: {
  item: InterviewHistoryItem;
  onDeleted: (id: string) => void;
}) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState<InterviewMessage[] | null>(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const failed = item.status === 'assessment_failed' || item.score === null;
  const color = item.score !== null ? scoreColor(item.score) : undefined;
  const level = LEVELS.find((l) => l.id === item.experience_level)?.label;
  const focus = FOCUS_OPTIONS.find((f) => f.id === item.focus)?.label;
  const date = new Date(item.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  async function toggleTranscript() {
    const next = !showTranscript;
    setShowTranscript(next);
    if (next && transcript === null && !loadingTranscript) {
      setLoadingTranscript(true);
      setTranscriptError(null);
      const t = await getInterviewTranscript(item.id);
      setLoadingTranscript(false);
      if (t === null) setTranscriptError('Could not load the transcript.');
      else setTranscript(t);
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      setTimeout(() => setConfirmingDelete(false), 4000);
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    const res = await deleteInterview(item.id);
    setDeleting(false);
    if (res.ok) onDeleted(item.id);
    else setDeleteError(res.error);
  }

  const recs = item.plan.slice(0, MAX_RECS_SHOWN);
  const hiddenRecs = item.plan.length - recs.length;

  return (
    <article className="iv-card">
      <div className="iv-hist-head">
        <div>
          <h3 style={{ fontWeight: 650, fontSize: '1.05rem' }}>{item.job_title}</h3>
          <p className="iv-small iv-muted" style={{ marginTop: '0.2rem' }}>
            {date} · {level} · {focus} · {item.duration_minutes} min planned
            {item.elapsed_seconds !== null ? ` · ${formatClock(item.elapsed_seconds)} used` : ''}
          </p>
        </div>
        <div className="iv-hist-score">
          {failed ? (
            <span className="iv-muted">Not scored</span>
          ) : (
            <>
              <b style={{ color }}>{item.score}</b>
              <span style={{ color }}>{item.verdict ?? ''}</span>
            </>
          )}
        </div>
      </div>

      {failed ? (
        <div className="iv-notice" style={{ marginTop: '0.8rem' }}>
          The assessment did not finish, but your transcript is saved. Open the report page to retry it.
        </div>
      ) : (
        <>
          {item.summary && <p className="iv-hist-summary">{item.summary}</p>}

          {recs.length > 0 && (
            <div style={{ marginTop: '0.8rem' }}>
              <p className="iv-label" style={{ marginBottom: '0.3rem' }}>
                Recommendations
              </p>
              <ul className="iv-bullets iv-small">
                {recs.map((r, i) => (
                  <li key={i}>
                    <span className="iv-priority" style={{ color: r.priority === 'high' ? '#ef4444' : undefined }}>
                      {r.priority === 'high' ? 'High priority.' : r.priority === 'medium' ? 'Medium.' : 'Low.'}
                    </span>
                    {r.action}
                  </li>
                ))}
              </ul>
              {hiddenRecs > 0 && (
                <p className="iv-small iv-muted" style={{ marginTop: '0.35rem' }}>
                  +{hiddenRecs} more in the full report
                </p>
              )}
            </div>
          )}
        </>
      )}

      <div className="iv-hist-actions">
        <Link href={`/interview/${item.id}`} className="iv-btn iv-btn-primary iv-btn-sm">
          {failed ? 'Open and retry' : 'Full report'}
        </Link>
        <button
          type="button"
          className="iv-btn iv-btn-ghost iv-btn-sm"
          onClick={() => void toggleTranscript()}
          aria-expanded={showTranscript}
        >
          {showTranscript ? 'Hide transcript' : 'View transcript'}
        </button>
        <button
          type="button"
          className={confirmingDelete ? 'iv-btn iv-btn-danger iv-btn-sm' : 'iv-btn iv-btn-ghost iv-btn-sm'}
          onClick={() => void handleDelete()}
          disabled={deleting}
        >
          {deleting ? 'Deleting…' : confirmingDelete ? 'Tap again to delete' : 'Delete'}
        </button>
      </div>

      {deleteError && (
        <div className="iv-error" role="alert" style={{ marginTop: '0.7rem' }}>
          {deleteError}
        </div>
      )}

      {showTranscript && (
        <div className="iv-transcript" style={{ marginTop: '0.9rem' }}>
          {loadingTranscript && <p className="iv-muted iv-small">Loading transcript…</p>}
          {transcriptError && (
            <div className="iv-error" role="alert">
              {transcriptError}
            </div>
          )}
          {transcript && transcript.length === 0 && <p className="iv-muted iv-small">No transcript was recorded.</p>}
          {transcript?.map((t, i) => (
            <p key={i}>
              <span className="who">
                [{formatClock(t.t)}] {t.role === 'assistant' ? 'Alex' : 'You'}:
              </span>{' '}
              {t.content}
            </p>
          ))}
        </div>
      )}
    </article>
  );
}