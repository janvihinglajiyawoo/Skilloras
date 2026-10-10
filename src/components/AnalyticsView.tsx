import React from 'react';
import {
  BarChart2,
  TrendingUp,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
  Zap,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';

export const AnalyticsView: React.FC = () => {
  const {
    student,
    subjectMasteryList,
    quizAttempts,
    overallStrengths,
    overallWeaknesses,
    setActiveView,
    setActiveRequizFilter,
  } = useStudent();

  const totalQuizzes = quizAttempts.length;
  const avgAccuracy =
    totalQuizzes > 0
      ? Math.round(
          quizAttempts.reduce((acc, q) => acc + q.percentage, 0) / totalQuizzes
        )
      : 80;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#292524] py-8 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-5xl">
        {/* Top Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#292524]">
            Adaptive Knowledge Analytics
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            Multi-signal assessment tracking subject mastery, retention patterns, and personalized revision goals
          </p>
        </div>

        {/* High-level Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-[#EAE5DC] shadow-xs">
            <div className="flex items-center justify-between text-[#78716C] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-[#292524]">
              {avgAccuracy}%
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              +12% improvement this week
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#EAE5DC] shadow-xs">
            <div className="flex items-center justify-between text-[#78716C] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Quizzes Completed</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-[#292524]">
              {student?.completedQuizzesCount || totalQuizzes}
            </div>
            <div className="text-[11px] text-[#78716C] mt-1">
              Across all semester subjects
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#EAE5DC] shadow-xs">
            <div className="flex items-center justify-between text-[#78716C] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Study Hours</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-extrabold text-[#292524]">
              {student?.totalStudyHours || 24.5}h
            </div>
            <div className="text-[11px] text-[#78716C] mt-1">
              Avg ~2 hours per day
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-[#EAE5DC] shadow-xs">
            <div className="flex items-center justify-between text-[#78716C] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Knowledge Rank</span>
              <Brain className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-extrabold text-[#292524]">
              {student?.difficulty || 'Intermediate'}
            </div>
            <div className="text-[11px] text-purple-700 font-semibold mt-1">
              Advancing toward Advanced
            </div>
          </div>
        </div>

        {/* Subject Mastery Radar & Progress Bars */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE5DC] shadow-xs mb-8">
          <h2 className="text-base font-extrabold text-[#292524] mb-1">
            Subject-by-Subject Knowledge Mastery
          </h2>
          <p className="text-xs text-[#78716C] mb-6">
            Computed from quiz accuracy, task completions, and revision retention signals
          </p>

          <div className="space-y-5">
            {subjectMasteryList.map((item) => (
              <div key={item.subject} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#292524]">
                      {item.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.level === 'Advanced'
                          ? 'bg-purple-100 text-purple-900'
                          : item.level === 'Intermediate'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {item.level} Level
                    </span>
                  </div>

                  <div className="text-xs font-extrabold text-[#292524]">
                    {item.scorePercentage}% Mastery
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#EAE5DC] h-2.5 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.scorePercentage >= 80
                        ? 'bg-emerald-600'
                        : item.scorePercentage >= 65
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${item.scorePercentage}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-[#78716C] gap-2 pt-1">
                  <span>
                    Quizzes completed: <strong className="text-[#292524]">{item.quizzesTaken}</strong>
                  </span>

                  {item.revisionNeeded && (
                    <button
                      onClick={() => {
                        setActiveRequizFilter({
                          subject: item.subject,
                          incorrectIds: item.weakPoints,
                        });
                        setActiveView('practice');
                      }}
                      className="text-xs text-[#C84B31] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Revision Recommended: Start Requiz</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Strengths Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAE5DC] shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Verified Strengths</span>
            </div>
            <ul className="space-y-3">
              {overallStrengths.map((str, i) => (
                <li
                  key={i}
                  className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-xs font-medium text-[#166534] flex items-center gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses & Revision Gaps */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAE5DC] shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold text-[#C84B31] uppercase tracking-wider mb-4">
              <AlertTriangle className="w-5 h-5 text-[#E87A5D]" />
              <span>Target Revision Concepts</span>
            </div>
            <ul className="space-y-3 mb-5">
              {overallWeaknesses.map((weak, i) => (
                <li
                  key={i}
                  className="p-3 rounded-2xl bg-[#FDF0ED] border border-[#FADCD5] text-xs font-medium text-[#991B1B] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#E87A5D] shrink-0" />
                    <span>{weak}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#C84B31]">
                    Practice
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setActiveView('practice')}
              className="w-full py-3 rounded-2xl bg-[#3D342F] text-white text-xs font-bold hover:bg-[#2A2320] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Launch Targeted Revision Quiz</span>
            </button>
          </div>
        </div>

        {/* Recent Quiz Attempts Log */}
        <div className="bg-white rounded-3xl p-6 border border-[#EAE5DC] shadow-xs">
          <h3 className="text-sm font-bold text-[#292524] mb-4">
            Recent Quiz History & Response Patterns
          </h3>
          <div className="divide-y divide-[#F2ECE1]">
            {quizAttempts.map((att) => (
              <div key={att.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#292524]">{att.quizTitle}</div>
                  <div className="text-[11px] text-[#78716C] mt-0.5">
                    {new Date(att.completedAt).toLocaleDateString()} • Time: {Math.round(att.timeSpentSeconds)}s
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-extrabold ${
                      att.percentage >= 80 ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {att.score} / {att.totalQuestions} ({att.percentage}%)
                  </div>
                  <div className="text-[10px] text-[#A8A29E]">
                    {att.incorrectQuestionIds.length === 0
                      ? 'Flawless'
                      : `${att.incorrectQuestionIds.length} missed`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
