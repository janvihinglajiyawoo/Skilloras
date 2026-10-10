import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Mic,
  Bell,
  Sparkles,
  Menu,
  X,
  BookOpen,
  Calendar,
  Zap,
  Bot,
  Layers,
  BarChart2,
  Video,
  User,
  Wifi,
  WifiOff,
  Cpu,
  Smartphone,
  Tablet,
  Laptop,
  Maximize2,
  PlayCircle,
} from 'lucide-react';
import { useStudent, AppView } from '../context/StudentContext';
import { VoiceSearchModal } from './VoiceSearchModal';

export const Navbar: React.FC = () => {
  const {
    student,
    activeView,
    setActiveView,
    unreadNotificationCount,
    searchQuery,
    setSearchQuery,
    isOfflineMode,
    toggleOfflineMode,
    isBrowserOnline,
    ollamaStatus,
    setIsOllamaModalOpen,
    setActiveNoteFilter,
    deviceScene,
    setDeviceScene,
    setShowOnboarding,
  } = useStudent();

  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      if (lower.includes('python')) {
        setActiveNoteFilter({ subject: 'Python Programming', noteId: 'note-python-memory' });
      } else if (lower.includes('os') || lower.includes('operating')) {
        setActiveNoteFilter({ subject: 'Operating Systems', noteId: 'note-process-states' });
      } else if (lower.includes('normalization')) {
        setActiveNoteFilter({ subject: 'DBMS', noteId: 'note-normalization' });
      } else if (lower.includes('join') || lower.includes('sql')) {
        setActiveNoteFilter({ subject: 'DBMS', noteId: 'note-sql-joins' });
      }
      setActiveView('notes');
    }
  };

  const navLinks: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'roadmap', label: 'Roadmap', icon: <Calendar className="w-4 h-4" /> },
    { id: 'practice', label: 'Practice', icon: <Zap className="w-4 h-4" /> },
    { id: 'tutor', label: 'AI Tutor', icon: <Bot className="w-4 h-4" /> },
    { id: 'notes', label: 'Notes & Visuals', icon: <Layers className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-4 h-4" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EAE5DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Brand Emblem */}
            <div
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer shrink-0"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#3D342F] text-white flex items-center justify-center shadow-xs">
                <GraduationCap className="w-5 h-5 text-[#FAF7F2]" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-[#292524] flex items-center gap-1">
                  Skillora
                  <Sparkles className="w-3.5 h-3.5 text-[#E87A5D]" />
                </span>
                <span className="text-[10px] text-[#78716C] font-semibold hidden sm:block">
                  Semester 6
                </span>
              </div>
            </div>

            {/* Center: Voice Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
                <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subjects, notes, quizzes..."
                  className="w-full bg-white border border-[#EAE5DC] rounded-2xl pl-10 pr-10 py-2 text-xs text-[#292524] placeholder-[#A8A29E] focus:outline-hidden focus:ring-2 focus:ring-[#3D342F]/20 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setIsVoiceSearchOpen(true)}
                  className="absolute right-2.5 w-6 h-6 rounded-lg bg-[#FAF7F2] text-[#78716C] hover:text-[#3D342F] flex items-center justify-center transition-colors cursor-pointer"
                  title="Voice Search (English, Hindi, Gujarati)"
                >
                  <Mic className="w-3.5 h-3.5 text-[#E87A5D]" />
                </button>
              </form>
            </div>

            {/* Right: Actions, Offline Mode, Notifications & Profile */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Online/Offline Mode Toggle Badge */}
              <button
                type="button"
                onClick={() => setIsOllamaModalOpen(true)}
                className={`px-2.5 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0 ${
                  isOfflineMode
                    ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                }`}
                title="Click to configure Ollama and Offline Local AI"
              >
                {isOfflineMode ? (
                  <>
                    <Cpu className="w-3.5 h-3.5 text-amber-700" />
                    <span className="hidden sm:inline">Offline (Local AI)</span>
                    <span className="sm:hidden">Offline</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="hidden sm:inline">Online (Cloud AI)</span>
                    <span className="sm:hidden">Online</span>
                  </>
                )}
              </button>

              {/* Voice search button for mobile */}
              <button
                type="button"
                onClick={() => setIsVoiceSearchOpen(true)}
                className="md:hidden w-9 h-9 rounded-2xl bg-white border border-[#EAE5DC] flex items-center justify-center text-[#78716C] hover:text-[#292524] cursor-pointer shadow-2xs"
                title="Voice Search"
              >
                <Mic className="w-4 h-4 text-[#E87A5D]" />
              </button>

              {/* Notifications Bell */}
              <button
                onClick={() => setActiveView('notifications')}
                className="w-9 h-9 rounded-2xl bg-white border border-[#EAE5DC] flex items-center justify-center text-[#44403C] hover:bg-[#FAF7F2] transition-colors relative cursor-pointer shadow-2xs"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadNotificationCount > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#44403C] absolute top-2 right-2 ring-2 ring-white" />
                )}
              </button>

              {/* Student Avatar */}
              <button
                onClick={() => setActiveView('profile')}
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-xs font-bold transition-transform hover:scale-105 cursor-pointer shadow-xs"
                style={{ backgroundColor: student?.avatarBgColor || '#3D342F' }}
                title={`${student?.name || 'Student Profile'} (${student?.role || 'BCA'})`}
              >
                {student?.initials || 'PK'}
              </button>

              {/* Mobile hamburger menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-9 h-9 rounded-2xl bg-white border border-[#EAE5DC] flex items-center justify-center text-[#44403C] hover:bg-[#FAF7F2] cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Link Row */}
          <nav className="hidden lg:flex items-center justify-between py-2 border-t border-[#F2ECE1]">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {navLinks.map((tab) => {
                const isActive = activeView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-[#3D342F] text-white shadow-2xs'
                        : 'text-[#78716C] hover:text-[#292524] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right side: Device Scene Switcher & Intro Replay */}
            <div className="flex items-center gap-2 pl-4 shrink-0">
              <div className="flex items-center gap-1 bg-[#EAE5DC]/70 p-1 rounded-xl text-[11px] font-bold text-[#44403C]">
                <span className="text-[10px] text-[#78716C] px-1.5 uppercase font-extrabold tracking-wider hidden xl:inline">
                  Scene:
                </span>
                <button
                  type="button"
                  onClick={() => setDeviceScene('responsive')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                    deviceScene === 'responsive'
                      ? 'bg-white text-[#292524] shadow-2xs font-extrabold'
                      : 'text-[#78716C] hover:text-[#292524]'
                  }`}
                  title="Full Screen Responsive View"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden xl:inline">Full</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceScene('mobile')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                    deviceScene === 'mobile'
                      ? 'bg-white text-[#292524] shadow-2xs font-extrabold'
                      : 'text-[#78716C] hover:text-[#292524]'
                  }`}
                  title="Mobile Phone Simulation (390 × 844)"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceScene('tablet')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                    deviceScene === 'tablet'
                      ? 'bg-white text-[#292524] shadow-2xs font-extrabold'
                      : 'text-[#78716C] hover:text-[#292524]'
                  }`}
                  title="Tablet iPad Simulation (768 × 1024)"
                >
                  <Tablet className="w-3 h-3" />
                  <span>Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceScene('laptop')}
                  className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                    deviceScene === 'laptop'
                      ? 'bg-white text-[#292524] shadow-2xs font-extrabold'
                      : 'text-[#78716C] hover:text-[#292524]'
                  }`}
                  title="Laptop Screen Simulation (1024 × 680)"
                >
                  <Laptop className="w-3 h-3" />
                  <span>Laptop</span>
                </button>
              </div>

              {/* Replay Onboarding Button */}
              <button
                type="button"
                onClick={() => setShowOnboarding(true)}
                className="px-2.5 py-1 rounded-xl bg-white border border-[#EAE5DC] text-[11px] font-bold text-[#78716C] hover:text-[#292524] hover:bg-[#FAF7F2] transition-colors flex items-center gap-1 cursor-pointer"
                title="Replay Skillora Animated Splash & Onboarding Screens"
              >
                <PlayCircle className="w-3.5 h-3.5 text-[#E87A5D]" />
                <span className="hidden xl:inline">Skillora Intro</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile slide-down menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#EAE5DC] bg-[#FAF7F2] px-4 py-3 space-y-3">
            <div className="space-y-1">
              {navLinks.map((tab) => {
                const isActive = activeView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveView(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#3D342F] text-white shadow-xs'
                        : 'text-[#44403C] hover:bg-white'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Device Scene Switcher in Mobile menu */}
            <div className="pt-2 border-t border-[#EAE5DC]">
              <div className="text-[10px] font-extrabold uppercase text-[#78716C] mb-2 px-1">
                Device Preview Scene
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeviceScene('responsive');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer ${
                    deviceScene === 'responsive'
                      ? 'bg-[#3D342F] text-white border-[#3D342F]'
                      : 'bg-white text-[#44403C] border-[#EAE5DC]'
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Screen</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeviceScene('mobile');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer ${
                    deviceScene === 'mobile'
                      ? 'bg-[#3D342F] text-white border-[#3D342F]'
                      : 'bg-white text-[#44403C] border-[#EAE5DC]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile (390px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeviceScene('tablet');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer ${
                    deviceScene === 'tablet'
                      ? 'bg-[#3D342F] text-white border-[#3D342F]'
                      : 'bg-white text-[#44403C] border-[#EAE5DC]'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet (768px)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeviceScene('laptop');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer ${
                    deviceScene === 'laptop'
                      ? 'bg-[#3D342F] text-white border-[#3D342F]'
                      : 'bg-white text-[#44403C] border-[#EAE5DC]'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Laptop (1024px)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowOnboarding(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full mt-2.5 p-2 rounded-xl bg-white border border-[#EAE5DC] text-xs font-bold text-[#3D342F] flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <PlayCircle className="w-4 h-4 text-[#E87A5D]" />
                <span>Replay Skillora Splash & Onboarding</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        initialLanguage={student?.language || 'English'}
        onSearch={(q) => {
          setSearchQuery(q);
          const lower = q.toLowerCase();
          if (lower.includes('python')) {
            setActiveNoteFilter({ subject: 'Python Programming', noteId: 'note-python-memory' });
          } else if (lower.includes('os') || lower.includes('operating')) {
            setActiveNoteFilter({ subject: 'Operating Systems', noteId: 'note-process-states' });
          } else if (lower.includes('normalization')) {
            setActiveNoteFilter({ subject: 'DBMS', noteId: 'note-normalization' });
          } else if (lower.includes('join') || lower.includes('sql')) {
            setActiveNoteFilter({ subject: 'DBMS', noteId: 'note-sql-joins' });
          }
          setActiveView('notes');
        }}
      />
    </>
  );
};
