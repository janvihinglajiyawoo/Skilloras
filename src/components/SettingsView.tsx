import React, { useState } from 'react';
import {
  ChevronLeft,
  User,
  Globe,
  Clock,
  BarChart2,
  BookOpen,
  Eye,
  Lock,
  Sparkles,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { Language, DifficultyLevel } from '../types';

export const SettingsView: React.FC = () => {
  const { student, setActiveView, updateStudentProfile, logout, setShowOnboarding } = useStudent();

  const [activeModal, setActiveModal] = useState<
    'edit-profile' | 'language' | 'study-time' | 'difficulty' | 'text-size' | 'privacy' | 'about' | null
  >(null);

  // Form states
  const [name, setName] = useState(student?.name || 'Pooja Kubavat');
  const [role, setRole] = useState(student?.role || 'BCA • Semester 6');
  const [dailyMinutes, setDailyMinutes] = useState(student?.dailyStudyMinutes || 120);

  const toggleHighContrast = () => {
    updateStudentProfile({ highContrast: !student?.highContrast });
  };

  const handleSaveProfile = () => {
    updateStudentProfile({ name, role });
    setActiveModal(null);
  };

  const handleSaveStudyTime = () => {
    updateStudentProfile({ dailyStudyMinutes: dailyMinutes });
    setActiveModal(null);
  };

  const handleSelectLanguage = (lang: Language) => {
    updateStudentProfile({ language: lang });
    setActiveModal(null);
  };

  const handleSelectDifficulty = (level: DifficultyLevel) => {
    updateStudentProfile({ difficulty: level });
    setActiveModal(null);
  };

  const handleSelectTextSize = (size: 'Small' | 'Medium' | 'Large') => {
    updateStudentProfile({ textSize: size });
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#292524] py-8 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setActiveView('profile')}
            className="w-10 h-10 rounded-2xl bg-white border border-[#EAE5DC] flex items-center justify-center text-[#44403C] hover:bg-[#F2ECE1] transition-colors cursor-pointer shadow-2xs"
            aria-label="Back to profile"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold tracking-tight text-[#292524]">Settings</h2>

          {/* Spacer to keep title centered */}
          <div className="w-10 h-10" />
        </div>

        {/* Section 1: ACCOUNT */}
        <div className="mb-6">
          <div className="text-[11px] font-bold text-[#78716C] tracking-wider uppercase px-4 mb-2">
            Account
          </div>
          <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-xs overflow-hidden">
            <button
              onClick={() => {
                setName(student?.name || '');
                setRole(student?.role || '');
                setActiveModal('edit-profile');
              }}
              className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#78716C] group-hover:text-[#292524] flex items-center justify-center">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-[#292524]">Edit Profile</span>
                  <span className="text-xs text-[#78716C] ml-2 hidden sm:inline">
                    {student?.name}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#292524] transition-colors" />
            </button>
          </div>
        </div>

        {/* Section 2: LEARNING */}
        <div className="mb-6">
          <div className="text-[11px] font-bold text-[#78716C] tracking-wider uppercase px-4 mb-2">
            Learning
          </div>
          <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-xs overflow-hidden divide-y divide-[#F2ECE1]">
            {/* Language */}
            <button
              onClick={() => setActiveModal('language')}
              className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#78716C] group-hover:text-[#292524] flex items-center justify-center">
                  <Globe className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm font-bold text-[#292524]">Language</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#78716C] font-medium">
                  {student?.language || 'English'}
                </span>
                <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#292524] transition-colors" />
              </div>
            </button>

            {/* Daily Study Time */}
            <button
              onClick={() => setActiveModal('study-time')}
              className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#78716C] group-hover:text-[#292524] flex items-center justify-center">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm font-bold text-[#292524]">Daily Study Time</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#78716C] font-medium">
                  {Math.round((student?.dailyStudyMinutes || 120) / 60)} hrs
                </span>
                <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#292524] transition-colors" />
              </div>
            </button>

            {/* Difficulty Level */}
            <button
              onClick={() => setActiveModal('difficulty')}
              className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#78716C] group-hover:text-[#292524] flex items-center justify-center">
                  <BarChart2 className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm font-bold text-[#292524]">Difficulty Level</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#78716C] font-medium">
                  {student?.difficulty || 'Intermediate'}
                </span>
                <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#292524] transition-colors" />
              </div>
            </button>
          </div>
        </div>

        {/* Section 3: ACCESSIBILITY */}
        <div className="mb-6">
          <div className="text-[11px] font-bold text-[#78716C] tracking-wider uppercase px-4 mb-2">
            Accessibility
          </div>
          <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-xs overflow-hidden divide-y divide-[#F2ECE1]">
            {/* Text Size */}
            <button
              onClick={() => setActiveModal('text-size')}
              className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#78716C] group-hover:text-[#292524] flex items-center justify-center">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm font-bold text-[#292524]">Text Size</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#78716C] font-medium">
                  {student?.textSize || 'Medium'}
                </span>
                <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#292524] transition-colors" />
              </div>
            </button>

            {/* High Contrast with Toggle Switch */}
            <div className="w-full flex items-center justify-between px-6 py-4.5">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#78716C] flex items-center justify-center">
                  <Eye className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm font-bold text-[#292524]">High Contrast</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(student?.highContrast)}
                onClick={toggleHighContrast}
                className={`w-12 h-6.5 rounded-full transition-colors cursor-pointer p-0.5 relative ${
                  student?.highContrast ? 'bg-[#3D342F]' : 'bg-[#E5DFD5]'
                }`}
              >
                <div
                  className={`w-5.5 h-5.5 rounded-full bg-white shadow-xs transform transition-transform ${
                    student?.highContrast ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: PRIVACY */}
        <div className="mb-6">
          <div className="text-[11px] font-bold text-[#78716C] tracking-wider uppercase px-4 mb-2">
            Privacy
          </div>
          <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-xs overflow-hidden">
            <button
              onClick={() => setActiveModal('privacy')}
              className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#78716C] group-hover:text-[#292524] flex items-center justify-center">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm font-bold text-[#292524]">Data & Privacy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#292524] transition-colors" />
            </button>
          </div>
        </div>

        {/* About Skillora Card */}
        <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-xs p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-center text-[#3D342F]">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-extrabold text-[#292524] flex items-center gap-1.5">
                  <span>About Skillora</span>
                  <Sparkles className="w-4 h-4 text-[#E87A5D]" />
                </div>
                <div className="text-xs text-[#78716C] mt-0.5">
                  Learn Smarter. Learn Your Way.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowOnboarding(true)}
              className="text-xs font-bold px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC] text-[#3D342F] hover:bg-[#EAE5DC] transition-colors cursor-pointer self-start sm:self-auto"
            >
              Replay Onboarding Tour
            </button>
          </div>
        </div>

        {/* Bottom Logout Button */}
        <button
          onClick={logout}
          className="w-full py-4.5 px-6 rounded-3xl bg-[#EAE5DC]/80 hover:bg-[#EAE5DC] text-[#44403C] font-bold text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer border border-[#DDD6CA]"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Logout</span>
        </button>
      </div>

      {/* --- Sub Modals for Settings --- */}
      {activeModal === 'language' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-sm w-full p-6 border border-[#EAE5DC] shadow-xl">
            <h3 className="text-lg font-bold text-[#292524] mb-3">Language Preference</h3>
            <div className="space-y-2">
              {(['English', 'Hindi', 'Gujarati'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => handleSelectLanguage(l)}
                  className={`w-full p-3 rounded-2xl border text-left font-semibold text-xs cursor-pointer ${
                    student?.language === l
                      ? 'bg-[#3D342F] text-white border-[#3D342F]'
                      : 'bg-white border-[#EAE5DC] text-[#292524]'
                  }`}
                >
                  {l === 'English' ? 'English' : l === 'Hindi' ? 'हिन्दी (Hindi)' : 'ગુજરાતી (Gujarati)'}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[#78716C]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'difficulty' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-sm w-full p-6 border border-[#EAE5DC] shadow-xl">
            <h3 className="text-lg font-bold text-[#292524] mb-3">Difficulty Level</h3>
            <div className="space-y-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as DifficultyLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleSelectDifficulty(lvl)}
                  className={`w-full p-3 rounded-2xl border text-left font-semibold text-xs cursor-pointer ${
                    student?.difficulty === lvl
                      ? 'bg-[#3D342F] text-white border-[#3D342F]'
                      : 'bg-white border-[#EAE5DC] text-[#292524]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[#78716C]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'text-size' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-sm w-full p-6 border border-[#EAE5DC] shadow-xl">
            <h3 className="text-lg font-bold text-[#292524] mb-3">Adjust Text Size</h3>
            <div className="space-y-2">
              {(['Small', 'Medium', 'Large'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => handleSelectTextSize(sz)}
                  className={`w-full p-3 rounded-2xl border text-left font-semibold text-xs cursor-pointer ${
                    student?.textSize === sz
                      ? 'bg-[#3D342F] text-white border-[#3D342F]'
                      : 'bg-white border-[#EAE5DC] text-[#292524]'
                  }`}
                >
                  {sz} {sz === 'Medium' && '(Default)'}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[#78716C]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'study-time' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-sm w-full p-6 border border-[#EAE5DC] shadow-xl">
            <h3 className="text-lg font-bold text-[#292524] mb-3">Daily Study Time</h3>
            <div className="bg-white p-4 rounded-2xl border border-[#EAE5DC] text-center mb-4">
              <div className="text-2xl font-bold text-[#292524]">
                {Math.round(dailyMinutes / 60 * 10) / 10} Hours
              </div>
              <input
                type="range"
                min="30"
                max="360"
                step="30"
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(parseInt(e.target.value, 10))}
                className="w-full mt-3 accent-[#3D342F]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[#78716C]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStudyTime}
                className="px-5 py-2 rounded-xl bg-[#3D342F] text-white text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'edit-profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full p-6 border border-[#EAE5DC] shadow-xl">
            <h3 className="text-lg font-bold text-[#292524] mb-4">Edit Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#78716C] block mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#EAE5DC] rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#78716C] block mb-1">Role / Degree</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white border border-[#EAE5DC] rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[#78716C]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2 rounded-xl bg-[#3D342F] text-white text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full p-6 border border-[#EAE5DC] shadow-xl">
            <h3 className="text-lg font-bold text-[#292524] mb-2">Data & Privacy</h3>
            <p className="text-xs text-[#78716C] leading-relaxed mb-4">
              All learning progress, roadmaps, and chat transcripts are stored strictly locally in your browser.
              No private identity information is shared across students.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-[#3D342F] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
