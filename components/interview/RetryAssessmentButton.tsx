
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { retryInterviewAssessment } from '@/lib/actions/interview.actions';

export default function RetryAssessmentButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function retry() {
    setError(null);
    startTransition(async () => {
      const res = await retryInterviewAssessment(sessionId);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  return (
    <div className="iv-stack">
      {error && (
        <div className="iv-error" role="alert">
          {error}
        </div>
      )}
      <button type="button" className="iv-btn iv-btn-primary" onClick={retry} disabled={pending}>
        {pending ? 'Assessing… this can take up to a minute' : 'Retry assessment'}
      </button>
    </div>
  );
}