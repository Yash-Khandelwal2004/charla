'use server';

import {auth} from "@clerk/nextjs/server";
import {createSupabaseClient} from "@/lib/supabase";
import { revalidatePath } from "next/cache";


export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .insert({...formData, author })
        .select();

    if(error || !data) throw new Error(error?.message || 'Failed to create a companion');

    return data[0];
}

export const getAllCompanions = async ({ limit = 10, page = 1, subject, topic }: GetAllCompanions) => {
    const supabase = createSupabaseClient();

    let query = supabase.from('companions').select();

    if(subject && topic) {
        query = query.ilike('subject', `%${subject}%`)
            .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    } else if(subject) {
        query = query.ilike('subject', `%${subject}%`)
    } else if(topic) {
        query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    }

    query = query.range((page - 1) * limit, page * limit - 1);

    const { data: companions, error } = await query;

    if(error) throw new Error(error.message);

    return companions;
}

export const getCompanion = async (id: string) => {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('id', id);

    if(error) return console.log(error);

    return data[0];
}


export const addToSessionHistory = async (
  companionId: string,
  transcript: SavedMessage[] = []
) => {
  const { userId } = await auth();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("session_history")
    .insert({
      companion_id: companionId,
      user_id: userId,
      transcript: transcript,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data; // { id: "..." }
};

export const getUserSessionsWithTranscripts = async (userId: string, limit = 20) => {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from('session_history')
    .select(`
      id,
      created_at,
      transcript,
      insights,
      companions:companion_id (
        id, name, subject, topic, duration
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
};

// Replace getRecentSessions in lib/actions/companion.actions.ts with this:

export const getRecentSessions = async (limit = 10) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .order('created_at', { ascending: false })
        .limit(limit)

    if(error) throw new Error(error.message);

    const allCompanions = data.map(({ companions }) => companions);

    // Dedupe by companion id, keeping the most recent occurrence
    const seen = new Set<string>();
    const uniqueCompanions = allCompanions.filter((companion: any) => {
        if (!companion || seen.has(companion.id)) return false;
        seen.add(companion.id);
        return true;
    });

    return uniqueCompanions;
}

export const getUserSessions = async (userId: string, limit = 10) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('author', userId)

    if(error) throw new Error(error.message);

    return data;
}

export const newCompanionPermissions = async () => {
    const { userId, has } = await auth();
    const supabase = createSupabaseClient();

    let limit = 3;

    if(has({ plan: 'pro' })) {
        return true;
    } else if(has({ feature: "3_companion_limit" })) {
        limit = 3;
    } else if(has({ feature: "10_companion_limit" })) {
        limit = 10;
    }

    const { data, error } = await supabase
        .from('companions')
        .select('id', { count: 'exact' })
        .eq('author', userId)

    if(error) throw new Error(error.message);

    const companionCount = data?.length;

    if(companionCount >= limit) {
        return false
    } else {
        return true;
    }
}

// Bookmarks
export const addBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("bookmarks").insert({
    companion_id: companionId,
    user_id: userId,
  });
  if (error) {
    throw new Error(error.message);
  }
  // Revalidate the path to force a re-render of the page

  revalidatePath(path);
  return data;
};

export const removeBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(path);
  return data;
};

// It's almost the same as getUserCompanions, but it's for the bookmarked companions
export const getBookmarkedCompanions = async (userId: string) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`companions:companion_id (*)`) // Notice the (*) to get all the companion data
    .eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  // We don't need the bookmarks data, so we return only the companions
  return data.map(({ companions }) => companions);
};


export const generateSessionInsights = async (
  sessionId: string,
  transcript: SavedMessage[],
  companionName: string,
  subject: string,
  topic: string
) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
 
  if (!transcript || transcript.length === 0) {
    return null;
  }
 
  const supabase = createSupabaseClient();
 
  const transcriptText = transcript
    .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
    .join("\n");
 
  const prompt = `You are an expert educational analyst. Below is a transcript of a voice tutoring session between a student and an AI tutor named "${companionName}" on the subject "${subject}", topic "${topic}".
 
Transcript:
${transcriptText}
 
Analyze this transcript and respond with ONLY a valid JSON object (no markdown, no code fences, no extra text) in exactly this format:
 
{
  "summary": "A 2-3 sentence summary of what was covered in this session.",
  "struggled_with": ["concept 1 the student seemed unsure about", "concept 2", "concept 3"],
  "quiz": [
    { "question": "Question 1 text?", "options": ["Option A text", "Option B text", "Option C text", "Option D text"], "correct_answer": "Option A text", "explanation": "Why this is correct." },
    { "question": "Question 2 text?", "options": ["Option A text", "Option B text", "Option C text", "Option D text"], "correct_answer": "Option B text", "explanation": "Why this is correct." },
    { "question": "Question 3 text?", "options": ["Option A text", "Option B text", "Option C text", "Option D text"], "correct_answer": "Option C text", "explanation": "Why this is correct." },
    { "question": "Question 4 text?", "options": ["Option A text", "Option B text", "Option C text", "Option D text"], "correct_answer": "Option D text", "explanation": "Why this is correct." },
    { "question": "Question 5 text?", "options": ["Option A text", "Option B text", "Option C text", "Option D text"], "correct_answer": "Option A text", "explanation": "Why this is correct." }
  ],
  "next_topic": "A specific recommended next topic to study, related to ${subject}/${topic}, with a 1-sentence reason why."
}
 
If the transcript is too short or doesn't contain enough educational content to generate a meaningful quiz, still return the JSON structure but make the quiz general knowledge questions related to ${topic} and note this in the summary.
 
CRITICAL RULES FOR THE QUIZ:
- "options" MUST be a JSON array of exactly 4 separate strings, like ["var", "let", "const", "int"] — NOT a single combined string like "var, let, const, int".
- Each option must be its own array element.
- "correct_answer" must be a string that exactly matches one of the 4 elements in "options".
- struggled_with should have 2-4 items.
 
Respond with ONLY the JSON object. No markdown formatting, no \`\`\`json fences.`;
 
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    }
  );
 
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${errText}`);
  }
 
  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
 
  if (!rawText) throw new Error("No response from Gemini");
 
  let insights;
  try {
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    insights = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to parse insights JSON: " + rawText.slice(0, 200));
  }
 
  // Normalize quiz options — Gemini occasionally returns options as a
  // single comma-separated string instead of a proper array
  if (insights.quiz && Array.isArray(insights.quiz)) {
    insights.quiz = insights.quiz.map((q: any) => {
      let options = q.options;
 
      if (typeof options === "string") {
        options = options
          .split(/,|\n/)
          .map((opt: string) => opt.trim())
          .filter((opt: string) => opt.length > 0);
      }
 
      if (!Array.isArray(options)) {
        options = [];
      }
 
      // Also normalize option items in case they're not strings
      options = options.map((opt: any) => String(opt).trim());
 
      return {
        ...q,
        options,
      };
    });
  }
 
  // Save insights to the session_history row
  const { error } = await supabase
    .from("session_history")
    .update({ insights })
    .eq("id", sessionId)
    .eq("user_id", userId);
 
  if (error) throw new Error(error.message);
 
  return insights;
};


export const getSessionInsights = async (sessionId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("session_history")
    .select("insights")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data?.insights ?? null;
};