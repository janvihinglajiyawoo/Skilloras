import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Brain,
  BookOpen,
  BarChart2,
  TrendingUp,
  Award,
  Target,
  Calendar,
  Zap,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const { setIsAuthModalOpen } = useStudent();
  // Step 0: Splash Screen (3-second auto-timer)
  // Step 1: Meet Your AI Tutor
  // Step 2: Understand Your Strengths & Weaknesses
  // Step 3: Personalized Learning
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [splashProgress, setSplashProgress] = useState(0);

  // 3-second automatic timer for Splash Screen (Step 0)
  useEffect(() => {
    if (currentStep !== 0) return;

    const intervalTime = 30; // update every 30ms
    const totalDuration = 3000; // 3 seconds
    const increment = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setCurrentStep(1);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else if (currentStep === 1) {
      setCurrentStep(0);
      setSplashProgress(100);
    }
  };

  const handleGetStarted = () => {
    onDismiss();
    // Requirement: "Get Started must open the existing login screen."
    setIsAuthModalOpen(true);
  };

  const handleSkip = () => {
    onDismiss();
    setIsAuthModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#FAF7F2] text-[#292524] px-6 py-8 sm:py-12 select-none overflow-y-auto">
      {/* Top Bar with Brand and Skip button */}
      <div className="w-full max-w-md flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#3D342F] text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-4.5 h-4.5 text-[#FAF7F2]" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-[#292524] flex items-center gap-1">
            Skillora
            <Sparkles className="w-3.5 h-3.5 text-[#E87A5D]" />
          </span>
        </div>

        {currentStep > 0 && (
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-[#78716C] hover:text-[#292524] px-3 py-1.5 rounded-full hover:bg-[#EAE5DC]/60 transition-colors cursor-pointer"
          >
            Skip
          </button>
        )}
      </div>

      {/* Main Center Container */}
      <div className="w-full max-w-md my-auto flex flex-col items-center text-center py-4">
        {/* ======================================================== */}
        {/* STEP 0: SPLASH SCREEN (Logo, Confused Student, Question Marks) */}
        {/* ======================================================== */}
        {currentStep === 0 && (
          <div className="flex flex-col items-center w-full animate-in fade-in zoom-in-95 duration-500">
            {/* Visual: Confused Student Illustration with floating ? marks */}
            <div className="relative w-72 h-64 sm:w-80 sm:h-72 flex items-center justify-center mb-6">
              {/* Soft Gray Oval Backdrop */}
              <div className="absolute inset-x-4 inset-y-6 bg-[#EBE5DA]/70 rounded-[100px] transform -rotate-2" />

              {/* Dotted Circular Orbital Ring */}
              <div className="absolute w-56 h-56 rounded-full border-2 border-dashed border-[#C5BDAF]/80 animate-rotate-slow" />

              {/* Confused Student Vector SVG */}
              <div className="relative z-10 w-48 h-48 flex items-center justify-center">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full drop-shadow-xs"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Subtle student body / clothes */}
                  <path
                    d="M 60 170 Q 100 155 140 170 L 145 200 L 55 200 Z"
                    fill="#3D342F"
                  />
                  <path
                    d="M 85 155 L 100 170 L 115 155 Z"
                    fill="#FAF7F2"
                    stroke="#3D342F"
                    strokeWidth="2"
                  />

                  {/* Student Neck */}
                  <rect x="92" y="130" width="16" height="25" rx="4" fill="#D6C7B2" />

                  {/* Student Head */}
                  <circle cx="100" cy="95" r="35" fill="#E8DEC8" stroke="#292524" strokeWidth="2.5" />

                  {/* Wavy Student Hair */}
                  <path
                    d="M 65 92 Q 62 65 92 62 Q 130 58 135 90 Q 138 78 128 70 Q 105 60 75 75 Z"
                    fill="#3D342F"
                  />
                  <path
                    d="M 68 85 Q 60 95 62 108 Q 66 112 70 105 Z"
                    fill="#3D342F"
                  />

                  {/* Confused Puzzled Eyebrows (one up, one tilted) */}
                  <path
                    d="M 82 82 Q 88 77 94 82"
                    stroke="#292524"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 106 85 Q 112 88 118 83"
                    stroke="#292524"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Puzzled Eyes */}
                  <circle cx="88" cy="94" r="3" fill="#292524" />
                  <circle cx="112" cy="95" r="3.5" fill="#292524" />

                  {/* Puzzled/Wavy Mouth */}
                  <path
                    d="M 94 115 Q 100 118 106 113 Q 110 116 114 114"
                    stroke="#292524"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />

                  {/* Student Hand Scratching Head (Confused gesture) */}
                  <path
                    d="M 130 160 Q 148 130 138 96 Q 135 90 128 88"
                    stroke="#292524"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="128" cy="88" r="5" fill="#D6C7B2" stroke="#292524" strokeWidth="2" />

                  {/* Open Textbook below */}
                  <path
                    d="M 50 180 L 100 172 L 150 180 L 145 195 L 100 188 L 55 195 Z"
                    fill="#FAF7F2"
                    stroke="#292524"
                    strokeWidth="2"
                  />
                  <line x1="100" y1="172" x2="100" y2="188" stroke="#292524" strokeWidth="2" />
                </svg>
              </div>

              {/* Floating Question Mark 1 (Top Left) */}
              <div className="absolute top-2 left-6 z-20 animate-float-slow">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#DDD6CB] shadow-sm flex items-center justify-center transform -rotate-12">
                  <span className="text-xl font-black text-[#E87A5D]">?</span>
                </div>
              </div>

              {/* Floating Question Mark 2 (Top Right) */}
              <div className="absolute top-6 right-8 z-20 animate-float-reverse">
                <div className="w-12 h-12 rounded-2xl bg-[#3D342F] text-white shadow-md flex items-center justify-center transform rotate-6">
                  <span className="text-2xl font-black text-[#FAF7F2]">?</span>
                </div>
              </div>

              {/* Floating Question Mark 3 (Mid Right) */}
              <div className="absolute bottom-12 right-4 z-20 animate-float-fast">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#DDD6CB] shadow-xs flex items-center justify-center transform rotate-12">
                  <span className="text-base font-bold text-[#78716C]">?</span>
                </div>
              </div>

              {/* Floating Idea Sparkle (Mid Left) */}
              <div className="absolute bottom-16 left-6 z-20 animate-float-reverse">
                <div className="w-8 h-8 rounded-full bg-[#EAE5DC] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#E87A5D]" />
                </div>
              </div>
            </div>

            {/* Brand Logo & Tagline */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#3D342F] text-white flex items-center justify-center shadow-sm">
                <GraduationCap className="w-6 h-6 text-[#FAF7F2]" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#292524]">
                Skillora
              </h1>
            </div>

            {/* Required Headings */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#292524] tracking-tight mb-2 mt-2">
              Learn Smarter. Learn Your Way.
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#78716C] max-w-xs leading-relaxed mb-6">
              Your personal AI-powered learning companion.
            </p>

            {/* 3-Second Automatic Progress Bar */}
            <div className="w-48 bg-[#EAE5DC] h-1.5 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-[#3D342F] rounded-full transition-all duration-75 ease-out"
                style={{ width: `${splashProgress}%` }}
              />
            </div>

            {/* Interactive manual button */}
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#3D342F] hover:text-black py-2 px-4 rounded-full bg-white border border-[#EAE5DC] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <span>Explore Skillora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 1: Meet Your AI Tutor */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="flex flex-col items-center w-full animate-in fade-in duration-300">
            {/* Visual: Gray Oval + Dotted Circle + Floating Brain, Book, Sparkles */}
            <div className="relative w-72 h-64 sm:w-80 sm:h-72 flex items-center justify-center mb-8">
              {/* Soft Gray Oval Backdrop */}
              <div className="absolute w-56 h-48 bg-[#EDE8DF] rounded-[80px] transform rotate-3" />

              {/* Dotted Circular Orbit */}
              <div className="absolute w-60 h-60 rounded-full border-2 border-dashed border-[#C7BFB1]/70 animate-rotate-slow" />

              {/* Central AI Tutor Capsule */}
              <div className="relative z-10 w-24 h-24 rounded-3xl bg-[#3D342F] text-white flex items-center justify-center shadow-xl border-4 border-white">
                <Brain className="w-12 h-12 text-[#FAF7F2]" strokeWidth={1.75} />
              </div>

              {/* Floating Brain Icon (Top Right) */}
              <div className="absolute top-6 right-8 z-20 animate-float-slow">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#DDD6CB] shadow-md flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#E87A5D]" strokeWidth={2} />
                </div>
              </div>

              {/* Floating Book Icon (Left) */}
              <div className="absolute bottom-12 left-6 z-20 animate-float-reverse">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#DDD6CB] shadow-md flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#292524]" strokeWidth={2} />
                </div>
              </div>

              {/* Floating Sparkle Pill (Bottom Right) */}
              <div className="absolute bottom-10 right-10 z-20 animate-float-fast">
                <div className="px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#DDD6CB] shadow-xs flex items-center gap-1.5 text-[11px] font-bold text-[#292524]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Adaptive AI</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E87A5D] bg-[#F8ECE8] px-2.5 py-1 rounded-full mb-3 inline-block">
                Step 1 of 3
              </span>
              <h2 className="text-2xl font-extrabold text-[#292524] tracking-tight mb-2">
                Meet Your AI Tutor
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
                Your personal AI assistant helps you learn according to your level.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: Understand Your Strengths & Weaknesses */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="flex flex-col items-center w-full animate-in fade-in duration-300">
            {/* Visual: Gray Oval + Animated Bar Chart + Floating Icons */}
            <div className="relative w-72 h-64 sm:w-80 sm:h-72 flex items-center justify-center mb-8">
              {/* Soft Gray Oval Backdrop */}
              <div className="absolute w-56 h-48 bg-[#EDE8DF] rounded-[80px] transform -rotate-3" />

              {/* Dotted Circular Orbit */}
              <div className="absolute w-60 h-60 rounded-full border-2 border-dashed border-[#C7BFB1]/70 animate-rotate-slow" />

              {/* Animated Bar Chart Card */}
              <div className="relative z-10 w-44 bg-white rounded-3xl p-4 border border-[#DDD6CB] shadow-xl">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#78716C] mb-3">
                  <span>Quiz Analytics</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                </div>

                {/* 3 Animated Bars */}
                <div className="flex items-end justify-between gap-3 h-20 px-1 border-b border-[#F2ECE1] pb-1">
                  {/* Bar 1: DBMS (92%) */}
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-extrabold text-emerald-700">92%</span>
                    <div className="w-full bg-emerald-600 rounded-t-lg h-16 animate-bar-grow" />
                    <span className="text-[8px] font-bold text-[#78716C]">DBMS</span>
                  </div>

                  {/* Bar 2: Python (78%) */}
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-extrabold text-[#E87A5D]">78%</span>
                    <div className="w-full bg-[#E87A5D] rounded-t-lg h-12 animate-bar-grow" style={{ animationDelay: '200ms' }} />
                    <span className="text-[8px] font-bold text-[#78716C]">Python</span>
                  </div>

                  {/* Bar 3: OS (64%) */}
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-extrabold text-[#3D342F]">64%</span>
                    <div className="w-full bg-[#3D342F] rounded-t-lg h-9 animate-bar-grow" style={{ animationDelay: '400ms' }} />
                    <span className="text-[8px] font-bold text-[#78716C]">OS</span>
                  </div>
                </div>
              </div>

              {/* Floating Trophy Icon (Top Left) */}
              <div className="absolute top-4 left-6 z-20 animate-float-slow">
                <div className="w-11 h-11 rounded-2xl bg-[#595747] text-white shadow-md flex items-center justify-center">
                  <Award className="w-5 h-5 text-[#FAF7F2]" strokeWidth={2} />
                </div>
              </div>

              {/* Floating Strength Badge (Right) */}
              <div className="absolute bottom-12 right-4 z-20 animate-float-reverse">
                <div className="px-3 py-1.5 rounded-2xl bg-white border border-[#DDD6CB] shadow-md flex items-center gap-1.5 text-[10px] font-bold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Strengths Identified</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E87A5D] bg-[#F8ECE8] px-2.5 py-1 rounded-full mb-3 inline-block">
                Step 2 of 3
              </span>
              <h2 className="text-2xl font-extrabold text-[#292524] tracking-tight mb-2">
                Understand Your Strengths & Weaknesses
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
                AI analyzes your quiz performance and identifies topics for improvement.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: Personalized Learning */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="flex flex-col items-center w-full animate-in fade-in duration-300">
            {/* Visual: Gray Oval + Target Ripple Effect + Floating Book & Calendar */}
            <div className="relative w-72 h-64 sm:w-80 sm:h-72 flex items-center justify-center mb-8">
              {/* Soft Gray Oval Backdrop */}
              <div className="absolute w-56 h-48 bg-[#EDE8DF] rounded-[80px]" />

              {/* Target Ripple Effect (Concentric Pulsing Waves) */}
              <div className="absolute w-56 h-56 rounded-full border border-[#D5CDBD] animate-pulse-ripple" />
              <div
                className="absolute w-44 h-44 rounded-full border border-[#C5BDAF] animate-pulse-ripple"
                style={{ animationDelay: '0.8s' }}
              />
              <div
                className="absolute w-32 h-32 rounded-full border border-[#B5ADA0] animate-pulse-ripple"
                style={{ animationDelay: '1.6s' }}
              />

              {/* Central Target Emblem */}
              <div className="relative z-10 w-24 h-24 rounded-full bg-[#3D342F] text-white flex items-center justify-center shadow-xl border-4 border-white">
                <Target className="w-12 h-12 text-[#FAF7F2]" strokeWidth={2} />
              </div>

              {/* Floating Calendar Icon (Top Right) */}
              <div className="absolute top-4 right-8 z-20 animate-float-slow">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#DDD6CB] shadow-md flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#292524]" strokeWidth={2} />
                </div>
              </div>

              {/* Floating Book Icon (Bottom Left) */}
              <div className="absolute bottom-8 left-8 z-20 animate-float-reverse">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#DDD6CB] shadow-md flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#292524]" strokeWidth={2} />
                </div>
              </div>

              {/* Floating Schedule Pill (Bottom Right) */}
              <div className="absolute bottom-8 right-6 z-20 animate-float-fast">
                <div className="px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#DDD6CB] shadow-xs flex items-center gap-1.5 text-[11px] font-bold text-[#3D342F]">
                  <Zap className="w-3 h-3 text-[#E87A5D]" />
                  <span>Daily Milestones</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E87A5D] bg-[#F8ECE8] px-2.5 py-1 rounded-full mb-3 inline-block">
                Step 3 of 3
              </span>
              <h2 className="text-2xl font-extrabold text-[#292524] tracking-tight mb-2">
                Personalized Learning
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
                Get personalized questions, study materials, and timetables.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation & Indicator Controls */}
      <div className="w-full max-w-md flex flex-col items-center gap-4 z-20">
        {/* Step Indicator Dots (For steps 1, 2, 3) */}
        {currentStep > 0 && (
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3].map((step) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentStep === step
                    ? 'w-7 bg-[#3D342F]'
                    : 'w-2 bg-[#D8D2C6] hover:bg-[#BFB7A8]'
                }`}
                aria-label={`Go to step ${step}`}
              />
            ))}
          </div>
        )}

        {/* Buttons for Onboarding Steps 1, 2, 3 */}
        {currentStep > 0 && (
          <div className="w-full flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="w-12 h-12 rounded-full bg-white border border-[#DDD6CB] flex items-center justify-center text-[#44403C] hover:bg-[#EDE8DF] transition-colors cursor-pointer shadow-xs shrink-0"
                aria-label="Previous step"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex-1 py-3.5 px-6 rounded-full bg-[#3D342F] hover:bg-[#2A2320] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer transform active:scale-98"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleGetStarted}
                className="flex-1 py-4 px-6 rounded-full bg-[#3D342F] hover:bg-[#2A2320] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-stone-800/15 transition-all cursor-pointer transform active:scale-98"
              >
                <span>Get Started</span>
                <Sparkles className="w-4 h-4 text-[#E87A5D]" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
