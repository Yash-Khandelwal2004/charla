'use client';

import { useEffect, useRef, useState } from 'react';
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from '@/constants/soundwaves.json';
import { addToSessionHistory, generateSessionInsights } from "@/lib/actions/companion.actions";


enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

const CompanionComponent = ({
  companionId, subject, topic, name, userName, userImage, style, voice
}: CompanionComponentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const messagesRef = useRef<SavedMessage[]>([]);

  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef) {
      if (isSpeaking) {
        lottieRef.current?.play();
      } else {
        lottieRef.current?.stop();
      }
    }
  }, [isSpeaking, lottieRef]);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);

    const onCallEnd = async () => {
      setCallStatus(CallStatus.FINISHED);

      // Use the ref — always up to date, unlike `messages` state in this closure
      const finalTranscript = messagesRef.current;

      try {
        const session = await addToSessionHistory(companionId, finalTranscript);

        // Generate insights in the background — don't block the UI
        if (session?.id && finalTranscript.length > 0) {
          generateSessionInsights(
            session.id,
            finalTranscript,
            name,
            subject,
            topic
          ).catch((err) => {
            console.error("Failed to generate insights:", err);
          });
        }
      } catch (error) {
        console.error("Failed to save session transcript:", error);
      }
    };

    const onMessage = (message: Message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => {
          const updated = [newMessage, ...prev];
          messagesRef.current = updated; // keep ref in sync
          return updated;
        });
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.log('Error', error);

    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('message', onMessage);
    vapi.on('error', onError);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);

    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('message', onMessage);
      vapi.off('error', onError);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
    };
  }, []);

  const toggleMicrophone = () => {
    const isMuted = vapi.isMuted();
    vapi.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    // Reset transcript state for a fresh session
    setMessages([]);
    messagesRef.current = [];

    const assistantOverrides = {
      variableValues: { subject, topic, style },
      clientMessages: ["transcript"],
      serverMessages: [],
    };
    // @ts-expect-error
    vapi.start(configureAssistant(voice, style), assistantOverrides);
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const subjectColor = getSubjectColor(subject);

  return (
    <section className="flex flex-col h-[70vh]">

      {/* Top — companion + user panels */}
      <section className="flex gap-6 max-sm:flex-col">

        {/* Companion panel */}
        <div
          className="companion-section"
          style={{ borderColor: subjectColor, borderWidth: "1px" }}
        >
          <div
            className="companion-avatar"
            style={{ backgroundColor: "var(--surface-2)" }}
          >
            {/* Idle / connecting state */}
            <div className={cn(
              'absolute transition-opacity duration-1000',
              callStatus === CallStatus.ACTIVE ? 'opacity-0' : 'opacity-100',
              callStatus === CallStatus.CONNECTING && 'opacity-60'
            )}>
              <Image
                src={`/icons/${subject}.svg`}
                alt={subject}
                width={150}
                height={150}
                className="max-sm:w-16"
              />
            </div>

            {/* Active state — soundwave */}
            <div className={cn(
              'absolute transition-opacity duration-1000',
              callStatus === CallStatus.ACTIVE ? 'opacity-100' : 'opacity-0'
            )}>
              <Lottie
                lottieRef={lottieRef}
                animationData={soundwaves}
                autoplay={false}
                className="companion-lottie"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 pb-4">
            <p
              className="font-bold text-xl"
              style={{
                color: "var(--foreground)",
                fontFamily: "var(--font-bricolage)",
                letterSpacing: "-0.02em",
              }}
            >
              {name}
            </p>
            <span
              className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md capitalize"
              style={{
                backgroundColor: "var(--surface-2)",
                color: subjectColor,
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: subjectColor }}
              />
              {subject}
            </span>
          </div>
        </div>

        {/* User panel */}
        <div className="user-section">
          {/* User avatar */}
          <div className="user-avatar">
            <Image
              src={userImage}
              alt={userName}
              width={100}
              height={100}
              className="rounded-lg"
            />
            <p
              className="font-bold text-lg"
              style={{
                color: "var(--foreground)",
                fontFamily: "var(--font-bricolage)",
                letterSpacing: "-0.02em",
              }}
            >
              {userName}
            </p>
          </div>

          {/* Mic toggle */}
          <button
            className="btn-mic"
            onClick={toggleMicrophone}
            disabled={callStatus !== CallStatus.ACTIVE}
            style={{
              opacity: callStatus !== CallStatus.ACTIVE ? 0.4 : 1,
              cursor: callStatus !== CallStatus.ACTIVE ? 'not-allowed' : 'pointer',
            }}
          >
            <Image
              src={isMuted ? '/icons/mic-off.svg' : '/icons/mic-on.svg'}
              alt="mic"
              width={28}
              height={28}
            />
            <p className="text-sm max-sm:hidden" style={{ color: "var(--muted-foreground)" }}>
              {isMuted ? 'Unmute microphone' : 'Mute microphone'}
            </p>
          </button>

          {/* Call button */}
          <button
            onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}
            className={cn(
              'rounded-lg py-3 px-4 cursor-pointer w-full text-sm font-medium',
              callStatus === CallStatus.CONNECTING && 'opacity-70'
            )}
            style={{
              backgroundColor:
                callStatus === CallStatus.ACTIVE
                  ? 'var(--destructive)'
                  : 'var(--accent)',
              color: callStatus === CallStatus.ACTIVE
                ? '#ffffff'
                : '#1a1917',
              borderRadius: '10px',
            }}
          >
            {callStatus === CallStatus.ACTIVE
              ? '⏹ End Session'
              : callStatus === CallStatus.CONNECTING
              ? 'Connecting...'
              : '▶ Start Session'}
          </button>

          {/* Status indicator */}
          <div className="flex items-center gap-2 justify-center">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  callStatus === CallStatus.ACTIVE
                    ? '#22c55e'
                    : callStatus === CallStatus.CONNECTING
                    ? '#f59e0b'
                    : 'var(--muted-foreground)',
              }}
            />
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {callStatus === CallStatus.ACTIVE
                ? 'Session active'
                : callStatus === CallStatus.CONNECTING
                ? 'Connecting to companion...'
                : callStatus === CallStatus.FINISHED
                ? 'Session ended'
                : 'Ready to start'}
            </p>
          </div>
        </div>
      </section>

      {/* Transcript — Chat bubble style */}
      <section className="transcript">
        <div className="transcript-message no-scrollbar">
          {messages.length === 0 && (
            <p
              className="text-center text-sm py-8"
              style={{ color: "var(--muted-foreground)" }}
            >
              Transcript will appear here once the session starts...
            </p>
          )}
          {messages.map((message, index) => {
            const isAI = message.role === 'assistant';
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div
                key={index}
                className={cn(
                  "flex flex-col gap-1 max-w-[85%]",
                  isAI ? "self-start" : "self-end items-end"
                )}
              >
                <div className={cn("chat-bubble", isAI ? "chat-bubble-ai" : "chat-bubble-user")}>
                  {isAI && (
                    <span className="text-xs font-semibold block mb-1" style={{ color: subjectColor }}>
                      {name.split(' ')[0]}
                    </span>
                  )}
                  {message.content}
                </div>
                <span className="text-[10px] px-1" style={{ color: "var(--muted-foreground)" }}>
                  {timestamp}
                </span>
              </div>
            );
          })}
        </div>
        <div className="transcript-fade" />
      </section>

    </section>
  );
};

export default CompanionComponent;