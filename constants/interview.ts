
import type { ExperienceLevel, InterviewFocus, JobPost } from '@/types/interview';

export const CUSTOM_JOB_ID = 'custom';

export const JOB_POSTS: JobPost[] = [
  {
    id: 'backend-sde',
    title: 'Backend Developer (SDE-1)',
    category: 'Engineering',
    summary:
      'Build and maintain REST services, own database schemas, and keep systems reliable under load.',
    skills: [
      'Data structures and algorithms',
      'REST API design',
      'SQL and database design',
      'Caching and message queues',
      'Concurrency',
      'Authentication and security basics',
      'System design basics',
    ],
  },
  {
    id: 'frontend-react',
    title: 'Frontend Developer (React)',
    category: 'Engineering',
    summary:
      'Build fast, accessible interfaces in React and TypeScript and integrate them with backend APIs.',
    skills: [
      'JavaScript and TypeScript',
      'React rendering and state management',
      'Browser performance',
      'Accessibility',
      'CSS layout',
      'Testing',
      'API integration',
    ],
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Developer',
    category: 'Engineering',
    summary:
      'Own features end to end: Next.js or React front end, Node.js APIs, Postgres, auth and deployment.',
    skills: [
      'Next.js and React',
      'Node.js APIs',
      'SQL and Postgres',
      'Authentication',
      'Deployment and CI',
      'Data structures',
      'System design basics',
    ],
  },
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    category: 'Data and AI',
    summary:
      'Train, evaluate and ship ML models, and build the data pipelines and services around them.',
    skills: [
      'ML fundamentals and model evaluation',
      'Python and data libraries',
      'Feature engineering',
      'Overfitting and regularisation',
      'Deployment and monitoring',
      'LLM and prompt basics',
      'SQL',
    ],
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    category: 'Data and AI',
    summary:
      'Turn raw data into decisions using SQL, spreadsheets, dashboards and clear written analysis.',
    skills: [
      'SQL queries and joins',
      'Statistics and A/B testing',
      'Data cleaning',
      'Dashboards and visualisation',
      'Business metrics',
      'Communicating insights',
    ],
  },
  {
    id: 'devops',
    title: 'DevOps / Cloud Engineer',
    category: 'Infrastructure',
    summary:
      'Automate builds and deployments, manage cloud infrastructure, and own monitoring and incident response.',
    skills: [
      'Linux and networking',
      'CI/CD pipelines',
      'Docker and Kubernetes',
      'Infrastructure as code',
      'Monitoring and logging',
      'Cloud fundamentals',
      'Incident response',
    ],
  },
  {
    id: 'android',
    title: 'Android Developer',
    category: 'Engineering',
    summary:
      'Build and ship native Android apps in Kotlin with clean architecture and smooth performance.',
    skills: [
      'Kotlin',
      'Activity and fragment lifecycle',
      'Jetpack Compose',
      'Architecture patterns (MVVM)',
      'Networking and local storage',
      'Performance and memory',
    ],
  },
  {
    id: 'sdet',
    title: 'QA / SDET',
    category: 'Quality',
    summary:
      'Design test strategy, write automated tests, and catch defects before they reach users.',
    skills: [
      'Test design and edge cases',
      'Automation frameworks',
      'API testing',
      'CI integration',
      'Debugging and root cause analysis',
      'Performance testing basics',
    ],
  },
  {
    id: 'apm',
    title: 'Associate Product Manager',
    category: 'Product',
    summary:
      'Define what to build and why: talk to users, prioritise, write specs and work with engineers.',
    skills: [
      'Product sense',
      'Prioritisation frameworks',
      'Metrics and experimentation',
      'User research',
      'Execution and stakeholder communication',
    ],
  },
];

export function getJobPost(id: string): JobPost | undefined {
  return JOB_POSTS.find((j) => j.id === id);
}

export const DURATIONS: { minutes: number; label: string }[] = [
  { minutes: 5, label: 'Quick screen' },
  { minutes: 10, label: 'Phone screen' },
  { minutes: 15, label: 'Short round' },
  { minutes: 20, label: 'Full round' },
  { minutes: 30, label: 'Deep round' },
];

export const LEVELS: { id: ExperienceLevel; label: string; hint: string }[] = [
  { id: 'fresher', label: 'Fresher', hint: '0-1 years, campus hiring' },
  { id: 'junior', label: 'Junior', hint: '1-3 years' },
  { id: 'mid', label: 'Mid-level', hint: '3-5 years' },
];

export const FOCUS_OPTIONS: { id: InterviewFocus; label: string; hint: string }[] = [
  { id: 'technical', label: 'Technical', hint: 'Concepts, problem solving, design trade-offs' },
  { id: 'behavioral', label: 'Behavioural', hint: 'Ownership, teamwork, failure, motivation' },
  { id: 'mixed', label: 'Mixed', hint: 'Mostly technical with a project deep-dive' },
];

// Every started interview costs real VAPI credits, so cap it per user per calendar month.
export const INTERVIEW_MONTHLY_LIMIT = 5;

export const CUSTOM_JD_MIN_CHARS = 80;
export const CUSTOM_JD_MAX_CHARS = 4000;
export const CUSTOM_TITLE_MAX_CHARS = 80;