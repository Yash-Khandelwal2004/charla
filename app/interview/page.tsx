
import './interview.css';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import InterviewSetup from '@/components/interview/InterviewSetup';
import { getUserInterviews } from '@/lib/actions/interview.actions';
import { scoreColor } from '@/lib/interview/scoring';
import type { InterviewListItem } from '@/types/interview';

export const metadata = { title: 'Mock interview | Charla' };
export const dynamic = 'force-dynamic';

function statusLabel(i: InterviewListItem): { text: string; color?: string } {
  if (i.status === 'completed' && i.score !== null) return { text: String(i.score), color: scoreColor(i.score) };
  if (i.status === 'assessment_failed') return { text: 'Retry' };
  return { text: '—' };
}

export default async function InterviewLandingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const interviews = await getUserInterviews(20);

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const usedThisMonth = interviews.filter((i) => new Date(i.created_at) >= monthStart).length;

  return (
    <main className="iv-page">
      <h1 className="iv-title">Mock interview</h1>
      <p className="iv-lede">
        Pick a job, choose how long you want to be grilled, and talk to an interviewer that will not go easy on
        you. When it ends you get a score out of 100 and an honest account of where you stand.
      </p>

      <div className="iv-section">
        <InterviewSetup usedThisMonth={usedThisMonth} />
      </div>

      {interviews.length > 0 && (
        <section className="iv-section">
          <h2 className="iv-h2">Your past interviews</h2>
          <div className="iv-card">
            <ul className="iv-list">
              {interviews.slice(0, 10).map((i) => {
                const s = statusLabel(i);
                return (
                  <li key={i.id}>
                    <Link href={`/interview/${i.id}`} className="iv-link-row iv-link">
                      <span>
                        <span className="iv-link-title" style={{ fontWeight: 600 }}>
                          {i.job_title}
                        </span>
                        <span className="iv-small iv-muted" style={{ display: 'block' }}>
                          {new Date(i.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          · {i.duration_minutes} min
                          {i.status === 'in_progress' ? ' · interrupted, no transcript saved' : ''}
                        </span>
                      </span>
                      <span className="iv-badge" style={s.color ? { color: s.color, borderColor: s.color } : undefined}>
                        {s.text}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}