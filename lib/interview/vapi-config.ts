
import type { CreateAssistantDTO } from '@vapi-ai/web/dist/api';


const INTERVIEWER_VOICE_ID = 'c6SfcYrb2t09NHXiT80T'; 
const INTERVIEWER_MODEL = { provider: 'google', model: 'gemini-2.5-flash' } as const;

const HARD_STOP_GRACE_SECONDS = 60;

export function configureInterviewer(params: {
  systemPrompt: string;
  firstMessage: string;
  durationMinutes: number;
}): CreateAssistantDTO {
  return {
    name: 'Charla Interviewer',
    firstMessage: params.firstMessage,
    transcriber: {
      provider: 'deepgram',
      model: 'nova-3',
      language: 'en',
    },
    voice: {
      provider: '11labs',
      voiceId: INTERVIEWER_VOICE_ID,
      stability: 0.5,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.3,
      useSpeakerBoost: true,
    },
    model: {
      ...INTERVIEWER_MODEL,
      temperature: 0.6,
      messages: [{ role: 'system', content: params.systemPrompt }],
    },
    maxDurationSeconds: params.durationMinutes * 60 + HARD_STOP_GRACE_SECONDS,
  
    startSpeakingPlan: { waitSeconds: 1.2 },
    silenceTimeoutSeconds: 60,
  } as CreateAssistantDTO;
}