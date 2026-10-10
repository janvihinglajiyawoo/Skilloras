import React, { useState } from 'react';
import {
  ChevronLeft,
  Settings as SettingsIcon,
  BookOpen,
  Target,
  Brain,
  Clock,
  Globe,
  Bell,
  Lock,
  LogOut,
  ChevronRight,
  Check,
  X,
  Edit3,
} from 'lucide-react';
import { useStudent, AppView } from '../context/StudentContext';
import { DifficultyLevel, Language } from '../types';

export const ProfileView: React.FC = () => {
  const { student, setActiveView, updateStudentProfile, logout } = useStudent();

  const [activeModal, setActiveModal] = useState<
    'edit-profile' | 'subjects' | 'goals' | 'level' | 'preferences' | 'language' | 'privacy' | null
  >(null);

  // Edit profile form state
  const [nameInput, setNameInput] = useState(student?.name || 'Pooja Kubavat');
  const [roleInput, setRoleInput] = useState(student?.role || 'BCA • Semester 6');
  const [emailInput, setEmailInput] = useState(student?.email || 'pooja.kubavat@university.edu');

  // Subjects state
  const availableSubjects = [
    'DBMS',
    'Python Programming',
    'Web Technologies',
    'Operating Systems',
    'Data Structures & Algorithms',
    'Computer Networks',
    'Software Engineering',
    'Artificial Intelligence Basics',
  ];
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    student?.subjects || ['DBMS', 'Python Programming', 'Web Technologies', 'Operating Systems', 'Data Structures & Algorithms']
  );

  // Daily hours state
  const [dailyMinutes, setDailyMinutes] = useState(student?.dailyStudyMinutes || 120);

  // Goal state
  const [goals, setGoals] = useState<string[]>(student?.learningGoals || []);
  const [newGoalInput, setNewGoalInput] = useState('');

  const handleSaveProfile = () => {
    const initials = nameInput
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'PK';

    updateStudentProfile({
      name: nameInput,
      role: roleInput,
      email: emailInput,
      initials,
    });
    setActiveModal(null);
  };

  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleSaveSubjects = () => {
    updateStudentProfile({ subjects: selectedSubjects });
    setActiveModal(null);
  };

  const handleSavePreferences = () => {
    updateStudentProfile({ dailyStudyMinutes: dailyMinutes });
    setActiveModal(null);
  };

  const handleSelectLevel = (level: DifficultyLevel) => {
    updateStudentProfile({ difficulty: level });
    setActiveModal(null);
  };

  const handleSelectLanguage = (lang: Language) => {
    updateStudentProfile({ language: lang });
    setActiveModal(null);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalInput.trim()) return;
    const updated = [...goals, newGoalInput.trim()];
    setGoals(updated);
    updateStudentProfile({ learningGoals: updated });
    setNewGoalInput('');
  };

  const handleRemoveGoal = (index: number) => {
    const updated = goals.filter((_, i) => i !== index);
    setGoals(updated);
    updateStudentProfile({ learningGoals: updated });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#292524] py-8 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setActiveView('dashboard')}
            className="w-10 h-10 rounded-2xl bg-white border border-[#EAE5DC] flex items-center justify-center text-[#44403C] hover:bg-[#F2ECE1] transition-colors cursor-pointer shadow-2xs"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold tracking-tight text-[#292524]">Profile</h2>

          <button
            onClick={() => setActiveView('settings')}
            className="w-10 h-10 rounded-2xl bg-white border border-[#EAE5DC] flex items-center justify-center text-[#44403C] hover:bg-[#F2ECE1] transition-colors cursor-pointer shadow-2xs"
            aria-label="Settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Center Identity */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Dark Charcoal/Roast Square Avatar with rounded corners */}
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-extrabold shadow-md mb-4"
            style={{ backgroundColor: student?.avatarBgColor || '#3D342F' }}
          >
            {student?.initials || 'PK'}
          </div>

          <h1 className="text-2xl font-extrabold text-[#292524] tracking-tight">
            {student?.name || 'Pooja Kubavat'}
          </h1>
          <p className="text-sm font-medium text-[#78716C] mt-1 mb-3">
            {student?.role || 'BCA • Semester 6'}
          </p>

          <button
            onClick={() => {
              setNameInput(student?.name || '');
              setRoleInput(student?.role || '');
              setEmailInput(student?.email || '');
              setActiveModal('edit-profile');
            }}
            className="text-xs font-semibold px-5 py-2 rounded-full bg-[#EAE5DC] text-[#44403C] hover:bg-[#DFD8CC] transition-colors cursor-pointer shadow-2xs"
          >
            Edit profile
          </button>
        </div>

        {/* Main Menu Card (White rounded card with list items) */}
        <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-xs overflow-hidden mb-6 divide-y divide-[#F2ECE1]">
          {/* 1. My Subjects */}
          <button
            onClick={() => setActiveModal('subjects')}
            className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#78716C] group-hover:text-[#292524] flex items-center justify-center">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#292524]">My Subjects</span>
                <span className="text-xs text-[#78716C] ml-2 hidden sm:inline">
                  ({student?.subjects.length || 0} active)
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#292524] transition-colors" />
          </button>

          {/* 2. Learning Goals */}
          <button
            onClick={() => setActiveModal('goals')}
            className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#78716C] group-hover:text-[#292524] flex items-center justify-center">
                <Target className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-bold text-[#292524]">Learning Goals</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#292524] transition-colors" />
          </button>

          {/* 3. Learning Level */}
          <button
            onClick={() => setActiveModal('level')}
            className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#78716C] group-hover:text-[#292524] flex items-center justify-center">
                <Brain className="w-4.5 h-4.5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#292524]">Learning Level</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#EAE5DC] text-[#44403C] font-semibold">
                  {student?.difficulty || 'Intermediate'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#292524] transition-colors" />
          </button>

          {/* 4. Study Preferences */}
          <button
            onClick={() => setActiveModal('preferences')}
            className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#78716C] group-hover:text-[#292524] flex items-center justify-center">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#292524]">Study Preferences</span>
                <span className="text-xs text-[#78716C] hidden sm:inline">
                  {student ? `${Math.round(student.dailyStudyMinutes / 60)} hrs/day` : '2 hrs/day'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#292524] transition-colors" />
          </button>

          {/* 5. Language */}
          <button
            onClick={() => setActiveModal('language')}
            className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#78716C] group-hover:text-[#292524] flex items-center justify-center">
                <Globe className="w-4.5 h-4.5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#292524]">Language</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#EAE5DC] text-[#44403C] font-semibold">
                  {student?.language || 'English'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#292524] transition-colors" />
          </button>

          {/* 6. Notifications */}
          <button
            onClick={() => setActiveView('notifications')}
            className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#78716C] group-hover:text-[#292524] flex items-center justify-center">
                <Bell className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-bold text-[#292524]">Notifications</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#292524] transition-colors" />
          </button>

          {/* 7. Privacy */}
          <button
            onClick={() => setActiveModal('privacy')}
            className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#78716C] group-hover:text-[#292524] flex items-center justify-center">
                <Lock className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-bold text-[#292524]">Privacy</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#292524] transition-colors" />
          </button>

          {/* 8. Settings */}
          <button
            onClick={() => setActiveView('settings')}
            className="w-full flex items-center justify-between px-6 py-4.5 text-left hover:bg-[#FAF7F2] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] text-[#78716C] group-hover:text-[#292524] flex items-center justify-center">
                <SettingsIcon className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-bold text-[#292524]">Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#A8A29E] group-hover:text-[#292524] transition-colors" />
          </button>
        </div>

        {/* Bottom Logout Button (Wide subtle card button as in screenshot) */}
        <button
          onClick={logout}
          className="w-full py-4.5 px-6 rounded-3xl bg-[#EAE5DC]/80 hover:bg-[#EAE5DC] text-[#44403C] font-bold text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer border border-[#DDD6CA]"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Logout</span>
        </button>
      </div>

      {/* --- SUB MODALS --- */}

      {/* Edit Profile Modal */}
      {activeModal === 'edit-profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full p-6 border border-[#EAE5DC] shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAE5DC]">
              <h3 className="text-lg font-bold text-[#292524]">Edit Profile Information</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#78716C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#78716C] mb-1">Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-white border border-[#EAE5DC] rounded-xl px-3.5 py-2.5 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#78716C] mb-1">
                  Academic Degree / Semester
                </label>
                <input
                  type="text"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="w-full bg-white border border-[#EAE5DC] rounded-xl px-3.5 py-2.5 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#78716C] mb-1">Email Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-white border border-[#EAE5DC] rounded-xl px-3.5 py-2.5 text-sm font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-6 pt-3 border-t border-[#EAE5DC]">
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
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subjects Selection Modal */}
      {activeModal === 'subjects' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full p-6 border border-[#EAE5DC] shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAE5DC]">
              <div>
                <h3 className="text-lg font-bold text-[#292524]">Select Your Subjects</h3>
                <p className="text-xs text-[#78716C]">Quizzes & roadmaps will adapt to these</p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#78716C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {availableSubjects.map((sub) => {
                const selected = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    onClick={() => toggleSubject(sub)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left text-xs font-semibold transition-colors cursor-pointer ${
                      selected
                        ? 'bg-white border-[#3D342F] text-[#292524] shadow-xs'
                        : 'bg-white/60 border-[#EAE5DC] text-[#78716C] hover:bg-white'
                    }`}
                  >
                    <span>{sub}</span>
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                        selected ? 'bg-[#3D342F] text-white' : 'border border-[#D6CFC3]'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2.5 mt-6 pt-3 border-t border-[#EAE5DC]">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[#78716C]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubjects}
                className="px-5 py-2 rounded-xl bg-[#3D342F] text-white text-xs font-bold"
              >
                Update Subjects
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Learning Goals Modal */}
      {activeModal === 'goals' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full p-6 border border-[#EAE5DC] shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAE5DC]">
              <div>
                <h3 className="text-lg font-bold text-[#292524]">Personalized Learning Goals</h3>
                <p className="text-xs text-[#78716C]">Track your Semester 6 targets</p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#78716C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newGoalInput}
                onChange={(e) => setNewGoalInput(e.target.value)}
                placeholder="Add a new academic goal..."
                className="flex-1 bg-white border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#292524]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#3D342F] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Add
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {goals.map((g, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#EAE5DC]"
                >
                  <span className="text-xs font-medium text-[#292524] flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-[#E87A5D]" />
                    {g}
                  </span>
                  <button
                    onClick={() => handleRemoveGoal(idx)}
                    className="text-[#A8A29E] hover:text-[#C84B31] p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-[#EAE5DC]">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-[#3D342F] text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Difficulty Level Modal */}
      {activeModal === 'level' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-sm w-full p-6 border border-[#EAE5DC] shadow-xl">
            <h3 className="text-lg font-bold text-[#292524] mb-1">Knowledge & Difficulty Level</h3>
            <p className="text-xs text-[#78716C] mb-4">Adjust your primary pace of quizzes and explanations</p>

            <div className="space-y-2.5">
              {(['Beginner', 'Intermediate', 'Advanced'] as DifficultyLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleSelectLevel(lvl)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                    student?.difficulty === lvl
                      ? 'bg-[#3D342F] text-white border-[#3D342F]'
                      : 'bg-white border-[#EAE5DC] text-[#292524] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">{lvl}</div>
                    <div
                      className={`text-[11px] ${
                        student?.difficulty === lvl ? 'text-stone-300' : 'text-[#78716C]'
                      }`}
                    >
                      {lvl === 'Beginner'
                        ? 'Foundational definitions & simple concepts'
                        : lvl === 'Intermediate'
                        ? 'Standard university exam & application problems'
                        : 'Deep edge-cases, system internals & viva prep'}
                    </div>
                  </div>
                  {student?.difficulty === lvl && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[#78716C]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {activeModal === 'language' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-sm w-full p-6 border border-[#EAE5DC] shadow-xl">
            <h3 className="text-lg font-bold text-[#292524] mb-1">Preferred Language</h3>
            <p className="text-xs text-[#78716C] mb-4">Voice agent and tutor will speak in this language</p>

            <div className="space-y-2.5">
              {(['English', 'Hindi', 'Gujarati'] as Language[]).map((lng) => (
                <button
                  key={lng}
                  onClick={() => handleSelectLanguage(lng)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                    student?.language === lng
                      ? 'bg-[#3D342F] text-white border-[#3D342F]'
                      : 'bg-white border-[#EAE5DC] text-[#292524] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">
                      {lng === 'English' ? 'English' : lng === 'Hindi' ? 'हिन्दी (Hindi)' : 'ગુજરાતી (Gujarati)'}
                    </div>
                    <div
                      className={`text-[11px] ${
                        student?.language === lng ? 'text-stone-300' : 'text-[#78716C]'
                      }`}
                    >
                      {lng === 'English'
                        ? 'Standard technical English'
                        : lng === 'Hindi'
                        ? 'हिंदी में स्पष्ट व्याख्या'
                        : 'ગુજરાતીમાં સ્પષ્ટ સમજૂતી'}
                    </div>
                  </div>
                  {student?.language === lng && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[#78716C]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences / Daily Study Time Modal */}
      {activeModal === 'preferences' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-sm w-full p-6 border border-[#EAE5DC] shadow-xl">
            <h3 className="text-lg font-bold text-[#292524] mb-1">Study Preferences</h3>
            <p className="text-xs text-[#78716C] mb-4">Daily target study time for roadmap calculations</p>

            <div className="bg-white p-4 rounded-2xl border border-[#EAE5DC] mb-4 text-center">
              <div className="text-3xl font-extrabold text-[#292524]">
                {Math.round(dailyMinutes / 60 * 10) / 10} <span className="text-sm font-semibold text-[#78716C]">Hours / Day</span>
              </div>
              <input
                type="range"
                min="30"
                max="360"
                step="30"
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(parseInt(e.target.value, 10))}
                className="w-full mt-4 accent-[#3D342F]"
              />
              <div className="flex justify-between text-[10px] text-[#A8A29E] mt-1">
                <span>30 mins</span>
                <span>2 hrs</span>
                <span>4 hrs</span>
                <span>6 hrs</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[#78716C]"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-5 py-2 rounded-xl bg-[#3D342F] text-white text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full p-6 border border-[#EAE5DC] shadow-xl">
            <h3 className="text-lg font-bold text-[#292524] mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#3D342F]" />
              Data & Privacy Controls
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed mb-4">
              LearnGenie stores all student identities, personalized study roadmaps, chat sessions, and quiz analytics securely on your device.
              Your data is completely private and isolated per authenticated account.
            </p>

            <div className="bg-white p-3.5 rounded-2xl border border-[#EAE5DC] text-xs space-y-2 mb-4 text-[#44403C]">
              <div className="flex items-center justify-between">
                <span>On-Device Storage:</span>
                <span className="font-bold text-emerald-700">Encrypted LocalStorage</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Session Clearing on Logout:</span>
                <span className="font-bold text-emerald-700">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Account History Isolation:</span>
                <span className="font-bold text-emerald-700">Protected</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-[#3D342F] text-white text-xs font-bold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
