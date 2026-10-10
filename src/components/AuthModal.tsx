import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { INITIAL_STUDENT_PROFILE } from '../data/initialData';

export const AuthModal: React.FC = () => {
  const { loginAs, isAuthenticated, isAuthModalOpen, setIsAuthModalOpen } = useStudent();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    INITIAL_STUDENT_PROFILE.id
  );
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('BCA • Semester 6');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  if (isAuthenticated && !isAuthModalOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingNew) {
      if (!customName.trim()) return;
      const newId = `student-${Date.now()}`;
      const initials = customName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const newProfile = {
        ...INITIAL_STUDENT_PROFILE,
        id: newId,
        name: customName.trim(),
        initials: initials || 'ST',
        role: customRole.trim() || 'BCA Student',
        email: `${customName.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
        completedQuizzesCount: 0,
        totalStudyHours: 0,
        currentStreak: 1,
      };

      localStorage.setItem(`learngenie_profiles_v1_${newId}`, JSON.stringify(newProfile));
      loginAs(newId);
    } else {
      loginAs(selectedStudentId);
    }
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#EAE5DC] shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close button if user is already authenticated */}
        {isAuthenticated && (
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-[#EAE5DC] flex items-center justify-center text-[#78716C] hover:text-[#292524] cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Brand Emblem */}
        <div className="w-16 h-16 rounded-3xl bg-[#3D342F] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
          <GraduationCap className="w-9 h-9 text-[#FAF7F2]" />
        </div>

        <h2 className="text-2xl font-extrabold text-[#292524] tracking-tight">
          Welcome to Skillora
        </h2>
        <p className="text-xs text-[#78716C] mt-1 mb-6">
          Sign in to restore your personalized roadmap and secure AI Tutor history
        </p>

        <form onSubmit={handleSignIn} className="space-y-4 text-left">
          {!isCreatingNew ? (
            <div>
              <label className="text-xs font-bold text-[#78716C] block mb-2">
                Select Authorized Student Account:
              </label>

              {/* Account 1: Pooja Kubavat */}
              <button
                type="button"
                onClick={() => setSelectedStudentId(INITIAL_STUDENT_PROFILE.id)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedStudentId === INITIAL_STUDENT_PROFILE.id
                    ? 'bg-white border-[#3D342F] ring-1 ring-[#3D342F] shadow-xs'
                    : 'bg-white/60 border-[#EAE5DC] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3D342F] text-white flex items-center justify-center font-bold text-xs">
                    PK
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#292524]">
                      Pooja Kubavat
                    </div>
                    <div className="text-[10px] text-[#78716C]">
                      BCA • Semester 6 (Restores 5 Quizzes & Notes)
                    </div>
                  </div>
                </div>
                {selectedStudentId === INITIAL_STUDENT_PROFILE.id && (
                  <Check className="w-4 h-4 text-[#3D342F]" />
                )}
              </button>

              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="text-xs font-bold text-[#3D342F] hover:underline cursor-pointer"
                >
                  + Sign in as a different student
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#78716C] block mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Rahul Patel"
                  className="w-full bg-white border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#292524]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#78716C] block mb-1">
                  Class / Semester
                </label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g. BCA • Semester 4"
                  className="w-full bg-white border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#292524]"
                />
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs font-semibold text-[#78716C] hover:text-[#292524] cursor-pointer"
                >
                  ← Back to saved student profiles
                </button>
              </div>
            </div>
          )}

          {/* Secure isolation notice */}
          <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EAE5DC] flex items-center gap-2 text-[11px] text-[#78716C]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Chat conversations are isolated and strictly restored on login.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-[#3D342F] text-white text-xs font-bold hover:bg-[#2A2320] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Sign In to Learning Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
