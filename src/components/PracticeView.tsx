import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Clock,
  Award,
  Zap,
  BarChart2,
  BookOpen,
  Filter,
  Check,
  AlertTriangle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStudent } from '../context/StudentContext';
import { CURATED_QUIZZES } from '../data/initialData';
import { generateDynamicQuiz } from '../services/api';
import { QuizQuestion, DifficultyLevel } from '../types';
import { audioService, CELEBRATORY_AFFIRMATIONS } from '../services/soundEffects';

export const PracticeView: React.FC = () => {
  const {
    student,
    recordQuizAttempt,
    activeRequizFilter,
    setActiveRequizFilter,
    setActiveView,
  } = useStudent();

  const [selectedSubject, setSelectedSubject] = useState<string>(
    activeRequizFilter?.subject || 'DBMS'
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(
    student?.difficulty || 'Intermediate'
  );

  // Active quiz state
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState<{
    text: string;
    emoji: string;
    subtext: string;
  } | null>(null);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  // Quiz completed results
  const [quizResult, setQuizResult] = useState<{
    totalQuestions: number;
    score: number;
    percentage: number;
    timeSpent: number;
    incorrectQuestions: QuizQuestion[];
    conceptsCovered: string[];
    weakConcepts: string[];
    suggestedLevel: DifficultyLevel;
  } | null>(null);

  // Handle active requiz filter if loaded from another view
  useEffect(() => {
    if (activeRequizFilter) {
      setSelectedSubject(activeRequizFilter.subject);
      startRequizForQuestions(activeRequizFilter.incorrectIds, activeRequizFilter.subject);
    }
  }, [activeRequizFilter]);

  // Quiz timer
  useEffect(() => {
    let interval: any;
    if (activeQuizQuestions && !quizResult) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeQuizQuestions, quizResult]);

  const startQuiz = (subject: string, difficulty: DifficultyLevel) => {
    const list = CURATED_QUIZZES[subject]?.[difficulty] || CURATED_QUIZZES['DBMS']?.['Intermediate'] || [];
    setActiveQuizQuestions(list);
    setCurrentIndex(0);
    setUserAnswers({});
    setSelectedOption(null);
    setHasSubmittedAnswer(false);
    setQuizStartTime(Date.now());
    setElapsedSeconds(0);
    setQuizResult(null);
    setActiveRequizFilter(null);
  };

  const startRequizForQuestions = (incorrectIds: string[], subject: string) => {
    const allForSubject: QuizQuestion[] = [
      ...(CURATED_QUIZZES[subject]?.['Beginner'] || []),
      ...(CURATED_QUIZZES[subject]?.['Intermediate'] || []),
      ...(CURATED_QUIZZES[subject]?.['Advanced'] || []),
    ];

    const filtered = allForSubject.filter((q) => incorrectIds.includes(q.id));
    if (filtered.length > 0) {
      setActiveQuizQuestions(filtered);
      setCurrentIndex(0);
      setUserAnswers({});
      setSelectedOption(null);
      setHasSubmittedAnswer(false);
      setQuizStartTime(Date.now());
      setElapsedSeconds(0);
      setQuizResult(null);
    } else {
      // Fallback: start regular quiz
      startQuiz(subject, selectedDifficulty);
    }
  };

  const handleGenerateAiQuiz = async () => {
    setIsLoadingQuiz(true);
    try {
      const generated = await generateDynamicQuiz(
        selectedSubject,
        'Important BCA Semester 6 Concept Assessment',
        selectedDifficulty,
        []
      );
      if (generated && generated.length > 0) {
        setActiveQuizQuestions(generated);
        setCurrentIndex(0);
        setUserAnswers({});
        setSelectedOption(null);
        setHasSubmittedAnswer(false);
        setQuizStartTime(Date.now());
        setElapsedSeconds(0);
        setQuizResult(null);
      } else {
        startQuiz(selectedSubject, selectedDifficulty);
      }
    } catch (e) {
      startQuiz(selectedSubject, selectedDifficulty);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (!hasSubmittedAnswer) {
      setSelectedOption(idx);
    }
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || !activeQuizQuestions) return;
    const currentQ = activeQuizQuestions[currentIndex];
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: selectedOption }));
    setHasSubmittedAnswer(true);

    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      if (!isSoundMuted) {
        audioService.playCorrectSound();
      }
      const randomAffirmation =
        CELEBRATORY_AFFIRMATIONS[Math.floor(Math.random() * CELEBRATORY_AFFIRMATIONS.length)];
      setCurrentAffirmation(randomAffirmation);

      // Light confetti celebration on correct answer
      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.65 },
        });
      } catch (e) {
        // ignore
      }
    } else {
      if (!isSoundMuted) {
        audioService.playErrorSound();
      }
      setCurrentAffirmation(null);
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuizQuestions) return;
    if (currentIndex < activeQuizQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmittedAnswer(false);
      setCurrentAffirmation(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!activeQuizQuestions) return;

    let score = 0;
    const incorrect: QuizQuestion[] = [];
    const conceptsCovered: string[] = [];
    const weakConcepts: string[] = [];

    activeQuizQuestions.forEach((q) => {
      const userAns = userAnswers[q.id];
      if (q.concept && !conceptsCovered.includes(q.concept)) {
        conceptsCovered.push(q.concept);
      }
      if (userAns === q.correctIndex) {
        score += 1;
      } else {
        incorrect.push(q);
        if (q.concept && !weakConcepts.includes(q.concept)) {
          weakConcepts.push(q.concept);
        }
      }
    });

    const total = activeQuizQuestions.length;
    const percentage = Math.round((score / total) * 100);

    // Adaptive difficulty recommendations
    let suggestedLevel: DifficultyLevel = selectedDifficulty;
    if (percentage >= 85) {
      suggestedLevel = selectedDifficulty === 'Beginner' ? 'Intermediate' : 'Advanced';
    } else if (percentage < 50) {
      suggestedLevel = selectedDifficulty === 'Advanced' ? 'Intermediate' : 'Beginner';
    }

    const result = {
      totalQuestions: total,
      score,
      percentage,
      timeSpent: elapsedSeconds,
      incorrectQuestions: incorrect,
      conceptsCovered,
      weakConcepts,
      suggestedLevel,
    };

    setQuizResult(result);

    // Save attempt to student context
    recordQuizAttempt({
      quizTitle: `${selectedSubject} (${selectedDifficulty}) Assessment`,
      subject: selectedSubject,
      difficulty: selectedDifficulty,
      totalQuestions: total,
      score,
      percentage,
      timeSpentSeconds: elapsedSeconds,
      userAnswers,
      incorrectQuestionIds: incorrect.map((q) => q.id),
      conceptsCovered,
      weakConcepts,
    });

    // Celebration if high score!
    if (percentage >= 80) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#292524] py-8 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#292524]">
              Practice & Adaptive Quizzes
            </h1>
            <p className="text-xs text-[#78716C] mt-1">
              Personalized assessments with instant explanations and re-quiz practice
            </p>
          </div>

          {activeQuizQuestions && (
            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-2xl border border-[#EAE5DC] text-xs font-bold text-[#44403C] shadow-2xs">
              <Clock className="w-4 h-4 text-[#E87A5D]" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>
          )}
        </div>

        {/* 1. QUIZ SELECTOR SCREEN (When no quiz is actively running) */}
        {!activeQuizQuestions && !quizResult && (
          <div className="space-y-6">
            {/* Subject Selector Tabs */}
            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-xs">
              <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider block mb-3">
                1. Select Subject
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.keys(CURATED_QUIZZES).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`p-3.5 rounded-2xl border text-left font-bold text-xs transition-all cursor-pointer ${
                      selectedSubject === sub
                        ? 'bg-[#3D342F] text-white border-[#3D342F] shadow-sm'
                        : 'bg-[#FAF7F2] border-[#EAE5DC] text-[#44403C] hover:bg-white hover:border-[#DDD6CA]'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 mb-2 opacity-80" />
                    <div>{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level Tabs */}
            <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-xs">
              <label className="text-xs font-bold text-[#78716C] uppercase tracking-wider block mb-3">
                2. Select Knowledge Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Beginner', 'Intermediate', 'Advanced'] as DifficultyLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedDifficulty(lvl)}
                    className={`py-3 px-4 rounded-2xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      selectedDifficulty === lvl
                        ? 'bg-[#3D342F] text-white border-[#3D342F] shadow-sm'
                        : 'bg-[#FAF7F2] border-[#EAE5DC] text-[#44403C] hover:bg-white'
                    }`}
                  >
                    <div>{lvl}</div>
                    <div className="text-[10px] font-normal opacity-75 mt-0.5">
                      {lvl === 'Beginner' ? 'Fundamental' : lvl === 'Intermediate' ? 'Standard' : 'Challenging'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Launch Actions */}
            <div className="bg-white rounded-3xl p-6 border border-[#EAE5DC] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#292524]">
                  Ready to test your knowledge in {selectedSubject}?
                </h3>
                <p className="text-xs text-[#78716C] mt-1">
                  Questions are dynamically adjusted to your target skill tier.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => startQuiz(selectedSubject, selectedDifficulty)}
                  className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-[#3D342F] text-white text-xs font-bold hover:bg-[#2A2320] transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Start Curated Quiz</span>
                </button>

                <button
                  onClick={handleGenerateAiQuiz}
                  disabled={isLoadingQuiz}
                  className="flex-1 sm:flex-none px-5 py-3.5 rounded-2xl bg-[#EAE5DC] hover:bg-[#DDD6CA] text-[#44403C] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#E87A5D]" />
                  <span>{isLoadingQuiz ? 'Generating...' : 'AI Custom Quiz'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. ACTIVE QUIZ TAKING SCREEN */}
        {activeQuizQuestions && !quizResult && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE5DC] shadow-xs">
            {/* Progress Bar & Header */}
            <div className="flex items-center justify-between text-xs font-bold text-[#78716C] mb-3">
              <div className="flex items-center gap-2">
                <span>
                  Question {currentIndex + 1} of {activeQuizQuestions.length}
                </span>
                <span className="text-[#A8A29E]">•</span>
                <span className="text-[#3D342F] flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-[#78716C]" />
                  {formatTimer(elapsedSeconds)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE5DC] text-[#44403C]">
                  {activeQuizQuestions[currentIndex].concept || selectedSubject}
                </span>

                {/* Sound effect toggle button */}
                <button
                  type="button"
                  onClick={() => setIsSoundMuted(!isSoundMuted)}
                  className={`px-2 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    isSoundMuted
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-[#FAF7F2] border-[#EAE5DC] text-[#44403C] hover:bg-white'
                  }`}
                  title={isSoundMuted ? 'Quiz sound effects are muted (Click to unmute)' : 'Quiz sound effects active (Click to mute)'}
                >
                  {isSoundMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                      <span className="hidden sm:inline">Muted</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-[#3D342F]" />
                      <span className="hidden sm:inline">Sound On</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="w-full bg-[#EAE5DC] h-2 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-[#3D342F] rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / activeQuizQuestions.length) * 100}%`,
                }}
              />
            </div>

            {/* Question Text */}
            <h3 className="text-lg sm:text-xl font-bold text-[#292524] mb-6 leading-snug">
              {activeQuizQuestions[currentIndex].question}
            </h3>

            {/* Options List */}
            <div className="space-y-3 mb-6">
              {activeQuizQuestions[currentIndex].options.map((opt, optIdx) => {
                const currentQ = activeQuizQuestions[currentIndex];
                const isSelected = selectedOption === optIdx;
                const isCorrect = currentQ.correctIndex === optIdx;

                let optClass = 'bg-[#FAF7F2] border-[#EAE5DC] text-[#292524] hover:bg-white';
                if (hasSubmittedAnswer) {
                  if (isCorrect) {
                    optClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                  } else if (isSelected && !isCorrect) {
                    optClass = 'bg-rose-50 border-rose-400 text-rose-950';
                  } else {
                    optClass = 'opacity-50 bg-[#FAF7F2] border-[#EAE5DC] text-[#78716C]';
                  }
                } else if (isSelected) {
                  optClass = 'bg-white border-[#3D342F] text-[#292524] shadow-xs ring-1 ring-[#3D342F]';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={hasSubmittedAnswer}
                    className={`w-full p-4 rounded-2xl border text-left text-sm transition-all cursor-pointer flex items-center justify-between ${optClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          isSelected
                            ? 'bg-[#3D342F] text-white'
                            : 'bg-white border border-[#DDD6CA] text-[#78716C]'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="font-medium">{opt}</span>
                    </div>

                    {hasSubmittedAnswer && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                    {hasSubmittedAnswer && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Celebratory Affirmation on Correct Answer */}
            {hasSubmittedAnswer && (
              <>
                {selectedOption === activeQuizQuestions[currentIndex].correctIndex && currentAffirmation && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 shadow-xs mb-4 flex items-center gap-3.5 animate-in slide-in-from-top-2 duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-sm shrink-0 transform -rotate-3 animate-bounce">
                      {currentAffirmation.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-emerald-950 tracking-tight">
                          {currentAffirmation.text}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                          Correct Answer
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 font-medium mt-0.5">
                        {currentAffirmation.subtext}
                      </p>
                    </div>
                  </div>
                )}

                {selectedOption !== activeQuizQuestions[currentIndex].correctIndex && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 mb-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-rose-950">
                        Not quite, but great effort!
                      </div>
                      <p className="text-[11px] text-rose-800">
                        Review the concept explanation below to master this topic.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Explanation box after submission */}
            {hasSubmittedAnswer && (
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC] mb-6 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-[#44403C] mb-1">
                  <HelpCircle className="w-4 h-4 text-[#E87A5D]" />
                  <span>Concept Explanation</span>
                </div>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  {activeQuizQuestions[currentIndex].explanation}
                </p>
              </div>
            )}

            {/* Bottom Question Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-[#F2ECE1]">
              <button
                onClick={() => {
                  setActiveQuizQuestions(null);
                  setActiveRequizFilter(null);
                }}
                className="text-xs font-semibold text-[#78716C] hover:text-[#292524] cursor-pointer"
              >
                Quit Quiz
              </button>

              {!hasSubmittedAnswer ? (
                <button
                  onClick={handleConfirmAnswer}
                  disabled={selectedOption === null}
                  className="px-6 py-2.5 rounded-xl bg-[#3D342F] text-white text-xs font-bold hover:bg-[#2A2320] transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-[#3D342F] text-white text-xs font-bold hover:bg-[#2A2320] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>
                    {currentIndex === activeQuizQuestions.length - 1 ? 'View Analytics' : 'Next Question'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. DETAILED PERFORMANCE ANALYTICS & RE-QUIZ SCREEN */}
        {quizResult && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Scorecard Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE5DC] shadow-xs text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#FAF7F2] border border-[#EAE5DC] mb-4 shadow-2xs">
                <Award
                  className={`w-10 h-10 ${
                    quizResult.percentage >= 80
                      ? 'text-amber-500'
                      : quizResult.percentage >= 60
                      ? 'text-blue-500'
                      : 'text-[#E87A5D]'
                  }`}
                />
              </div>

              <h2 className="text-2xl font-extrabold text-[#292524]">
                Quiz Complete: {quizResult.score} / {quizResult.totalQuestions}
              </h2>
              <p className="text-sm font-semibold text-[#78716C] mt-1">
                Accuracy: {quizResult.percentage}% • Time Taken: {formatTimer(quizResult.timeSpent)}
              </p>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto w-full bg-[#EAE5DC] h-3 rounded-full overflow-hidden my-5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    quizResult.percentage >= 80
                      ? 'bg-emerald-600'
                      : quizResult.percentage >= 60
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${quizResult.percentage}%` }}
                />
              </div>

              {/* Adaptive Feedback */}
              <p className="text-xs text-[#57534E] max-w-lg mx-auto leading-relaxed">
                {quizResult.percentage >= 80
                  ? '🌟 Exceptional mastery! You have a solid command of these core concepts. We recommend trying Advanced difficulty next.'
                  : quizResult.percentage >= 60
                  ? '👍 Good performance! You understand the foundations well, with a few edge-cases to polish using the Requiz feature below.'
                  : '💡 Practice makes progress! Review the explanations for incorrect questions and use the Practice Again button to master them.'}
              </p>
            </div>

            {/* Strengths & Weaknesses Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Concepts Mastered */}
              <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Strengths Identified</span>
                </div>
                {quizResult.conceptsCovered.filter((c) => !quizResult.weakConcepts.includes(c)).length > 0 ? (
                  <ul className="space-y-2">
                    {quizResult.conceptsCovered
                      .filter((c) => !quizResult.weakConcepts.includes(c))
                      .map((sc, i) => (
                        <li key={i} className="text-xs font-medium text-[#292524] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{sc}</span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#78716C]">Continue reviewing to build strong concepts.</p>
                )}
              </div>

              {/* Concepts Needing Revision */}
              <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider mb-3">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Concepts Needing Revision</span>
                </div>
                {quizResult.weakConcepts.length > 0 ? (
                  <ul className="space-y-2">
                    {quizResult.weakConcepts.map((wc, i) => (
                      <li key={i} className="text-xs font-medium text-[#292524] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>{wc}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-emerald-700 font-medium">
                    Zero concept gaps identified in this quiz run! 🎉
                  </p>
                )}
              </div>
            </div>

            {/* Actions: Requiz / Practice Again! */}
            <div className="bg-white rounded-3xl p-6 border border-[#EAE5DC] shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setQuizResult(null);
                    setActiveQuizQuestions(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC] text-xs font-semibold text-[#44403C] hover:bg-white cursor-pointer"
                >
                  Back to Quiz List
                </button>
              </div>

              <div className="flex items-center gap-3">
                {quizResult.incorrectQuestions.length > 0 && (
                  <button
                    onClick={() => {
                      const incorrectIds = quizResult.incorrectQuestions.map((q) => q.id);
                      startRequizForQuestions(incorrectIds, selectedSubject);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#E87A5D] hover:bg-[#D56B4F] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Practice Weak Questions ({quizResult.incorrectQuestions.length})</span>
                  </button>
                )}

                <button
                  onClick={() => startQuiz(selectedSubject, quizResult.suggestedLevel)}
                  className="px-5 py-2.5 rounded-xl bg-[#3D342F] text-white text-xs font-bold hover:bg-[#2A2320] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Next Adaptive Quiz ({quizResult.suggestedLevel})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
