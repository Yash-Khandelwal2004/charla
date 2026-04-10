'use client';

import { useEffect, useRef, useState } from 'react';
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from '@/constants/soundwaves.json';
import { addToSessionHistory } from "@/lib/actions/companion.actions";

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

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
      addToSessionHistory(companionId);
    };

    const onMessage = (message: Message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [newMessage, ...prev]);
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
            <p className="font-bold text-xl" style={{ color: "var(--foreground)", fontFamily: "var(--font-bricolage)" }}>{name}</p>
            <span
              className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md capitalize"
              style={{
                backgroundColor: "var(--surface-2)",
                color: subjectColor,
                border: "1px solid var(--surface-3)",
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
            <p className="font-bold text-lg" style={{ color: "var(--foreground)", fontFamily: "var(--font-bricolage)" }}>
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
                  ? '#dc2626'
                  : 'var(--primary)',
              color: callStatus === CallStatus.ACTIVE
                ? '#ffffff'
                : 'var(--primary-foreground)',
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
                    : callStatus === CallStatus.FINISHED
                    ? 'var(--muted-foreground)'
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

      {/* Transcript */}
      <section className="transcript">
        <div className="transcript-message no-scrollbar">
          {messages.length === 0 && (
            <p className="text-center text-sm py-8" style={{ color: "var(--muted-foreground)" }}>
              Transcript will appear here once the session starts...
            </p>
          )}
          {messages.map((message, index) => {
            if (message.role === 'assistant') {
              return (
                <p key={index} className="text-lg max-sm:text-sm leading-relaxed"
                  style={{ color: "var(--foreground)" }}>
                  <span className="font-semibold" style={{ color: subjectColor }}>
                    {name.split(' ')[0]}:
                  </span>{' '}
                  {message.content}
                </p>
              );
            } else {
              return (
                <p key={index} className="text-lg max-sm:text-sm leading-relaxed"
                  style={{ color: "var(--accent)" }}>
                  <span className="font-semibold">{userName}:</span>{' '}
                  {message.content}
                </p>
              );
            }
          })}
        </div>
        <div className="transcript-fade" />
      </section>

    </section>
  );
};

export default CompanionComponent;