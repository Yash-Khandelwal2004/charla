

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

function getApiKey(): string {
  const key =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error(
      'Gemini API key missing. Set GEMINI_API_KEY (or the env var your callAI() already uses).',
    );
  }
  return key;
}

interface GeminiResponse {
  candidates?: {
    finishReason?: string;
    content?: { parts?: { text?: string }[] };
  }[];
  error?: { message?: string };
}

/** Returns the raw JSON text produced by Gemini. Throws on HTTP errors, truncation or empty output. */
export async function generateJsonText(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': getApiKey() },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          // 2.5 models count "thinking" tokens against this limit, so keep it generous.
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 1024 },
        },
      }),
      signal: AbortSignal.timeout(45_000),
      cache: 'no-store',
    },
  );

  const data = (await res.json().catch(() => ({}))) as GeminiResponse;

  if (!res.ok) {
    throw new Error(data.error?.message ?? `Gemini request failed with status ${res.status}`);
  }

  const candidate = data.candidates?.[0];
  if (candidate?.finishReason === 'MAX_TOKENS') {
    throw new Error('Gemini output was truncated (MAX_TOKENS). Increase maxOutputTokens.');
  }

  const text = candidate?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  if (!text.trim()) throw new Error('Gemini returned an empty response.');
  return text;
}