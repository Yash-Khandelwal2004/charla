"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// ── Save tool usage to DB ─────────────────────────────
export const saveToolUsage = async ({
  tool_name,
  input,
  output,
}: SaveToolUsage) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("tool_usage")
    .insert({
      user_id: userId,
      tool_name,
      input,
      output,
    })
    .select();

  if (error) throw new Error(error.message);

  revalidatePath("/my-journey");
  return data[0];
};

// ── Get all tool usage for current user ───────────────
export const getUserToolUsage = async (limit = 20) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("tool_usage")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return data as ToolUsage[];
};

// ── Get tool usage filtered by tool name ─────────────
export const getToolUsageByName = async (tool_name: ToolName, limit = 10) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("tool_usage")
    .select()
    .eq("user_id", userId)
    .eq("tool_name", tool_name)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return data as ToolUsage[];
};

// ── Get total tool usage count for user ───────────────
export const getUserToolCount = async () => {
  const { userId } = await auth();
  if (!userId) return 0;

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("tool_usage")
    .select("id")
    .eq("user_id", userId);

  if (error) return 0;

  return data?.length ?? 0;
};

// ── AI call helper (used by every tool page) ──────────
// Replace the existing callAI function in lib/actions/tools.actions.ts with this:

export const callAI = async (prompt: string): Promise<string> => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are Charla, a helpful AI assistant specializing in career development, academics, and productivity. Be concise, practical, and actionable in your responses. Format output with clear sections using markdown.\n\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
    },
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Gemini API call failed");
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

// ── ATS Scanner ───────────────────────────────────────
export const runATSScanner = async (
  input: ATSScannerInput,
): Promise<ToolResult> => {
  try {
    const prompt = `
You are an ATS (Applicant Tracking System) expert. Analyze the resume against the job description below.

RESUME:
${input.resume}

JOB DESCRIPTION:
${input.job_description}

Provide:
1. **ATS Match Score**: X/100
2. **Missing Keywords**: List keywords from the JD not found in the resume
3. **Matched Keywords**: List keywords present in both
4. **Section Feedback**: Evaluate each resume section (Summary, Experience, Skills, Education)
5. **Top 3 Improvements**: Most impactful changes to make
6. **Overall Assessment**: 2-3 sentence summary

Be specific and actionable.
    `.trim();

    const output = await callAI(prompt);
    await saveToolUsage({ tool_name: "ats-scanner", input, output });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
};

// ── Resume Builder ────────────────────────────────────
export const runResumeBuilder = async (
  input: ResumeBuilderInput,
): Promise<ToolResult> => {
  try {
    const prompt = `
Build a professional, ATS-optimized resume from the following information.

Full Name: ${input.full_name}
Email: ${input.email}
Phone: ${input.phone}
Location: ${input.location}
Professional Summary: ${input.summary}
Work Experience: ${input.experience}
Education: ${input.education}
Skills: ${input.skills}

Format the resume cleanly with these sections:
1. Header (name, contact info)
2. Professional Summary (3-4 impactful sentences)
3. Work Experience (use strong action verbs, quantify achievements)
4. Education
5. Skills (organized by category)

Make it ATS-friendly, professional, and compelling. Use markdown formatting.
    `.trim();

    const output = await callAI(prompt);
    await saveToolUsage({ tool_name: "resume-builder", input, output });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
};

// ── Cover Letter Generator ────────────────────────────
export const runCoverLetter = async (
  input: CoverLetterInput,
): Promise<ToolResult> => {
  try {
    const prompt = `
Write a compelling cover letter for this job application.

RESUME/BACKGROUND:
${input.resume}

JOB DESCRIPTION:
${input.job_description}

COMPANY: ${input.company_name}
TONE: ${input.tone}

Write a 3-paragraph cover letter that:
1. Opens with a strong hook connecting the candidate to the role
2. Highlights 2-3 most relevant experiences/skills with specific examples
3. Closes with enthusiasm and a clear call to action

Keep it under 350 words. Make it feel human, not templated.
    `.trim();

    const output = await callAI(prompt);
    await saveToolUsage({ tool_name: "cover-letter", input, output });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
};

// ── JD Decoder ────────────────────────────────────────
export const runJDDecoder = async (
  input: JDDecoderInput,
): Promise<ToolResult> => {
  try {
    const prompt = `
Decode this job description and extract what the employer REALLY wants.

JOB DESCRIPTION:
${input.job_description}

Provide:
1. **Role in Plain English**: What this person will actually do day-to-day
2. **Must-Have Requirements**: Non-negotiable skills/experience
3. **Nice-to-Have Requirements**: Preferred but not essential
4. **Hidden Requirements**: Things implied but not explicitly stated
5. **Red Flags**: Any concerning language or unrealistic expectations
6. **Company Culture Signals**: What the language reveals about the team/culture
7. **Keywords to Include in Your Application**: Top 10 ATS keywords
8. **Realistic Salary Range**: Based on role, seniority and typical market rates
    `.trim();

    const output = await callAI(prompt);
    await saveToolUsage({ tool_name: "jd-decoder", input, output });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
};

// ── LinkedIn Bio Writer ───────────────────────────────
export const runLinkedInBio = async (
  input: LinkedInBioInput,
): Promise<ToolResult> => {
  try {
    const prompt = `
Write an optimized LinkedIn profile for this person.

Current Role: ${input.current_role}
Experience: ${input.experience}
Key Skills: ${input.skills}
Career Goal: ${input.goal}
Tone: ${input.tone}

Generate:
1. **Headline** (220 chars max): Keyword-rich, specific, compelling
2. **About Section** (2600 chars max): Story-driven, first person, ends with CTA
3. **Featured Skills**: Top 10 skills to add
4. **Profile Tips**: 3 specific tips to improve their profile further

Make it feel authentic and human, not like a bot wrote it.
    `.trim();

    const output = await callAI(prompt);
    await saveToolUsage({ tool_name: "linkedin-bio", input, output });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
};

// ── Salary Coach ──────────────────────────────────────
export const runSalaryCoach = async (
  input: SalaryCoachInput,
): Promise<ToolResult> => {
  try {
    const prompt = `
You are a salary negotiation coach. Help this person negotiate their offer.

Role: ${input.role}
Current Offer: ${input.current_offer}
Target Salary: ${input.target_salary}
Years of Experience: ${input.experience_years}
Location: ${input.location}

Provide:
1. **Market Analysis**: Is the offer fair? What's the market range for this role?
2. **Negotiation Strategy**: Step-by-step approach
3. **Script**: Exact words to say when negotiating (email + phone versions)
4. **Counter-offer Range**: Specific numbers to ask for
5. **Beyond Base Salary**: Other things to negotiate (equity, PTO, remote, signing bonus)
6. **Common Objections & Responses**: How to handle pushback
    `.trim();

    const output = await callAI(prompt);
    await saveToolUsage({ tool_name: "salary-coach", input, output });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
};

// ── Cold Outreach Writer ──────────────────────────────
export const runColdOutreach = async (
  input: ColdOutreachInput,
): Promise<ToolResult> => {
  try {
    const prompt = `
Write a highly personalized cold outreach email.

From: ${input.your_name} (${input.your_role})
To: ${input.target_name} at ${input.target_company}
Purpose: ${input.purpose}
Context/Hook: ${input.context}

Write:
1. **Subject Line** (3 options, under 50 chars each)
2. **Email Body**: 
   - Personal hook in first line (no "I hope this finds you well")
   - Clear value proposition
   - Specific ask
   - Easy CTA
   - Under 150 words total
3. **Follow-up Message**: A 1-week follow-up if no reply (under 75 words)
4. **LinkedIn Version**: Shorter version for LinkedIn InMail (under 100 words)
    `.trim();

    const output = await callAI(prompt);
    await saveToolUsage({ tool_name: "cold-outreach", input, output });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
};

// ── Paper Explainer ───────────────────────────────────
export const runPaperExplainer = async (
  input: PaperExplainerInput,
): Promise<ToolResult> => {
  try {
    const prompt = `
Explain this research paper at a ${input.detail_level} level.

PAPER:
${input.paper_text}

Provide:
1. **One-line Summary**: What this paper is about in plain English
2. **Problem Being Solved**: What gap or problem does this research address?
3. **Methodology**: How did the researchers approach the problem?
4. **Key Findings**: The most important results/conclusions
5. **Why It Matters**: Real-world implications
6. **Limitations**: What the paper doesn't cover or its weaknesses
7. **Key Terms Explained**: Define 5 technical terms used in the paper
${input.detail_level === "simple" ? "Use analogies and avoid jargon. Explain like I'm 18 years old." : ""}
${input.detail_level === "detailed" ? "Include methodology details, statistical significance, and technical depth." : ""}
    `.trim();

    const output = await callAI(prompt);
    await saveToolUsage({ tool_name: "paper-explainer", input, output });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
};

// ── Assignment Planner ────────────────────────────────
export const runAssignmentPlanner = async (
  input: AssignmentPlannerInput,
): Promise<ToolResult> => {
  try {
    const prompt = `
Create a detailed assignment plan for this student.

Assignment Brief: ${input.assignment_brief}
Subject: ${input.subject}
Deadline: ${input.deadline}
${input.word_count ? `Word Count: ${input.word_count}` : ""}

Provide:
1. **Assignment Breakdown**: Divide into clear sections/chapters with descriptions
2. **Day-by-Day Study Plan**: Specific tasks for each day until deadline
3. **Research Starting Points**: Key topics to research for each section
4. **Structure Template**: Suggested outline with headings
5. **Time Estimate**: Hours needed per section
6. **Key Arguments/Thesis Ideas**: 3 possible angles to take
7. **Common Mistakes to Avoid**: For this type of assignment
    `.trim();

    const output = await callAI(prompt);
    await saveToolUsage({ tool_name: "assignment-planner", input, output });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
};

// ── Email Drafting ────────────────────────────────────
export const runEmailDraft = async (
  input: EmailDraftInput,
): Promise<ToolResult> => {
  try {
    const prompt = `
Draft a professional email based on these details.

Context: ${input.context}
Recipient: ${input.recipient}
Tone: ${input.tone}
Key Points to Cover: ${input.key_points}

Provide:
1. **Subject Line** (2 options)
2. **Email Draft**: Complete, ready-to-send email
3. **Alternative Version**: A shorter version if the first is too long
4. **Tone Notes**: Brief explanation of choices made

Keep it clear, purposeful, and appropriate for the recipient.
    `.trim();

    const output = await callAI(prompt);
    await saveToolUsage({ tool_name: "email-draft", input, output });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
};

// ── Code Reviewer ─────────────────────────────────────
export const runCodeReviewer = async (
  input: CodeReviewerInput,
): Promise<ToolResult> => {
  try {
    const prompt = `
Review this ${input.language} code with focus on: ${input.focus}.

CODE:
\`\`\`${input.language}
${input.code}
\`\`\`

Provide:
1. **Overall Assessment**: Quality score (1-10) and summary
2. **Bugs & Issues**: List every bug found with line references and fixes
3. **Code Quality**: Naming, structure, readability issues
${input.focus === "performance" || input.focus === "all" ? "4. **Performance Issues**: Inefficiencies and optimizations" : ""}
${input.focus === "readability" || input.focus === "all" ? "5. **Readability Improvements**: How to make the code cleaner" : ""}
6. **Refactored Version**: Improved version of the most problematic section
7. **Best Practices**: What best practices are missing

Be specific — reference actual lines of code in your feedback.
    `.trim();

    const output = await callAI(prompt);
    await saveToolUsage({ tool_name: "code-reviewer", input, output });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
};

// ── ADD THESE TO tools.actions.ts ────────────────────
// Place after the getUserToolCount function

// Free tier: 10 tool uses/month, Pro: unlimited
export const checkToolLimit = async (): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  isPro: boolean;
}> => {
  const { userId, has } = await auth();
  if (!userId) return { allowed: false, used: 0, limit: 0, isPro: false };

  const isPro = has({ plan: "pro" });

  if (isPro) return { allowed: true, used: 0, limit: Infinity, isPro: true };

  const supabase = createSupabaseClient();

  // Count uses this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("tool_usage")
    .select("id")
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());

  if (error) return { allowed: true, used: 0, limit: 10, isPro: false };

  const used = data?.length ?? 0;
  const limit = 10;

  return { allowed: used < limit, used, limit, isPro: false };
};

// ── ADD THESE TO THE BOTTOM OF lib/actions/tools.actions.ts ──

// ── Plagiarism Rewriter ───────────────────────────────
export const runPlagiarismRewriter = async (
  input: PlagiarismRewriterInput,
): Promise<ToolResult> => {
  try {
    const prompt = `
You are an expert academic writer. Rewrite the following text to make it original while preserving the exact meaning and all key information.

ORIGINAL TEXT:
${input.text}

REWRITING STYLE: ${input.style}
${input.subject ? `SUBJECT/CONTEXT: ${input.subject}` : ""}

Requirements:
1. **Rewritten Version**: Completely rewrite using different vocabulary, sentence structures, and phrasing
2. **Changes Made**: List the main structural and vocabulary changes applied
3. **Similarity Check**: Rate how different the rewrite is from the original (Low/Medium/High difference)
4. **Tips**: 2-3 tips to further improve originality

Rules:
- Keep all facts, data, and technical terms accurate
- Maintain the same academic level and tone
- Do NOT add new information or remove key points
- Make it sound natural, not robotic
    `.trim();

    const output = await callAI(prompt);
    await saveToolUsage({ tool_name: "plagiarism-rewriter", input, output });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
};

// ── Meeting Summarizer ────────────────────────────────
export const runMeetingSummarizer = async (
  input: MeetingSummarizerInput,
): Promise<ToolResult> => {
  try {
    const prompt = `
You are an expert at summarizing meetings and extracting actionable information.

MEETING TRANSCRIPT:
${input.transcript}

${input.meeting_type ? `MEETING TYPE: ${input.meeting_type}` : ""}
${input.participants ? `PARTICIPANTS: ${input.participants}` : ""}

Provide:
1. **Meeting Summary**: 3-5 sentence overview of what was discussed
2. **Key Decisions Made**: Bullet list of decisions reached
3. **Action Items**: Table format with — Task | Owner | Deadline
4. **Open Questions**: Unresolved topics that need follow-up
5. **Next Steps**: What happens after this meeting
6. **One-line TL;DR**: Single sentence summary for sharing

Be concise and actionable. Focus on what matters most.
    `.trim();

    const output = await callAI(prompt);
    await saveToolUsage({ tool_name: "meeting-summarizer", input, output });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
};

// ── Documentation Writer ──────────────────────────────
export const runDocWriter = async (
  input: DocWriterInput,
): Promise<ToolResult> => {
  try {
    const prompt = `
You are an expert technical writer. Write clear, professional documentation for the following.

TYPE: ${input.doc_type}
CONTENT:
${input.content}

${input.audience ? `TARGET AUDIENCE: ${input.audience}` : ""}

Generate complete documentation including:
${
  input.doc_type === "code"
    ? `
1. **Overview**: What this code does in plain English
2. **Parameters/Arguments**: Table of all inputs with types and descriptions
3. **Return Value**: What it returns and when
4. **Usage Examples**: 2-3 practical code examples
5. **Edge Cases & Errors**: Known limitations and error handling
6. **Notes**: Any important caveats or dependencies
`
    : ""
}
${
  input.doc_type === "api"
    ? `
1. **Endpoint Overview**: Method, URL, and purpose
2. **Request Parameters**: Headers, query params, body schema
3. **Response Schema**: Success and error response formats with examples
4. **Authentication**: How to authenticate
5. **Code Examples**: curl, JavaScript, and Python examples
6. **Error Codes**: List of possible errors and meanings
`
    : ""
}
${
  input.doc_type === "process"
    ? `
1. **Overview**: What this process achieves
2. **Prerequisites**: What's needed before starting
3. **Step-by-Step Guide**: Numbered steps with clear instructions
4. **Expected Outcomes**: What success looks like at each step
5. **Troubleshooting**: Common issues and fixes
6. **FAQs**: 3 common questions about this process
`
    : ""
}

Use markdown formatting. Be clear, precise, and developer-friendly.
    `.trim();

    const output = await callAI(prompt);
    await saveToolUsage({ tool_name: "doc-writer", input, output });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
};

// ── Skill Gap Analyzer ────────────────────────────────
export const runSkillGapAnalyzer = async (
  input: SkillGapAnalyzerInput,
): Promise<ToolResult> => {
  try {
    const prompt = `
You are a career development expert. Analyze the skill gap between this person's current skills and their target role.

CURRENT SKILLS & EXPERIENCE:
${input.current_skills}

TARGET ROLE: ${input.target_role}
${input.experience_years ? `YEARS OF EXPERIENCE: ${input.experience_years}` : ""}
${input.timeline ? `TIMELINE TO ACHIEVE GOAL: ${input.timeline}` : ""}

Provide:
1. **Role Requirements**: Key skills needed for ${input.target_role}
2. **Your Strengths**: Skills you already have that match the role
3. **Skill Gaps**: Skills you're missing — categorized as Critical/Important/Nice-to-have
4. **Learning Roadmap**: Step-by-step plan to close the gaps
   - What to learn first (priority order)
   - Recommended resources for each skill (courses, books, projects)
   - Estimated time per skill
5. **Quick Wins**: 3 things you can do this week to get closer
6. **Realistic Timeline**: How long to be job-ready at current pace
7. **Projects to Build**: 2-3 portfolio projects that demonstrate the missing skills

Be honest, specific, and encouraging.
    `.trim();

    const output = await callAI(prompt);
    await saveToolUsage({ tool_name: "skill-gap", input, output });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
};


export const getToolUsageById = async (id: string): Promise<ToolUsage | null> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("tool_usage")
    .select()
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data as ToolUsage;
};

// Get tool usage grouped by tool name with counts
export const getToolUsageSummary = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("tool_usage")
    .select("tool_name, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Group by tool name
  const summary = data.reduce((acc: Record<string, number>, row) => {
    acc[row.tool_name] = (acc[row.tool_name] || 0) + 1;
    return acc;
  }, {});

  return summary;
};

// Delete a tool usage record
export const deleteToolUsage = async (id: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { error } = await supabase
    .from("tool_usage")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/history");
  revalidatePath("/my-journey");
};