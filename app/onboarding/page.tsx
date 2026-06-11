"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const steps = [
  {
    title: "Welcome to Charla",
    emoji: "👋",
    description:
      "Charla is your AI-powered companion platform for career and learning. Learn through voice conversations, prep for interviews, scan resumes, and much more.",
  },
  {
    title: "Choose your path",
    emoji: "🛤️",
    description: "What brings you here? This helps us personalize your experience.",
    options: ["Learning", "Career", "Both"],
  },
  {
    title: "Start your first session",
    emoji: "🚀",
    description:
      "You're all set! Create your first AI companion or try out one of our 15 AI tools. The best way to learn is by doing.",
  },
];

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if onboarding was already completed
    const completed = localStorage.getItem("charla-onboarding-completed");
    if (completed) {
      router.replace("/");
    }
  }, [router]);

  const handleComplete = () => {
    localStorage.setItem("charla-onboarding-completed", "true");
    if (selectedPath) {
      localStorage.setItem("charla-user-path", selectedPath);
    }
    router.push("/");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <main className="items-center justify-center min-h-[calc(100vh-56px)]">
      <div
        className="w-full max-w-lg mx-auto flex flex-col gap-6 p-8"
        style={{
          backgroundColor: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
        }}
      >
        {/* Step content */}
        <div className="flex flex-col items-center text-center gap-4">
          <span className="text-5xl">{step.emoji}</span>
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-bricolage)",
              letterSpacing: "-0.02em",
            }}
          >
            {step.title}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {step.description}
          </p>

          {/* Path selection for step 2 */}
          {step.options && (
            <div className="flex gap-3 mt-2 flex-wrap justify-center">
              {step.options.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedPath(option)}
                  className="px-5 py-2.5 text-sm font-medium rounded-md cursor-pointer transition-all duration-150"
                  style={{
                    backgroundColor:
                      selectedPath === option ? "var(--accent)" : "transparent",
                    color: selectedPath === option ? "#1a1917" : "var(--foreground)",
                    border: `1px solid ${
                      selectedPath === option ? "var(--accent)" : "var(--border)"
                    }`,
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={handleNext}
            className="btn-primary w-full justify-center py-3"
            style={{ height: "44px" }}
            disabled={currentStep === 1 && !selectedPath}
          >
            {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
          </button>
          <button
            onClick={handleComplete}
            className="text-sm cursor-pointer text-center"
            style={{ color: "var(--muted-foreground)", background: "none", border: "none" }}
          >
            Skip onboarding
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-200"
              style={{
                backgroundColor:
                  i === currentStep ? "var(--accent)" : "var(--surface-3)",
                width: i === currentStep ? "20px" : "8px",
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default OnboardingPage;
