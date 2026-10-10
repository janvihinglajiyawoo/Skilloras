import React from 'react';
import {
  Sparkles,
  Calendar,
  Zap,
  BookOpen,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Award,
  Radio,
  Flame,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { VoiceAgentWidget } from './VoiceAgentWidget';
import { COLORFUL_NOTES, RECOMMENDED_VIDEOS } from '../data/initialData';

export const DashboardView: React.FC = () => {
  const {
    student,
    subjectMasteryList,
    roadmapTasks,
    updateTaskStatus,
    overallStrengths,
    overallWeaknesses,
    setActiveView,
    setActiveRequizFilter,
  } = useStudent();

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTasks = roadmapTasks.filter((t) => t.status !== 'Completed').slice(0, 3);
  const featuredNotes = COLORFUL_NOTES.slice(0, 2);
  const featuredVideos = RECOMMENDED_VIDEOS.slice(0, 2);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#292524] py-8 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-6xl space-y-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE5DC] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shadow-sm shrink-0"
              style={{ backgroundColor: student?.avatarBgColor || '#3D342F' }}
            >
              {student?.initials || 'PK'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#292524] tracking-tight">
                  Welcome back, {student?.name || 'Pooja'}!
                </h1>
                <span className="text-xl">🎓</span>
              </div>
              <p className="text-xs text-[#78716C] mt-1 font-medium">
                {student?.role || 'BCA • Semester 6'} • Adaptive Learning Stream Active
              </p>
            </div>
          </div>

          {/* Quick streak and hours pills */}
          <div className="flex items-center gap-3">
            <div className="bg-[#FAF7F2] border border-[#EAE5DC] px-4 py-2 rounded-2xl flex items-center gap-2 shadow-2xs">
              <Flame className="w-4 h-4 text-[#E87A5D]" />
              <div>
                <div className="text-[10px] font-bold text-[#78716C] uppercase">Streak</div>
                <div className="text-sm font-extrabold text-[#292524]">
                  {student?.currentStreak || 7} Days 🔥
                </div>
              </div>
            </div>

            <div className="bg-[#FAF7F2] border border-[#EAE5DC] px-4 py-2 rounded-2xl flex items-center gap-2 shadow-2xs">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-[10px] font-bold text-[#78716C] uppercase">Study Time</div>
                <div className="text-sm font-extrabold text-[#292524]">
                  {student?.totalStudyHours || 24.5} Hours
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Fully Integrated AI Voice Agent in Dashboard */}
        <div>
          <VoiceAgentWidget />
        </div>

        {/* 2. Main Dashboard Split: Roadmap Tasks + Knowledge Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Today's Roadmap & Deadlines */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#EAE5DC] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#3D342F] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#292524]">
                      Today's Priorities & Deadlines
                    </h2>
                    <p className="text-[11px] text-[#78716C]">
                      Manageable daily milestones adapted to your schedule
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveView('roadmap')}
                  className="text-xs font-bold text-[#3D342F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All ({roadmapTasks.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks preview list */}
              <div className="space-y-3">
                {pendingTasks.length === 0 ? (
                  <p className="text-xs text-[#78716C] p-4 text-center">
                    All current roadmap milestones completed! Great job! 🎉
                  </p>
                ) : (
                  pendingTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-between gap-3 hover:bg-white transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => updateTaskStatus(t.id, 'Completed')}
                          className="w-5 h-5 rounded-full border-2 border-[#DDD6CA] hover:border-[#3D342F] flex items-center justify-center mt-0.5 cursor-pointer shrink-0"
                          title="Mark completed"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#292524] truncate">
                            {t.title}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#78716C] mt-0.5">
                            <span className="font-semibold text-[#44403C]">{t.subject}</span>
                            <span>•</span>
                            <span>Due: {t.dueDate}</span>
                            <span>•</span>
                            <span>{t.estimatedMinutes} mins</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          t.priority === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F2ECE1] flex items-center justify-between text-xs text-[#78716C]">
              <span>Next deadline in: <strong>24 hours</strong></span>
              <button
                onClick={() => setActiveView('roadmap')}
                className="font-bold text-[#3D342F] hover:underline cursor-pointer"
              >
                + Add Custom Task
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): Knowledge Level by Subject */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#EAE5DC] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#3D342F] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#292524]">
                      Subject Knowledge Levels
                    </h2>
                    <p className="text-[11px] text-[#78716C]">
                      Real-time retention calculations
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveView('analytics')}
                  className="text-xs font-bold text-[#3D342F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress bars list */}
              <div className="space-y-3.5">
                {subjectMasteryList.slice(0, 4).map((s) => (
                  <div key={s.subject}>
                    <div className="flex items-center justify-between text-xs font-semibold text-[#292524] mb-1">
                      <span>{s.subject}</span>
                      <span className="text-[11px] text-[#78716C]">
                        {s.level} ({s.scorePercentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#EAE5DC] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          s.scorePercentage >= 80
                            ? 'bg-emerald-600'
                            : s.scorePercentage >= 65
                            ? 'bg-blue-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${s.scorePercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Practice button */}
            <div className="mt-5 pt-3 border-t border-[#F2ECE1]">
              <button
                onClick={() => setActiveView('practice')}
                className="w-full py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC] hover:border-[#3D342F] text-xs font-bold text-[#292524] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Take Recommended Adaptive Quiz</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Strengths & Revision Gaps Alert */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#EAE5DC] flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Confirmed Strengths
              </h3>
              <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                {overallStrengths.slice(0, 2).join(' • ')}
              </p>
            </div>
          </div>

          <div className="bg-[#FAF7F2] p-5 rounded-3xl border border-[#EAE5DC] flex items-start justify-between gap-3.5">
            <div className="flex items-start gap-3.5">
              <AlertTriangle className="w-5 h-5 text-[#E87A5D] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-[#C84B31] uppercase tracking-wider">
                  Revision Gaps to Practice
                </h3>
                <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                  {overallWeaknesses.slice(0, 2).join(' • ')}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveRequizFilter({
                  subject: 'DBMS',
                  incorrectIds: ['q5'],
                });
                setActiveView('practice');
              }}
              className="text-xs font-bold text-[#C84B31] hover:underline shrink-0 cursor-pointer self-center"
            >
              Requiz Now →
            </button>
          </div>
        </div>

        {/* 4. Recommended Educational Videos Preview */}
        <div className="bg-white rounded-3xl p-6 border border-[#EAE5DC] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#3D342F] flex items-center justify-center">
                <Play className="w-4 h-4 fill-[#3D342F]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#292524]">
                  Recommended Video Lectures
                </h2>
                <p className="text-[11px] text-[#78716C]">
                  Curated for BCA Semester 6 DBMS and Python topics
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveView('videos')}
              className="text-xs font-bold text-[#3D342F] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredVideos.map((v) => (
              <div
                key={v.id}
                onClick={() => setActiveView('videos')}
                className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-between gap-3 hover:bg-white transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-stone-900 overflow-hidden relative shrink-0">
                    <img
                      src={v.thumbnailUrl}
                      alt={v.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <Play className="w-4 h-4 fill-white text-white absolute inset-0 m-auto" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#292524] truncate group-hover:text-[#E87A5D] transition-colors">
                      {v.title}
                    </div>
                    <div className="text-[10px] text-[#78716C] mt-0.5">
                      {v.channel} • {v.duration}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A8A29E] shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* 5. Concept Notes & Flowcharts Quick Access */}
        <div className="bg-white rounded-3xl p-6 border border-[#EAE5DC] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#3D342F] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#292524]">
                  Colorful Notes with Diagrams
                </h2>
                <p className="text-[11px] text-[#78716C]">
                  Interactive flowchart models ready for offline download
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveView('notes')}
              className="text-xs font-bold text-[#3D342F] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>All Notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredNotes.map((n) => (
              <div
                key={n.id}
                onClick={() => setActiveView('notes')}
                className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-between gap-3 hover:bg-white transition-all cursor-pointer group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#78716C] mb-1">
                    <span>{n.subject}</span>
                    <span>•</span>
                    <span className="text-emerald-700">{n.level}</span>
                  </div>
                  <div className="text-xs font-bold text-[#292524] truncate group-hover:text-[#3D342F]">
                    {n.title}
                  </div>
                  <div className="text-[11px] text-[#78716C] truncate mt-0.5">
                    Includes {n.diagramTitle}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A8A29E] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
