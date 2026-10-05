
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateAssistantDTO } from '@vapi-ai/web/dist/api';
import { vapi } from '@/lib/vapi.sdk';
import {
  finalizeInterview,
  markInterviewStarted,
  releaseInterviewStart,
} from '@/lib/actions/interview.actions';
import { buildTimeWarningMessage } from '@/lib/interview/prompts';
import { formatClock } from '@/lib/interview/scoring';
import type { InterviewMessage } from '@/types/interview';

type Phase = 'idle' | 'connecting' | 'live' | 'assessing';

interface Props {
  sessionId: string;
  jobTitle: string;
  levelLabel: string;
  focusLabel: string;
  durationMinutes: number;
  assistantConfig: CreateAssistantDTO;
}

const CONNECT_TIMEOUT_MS = 25_000;
const CLOSING_LINE = "That's our time. Thank you for speaking with me today. We'll stop here.";

export default function InterviewRoom({
  sessionId,
  jobTitle,
  levelLabel,
  focusLabel,
  durationMinutes,
  assistantConfig,
}: Props) {
  const router = useRouter();
  const totalSeconds = durationMinutes * 60;

  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [captions, setCaptions] = useState<InterviewMessage[]>([]);
  const [confirmingEnd, setConfirmingEnd] = useState(false);

  // Refs hold values that event handlers must read fresh (avoids stale closures).
  const messagesRef = useRef<InterviewMessage[]>([]);
  const startMsRef = useRef<number | null>(null);
  const connectingRef = useRef(false);
  const callActiveRef = useRef(false);
  const finalizedRef = useRef(false); // guards against saving the same interview twice
  const warnedRef = useRef(false);
  const closingRef = useRef(false);
  const failsafeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captionsEndRef = useRef<HTMLDivElement | null>(null);

  const clearTimers = useCallback(() => {
    if (failsafeRef.current) clearTimeout(failsafeRef.current);
    if (connectTimerRef.current) clearTimeout(connectTimerRef.current);
    failsafeRef.current = null;
    connectTimerRef.current = null;
  }, []);

  /** Save transcript + generate the assessment, then reload the page into the report. */
  const finalize = useCallback(async () => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    callActiveRef.current = false;
    clearTimers();
    setAssistantSpeaking(false);
    setPhase('assessing');
    setError(null);

    const elapsedSec = startMsRef.current
      ? Math.round((Date.now() - startMsRef.current) / 1000)
      : 0;
    const res = await finalizeInterview(sessionId, messagesRef.current, elapsedSec);

    if (res.ok || res.saved) {
      // Transcript is stored server-side (the report page handles a failed assessment with a retry button).
      router.refresh();
      return;
    }
    // Nothing was saved (network or auth problem). Keep the transcript in memory and let the user retry.
    finalizedRef.current = false;
    setError(res.error);
  }, [sessionId, router, clearTimers]);

  /** The call never connected: hand the interview back so it does not count against the monthly limit. */
  const failToConnect = useCallback(
    async (message: string) => {
      if (!connectingRef.current) return;
      connectingRef.current = false;
      clearTimers();
      try {
        await vapi.stop();
      } catch {
        /* nothing to stop */
      }
      await releaseInterviewStart(sessionId);
      setError(message);
      setPhase('idle');
    },
    [sessionId, clearTimers],
  );

  // VAPI event wiring (once).
  useEffect(() => {
    const onCallStart = () => {
      connectingRef.current = false;
      callActiveRef.current = true;
      startMsRef.current = Date.now();
      clearTimers();
      setPhase('live');
    };
    const onCallEnd = () => {
      if (connectingRef.current) return; // ended before it ever started: handled by failToConnect
      void finalize();
    };
    const onSpeechStart = () => setAssistantSpeaking(true);
    const onSpeechEnd = () => setAssistantSpeaking(false);
    const onMessage = (m: unknown) => {
      const msg = m as { type?: string; transcriptType?: string; role?: string; transcript?: string };
      if (msg.type !== 'transcript' || msg.transcriptType !== 'final') return;
      if (msg.role !== 'assistant' && msg.role !== 'user') return;
      const text = msg.transcript?.trim();
      if (!text) return;

      const t = startMsRef.current ? Math.round((Date.now() - startMsRef.current) / 1000) : 0;
      messagesRef.current = [...messagesRef.current, { role: msg.role, content: text, t }];
      setCaptions(messagesRef.current.slice(-6));
    };
    const onError = (e: unknown) => {
      console.error('[interview] vapi error', e);
      if (connectingRef.current) {
        void failToConnect(
          'Could not connect. Allow microphone access in your browser, check your connection and try again.',
        );
      }
      // Errors during a live call are usually followed by call-end, which saves what we have.
    };

    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('message', onMessage);
    vapi.on('error', onError);

    return () => {
      vapi.removeListener('call-start', onCallStart);
      vapi.removeListener('call-end', onCallEnd);
      vapi.removeListener('speech-start', onSpeechStart);
      vapi.removeListener('speech-end', onSpeechEnd);
      vapi.removeListener('message', onMessage);
      vapi.removeListener('error', onError);
      clearTimers();
      if (callActiveRef.current) {
        // Navigating away mid-call: stop the (billable) call. The interview stays marked as interrupted.
        callActiveRef.current = false;
        void vapi.stop();
      }
    };
  }, [finalize, failToConnect, clearTimers]);

  // Countdown, 90-second warning to the interviewer, and hard close at the chosen duration.
  useEffect(() => {
    if (phase !== 'live') return;
    const id = setInterval(() => {
      if (startMsRef.current === null) return;
      const sec = (Date.now() - startMsRef.current) / 1000;
      setElapsed(sec);

      if (!warnedRef.current && totalSeconds - sec <= 90) {
        warnedRef.current = true;
        vapi.send({
          type: 'add-message',
          message: { role: 'system', content: buildTimeWarningMessage() },
        });
      }
      if (!closingRef.current && sec >= totalSeconds) {
        closingRef.current = true;
        vapi.say(CLOSING_LINE, true); // speaks, then ends the call, which triggers call-end
        failsafeRef.current = setTimeout(() => void vapi.stop(), 15_000);
      }
    }, 500);
    return () => clearInterval(id);
  }, [phase, totalSeconds]);

  // Warn before closing the tab mid-interview.
  useEffect(() => {
    if (phase !== 'live') return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [phase]);

  useEffect(() => {
    captionsEndRef.current?.scrollIntoView({ block: 'end' });
  }, [captions, showCaptions]);

  async function startInterview() {
    setError(null);
    setBlocked(false);
    setPhase('connecting');

    const res = await markInterviewStarted(sessionId);
    if (!res.ok) {
      setError(res.error);
      setBlocked(true);
      setPhase('idle');
      return;
    }

    connectingRef.current = true;
    messagesRef.current = [];
    setCaptions([]);
    warnedRef.current = false;
    closingRef.current = false;
    finalizedRef.current = false;

    connectTimerRef.current = setTimeout(() => {
      void failToConnect('Connecting took too long. Check your connection and try again.');
    }, CONNECT_TIMEOUT_MS);

    try {
      await vapi.start(assistantConfig);
    } catch (e) {
      console.error('[interview] vapi.start failed', e);
      await failToConnect(
        'Could not start the call. Allow microphone access in your browser and try again.',
      );
    }
  }

  function toggleMute() {
    const next = !muted;
    vapi.setMuted(next);
    setMuted(next);
  }

  function endInterview() {
    if (!confirmingEnd) {
      setConfirmingEnd(true);
      setTimeout(() => setConfirmingEnd(false), 4000);
      return;
    }
    void vapi.stop();
    // If call-end never fires, save anyway.
    failsafeRef.current = setTimeout(() => void finalize(), 4000);
  }

  const remaining = Math.max(0, totalSeconds - elapsed);
  const progress = Math.min(100, (elapsed / totalSeconds) * 100);

  /* ------------------------------ views ------------------------------ */

  if (phase === 'assessing') {
    return (
      <div className="iv-room" role="status" aria-live="polite">
        <h2 className="iv-h2">{error ? 'Your interview was not saved yet' : 'Assessing your interview…'}</h2>
        {error ? (
          <>
            <div className="iv-error" role="alert" style={{ maxWidth: 520 }}>
              {error}
            </div>
            <button type="button" className="iv-btn iv-btn-primary" onClick={() => void finalize()}>
              Try saving again
            </button>
          </>
        ) : (
          <p className="iv-muted" style={{ maxWidth: 480 }}>
            The interviewer is reading back through your answers. This takes up to a minute. Keep this tab
            open.
          </p>
        )}
      </div>
    );
  }

  if (phase === 'live') {
    return (
      <div className="iv-room">
        <div className="iv-small iv-muted">
          {jobTitle} · {levelLabel} · {focusLabel}
        </div>

        <div className="iv-orb-wrap" data-speaking={assistantSpeaking}>
          <span className="iv-orb-ring" aria-hidden="true" />
          <div className="iv-orb" aria-hidden="true">
            A
          </div>
        </div>
        <p aria-live="polite" style={{ fontWeight: 600 }}>
          {muted ? 'Your microphone is muted' : assistantSpeaking ? 'Alex is speaking' : 'Alex is listening'}
        </p>

        <div>
          <div className="iv-clock" data-low={remaining <= 60} aria-label="Time remaining">
            {formatClock(remaining)}
          </div>
          <div className="iv-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} style={{ margin: '0.5rem auto 0' }}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="iv-controls">
          <button type="button" className="iv-btn iv-btn-ghost" onClick={toggleMute} aria-pressed={muted}>
            {muted ? 'Unmute' : 'Mute'}
          </button>
          <button
            type="button"
            className="iv-btn iv-btn-ghost"
            onClick={() => setShowCaptions((v) => !v)}
            aria-pressed={showCaptions}
          >
            {showCaptions ? 'Hide captions' : 'Show captions'}
          </button>
          <button
            type="button"
            className={confirmingEnd ? 'iv-btn iv-btn-danger' : 'iv-btn iv-btn-ghost'}
            onClick={endInterview}
          >
            {confirmingEnd ? 'Tap again to end and get scored' : 'End interview'}
          </button>
        </div>

        {showCaptions && (
          <div className="iv-captions" aria-label="Live captions">
            {captions.length === 0 ? (
              <span className="iv-muted">Captions appear here as you speak.</span>
            ) : (
              captions.map((c, i) => (
                <p key={`${c.t}-${i}`}>
                  <span className="who">{c.role === 'assistant' ? 'Alex' : 'You'}</span>
                  {c.content}
                </p>
              ))
            )}
            <div ref={captionsEndRef} />
          </div>
        )}
      </div>
    );
  }

  // idle + connecting
  return (
    <div className="iv-card iv-stack" style={{ maxWidth: 640, margin: '0 auto' }}>
      <h2 className="iv-h2" style={{ marginBottom: 0 }}>
        {jobTitle}
      </h2>
      <p className="iv-muted">
        {levelLabel} · {focusLabel} · {durationMinutes} minutes
      </p>
      <ul className="iv-bullets">
        <li>Sit somewhere quiet and answer out loud, the way you would in a real interview.</li>
        <li>Alex will not give hints or praise. Silence and &quot;I don&apos;t know&quot; are scored.</li>
        <li>The interview cannot be paused or restarted. Leaving mid-way forfeits it.</li>
        <li>The interviewer wraps up when the timer runs out. You can also end early, but ending before the
          halfway mark caps your score.</li>
      </ul>
      {error && (
        <div className="iv-error" role="alert">
          {error}
        </div>
      )}
      {blocked ? (
        <Link href="/interview" className="iv-btn iv-btn-ghost">
          Back to interviews
        </Link>
      ) : (
        <button
          type="button"
          className="iv-btn iv-btn-primary"
          onClick={() => void startInterview()}
          disabled={phase === 'connecting'}
        >
          {phase === 'connecting' ? 'Connecting to your interviewer…' : 'Start interview'}
        </button>
      )}
    </div>
  );
}